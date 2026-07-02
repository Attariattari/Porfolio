import { NextResponse } from "next/server";
import { Blog } from "@/models/Portfolio";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { ensureBlogImage } from "@/lib/ai/blog/ensureBlogImage";
import {
  generateBlogImagePrompt,
  isProfessionalImagePromptReady,
} from "@/lib/ai/blog/generateBlogImagePrompt";
import { createBlogImageUploadLink } from "@/lib/server/blogImageUploadToken";
import { sendBlogImagePromptEmail } from "@/lib/server/email/sendBlogImagePromptEmail";

function isSuperAdmin(session) {
  return session?.role === "super-admin" || session?.role === "root-super-admin";
}

function getSuperAdminEmail() {
  return process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
}

export async function POST(request, { params }) {
  const baseUrl = new URL(request.url).origin;
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`admin-blog-image:${ip}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const session = await getAuthSession();
  if (!isSuperAdmin(session) && !checkPermission(session, "blogs", "edit")) {
    return NextResponse.json(
      { success: false, message: "Access denied." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action || "regenerate";
  const blog = await Blog.findById(id);

  if (!blog) {
    return NextResponse.json(
      { success: false, message: "Blog not found." },
      { status: 404 },
    );
  }

  if (action === "regenerate") {
    blog.image = "";
    blog.featuredImage = undefined;
    blog.imageGenerated = false;
    blog.imageStatus = "pending";
    await blog.save();
    const result = await ensureBlogImage(blog._id, { baseUrl });
    return NextResponse.json({ success: true, status: result.status });
  }

  if (action === "send_prompt_email" || action === "create_upload_link") {
    const targetEmail = getSuperAdminEmail();
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, message: "Super Admin email is not configured." },
        { status: 400 },
      );
    }

    let imagePrompt = blog.imagePrompt
      ? {
          prompt: blog.imagePrompt,
          altText: blog.featuredImage?.alt || `${blog.title} blog cover image`,
          visualDirection: blog.imagePromptEnhanced || "",
          negativePrompt: blog.imageNegativePrompt || "",
        }
      : await generateBlogImagePrompt(blog);

    if (!isProfessionalImagePromptReady(imagePrompt)) {
      imagePrompt = await generateBlogImagePrompt(blog);
    }

    blog.imagePrompt = imagePrompt.prompt;
    blog.image_prompt = imagePrompt.prompt;
    blog.imagePromptEnhanced = imagePrompt.visualDirection;
    blog.imageNegativePrompt = imagePrompt.negativePrompt;
    blog.imageStatus = blog.imageStatus || "manual_required";
    await blog.save();

    const { rawToken, link } = await createBlogImageUploadLink({
      blog,
      targetEmail,
      createdBy: session.email,
    });

    if (action === "send_prompt_email") {
      const emailResult = await sendBlogImagePromptEmail({
        to: targetEmail,
        blog,
        imagePrompt,
        uploadToken: rawToken,
        expiresAt: link.expiresAt,
        baseUrl,
      });
      if (emailResult.success) {
        link.emailSentAt = new Date();
        await link.save();
      } else {
        return NextResponse.json(
          {
            success: false,
            message: emailResult.error || "Prompt email failed.",
            uploadLinkId: link._id.toString(),
          },
          { status: 502 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        action === "send_prompt_email"
          ? "Secure upload prompt email sent."
          : "Secure upload link created.",
      uploadLinkId: link._id.toString(),
      expiresAt: link.expiresAt,
    });
  }

  return NextResponse.json(
    { success: false, message: "Unsupported image action." },
    { status: 400 },
  );
}
