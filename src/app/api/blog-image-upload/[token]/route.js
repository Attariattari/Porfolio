import { NextResponse } from "next/server";
import { Blog } from "@/models/Portfolio";
import { getAuthSession } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  markBlogImageUploadLinkUsed,
  validateBlogImageUploadToken,
} from "@/lib/server/blogImageUploadToken";
import {
  uploadBlogImageToCloudinary,
  validateBlogImageFile,
} from "@/lib/server/cloudinary/uploadBlogImage";
import { cacheManager } from "@/lib/cache";
import { emitSocketEvent } from "@/lib/socket";
import { ActivityController } from "@/controllers/ActivityController";
import { revalidatePath } from "next/cache";
import { triggerFeaturedUpdate } from "@/lib/ai/featuredEngine";

function isSuperAdmin(session) {
  return session?.role === "super-admin" || session?.role === "root-super-admin";
}

export async function POST(request, { params }) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`blog-upload-post:${ip}`, {
    maxRequests: 8,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
      { status: 429 },
    );
  }

  const session = await getAuthSession();
  if (!isSuperAdmin(session)) {
    return NextResponse.json(
      { success: false, code: "SUPER_ADMIN_REQUIRED", message: "Super Admin login required." },
      { status: 403 },
    );
  }

  const { token } = await params;
  const tokenResult = await validateBlogImageUploadToken(token);
  if (!tokenResult.valid) {
    return NextResponse.json(
      { success: false, code: tokenResult.code, message: "Secure upload link is no longer valid." },
      { status: tokenResult.code === "EXPIRED" ? 410 : 400 },
    );
  }

  if (
    tokenResult.link.targetEmail &&
    session.email?.toLowerCase() !== tokenResult.link.targetEmail.toLowerCase()
  ) {
    return NextResponse.json(
      { success: false, code: "EMAIL_MISMATCH", message: "This secure link belongs to another Super Admin email." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("image");
  const validation = validateBlogImageFile(file);

  if (!validation.ok) {
    return NextResponse.json(
      { success: false, code: "INVALID_FILE", message: validation.message },
      { status: 400 },
    );
  }

  try {
    const uploaded = await uploadBlogImageToCloudinary(file, {
      folder: "Muhyo-Tech/blogs",
    });

    const updatedBlog = await Blog.findByIdAndUpdate(
      tokenResult.blog._id,
      {
        image: uploaded.url,
        imageGenerated: false,
        imageStatus: "uploaded",
        publishStatus: "published",
        imageGenerationError: undefined,
        featuredImage: {
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt:
            tokenResult.blog.featuredImage?.alt ||
            `${tokenResult.blog.title} blog cover image`,
          width: uploaded.width,
          height: uploaded.height,
          source: "manual_upload",
        },
        imageUploadedBy: session.email,
        imageUploadedAt: new Date(),
      },
      { new: true },
    );

    await markBlogImageUploadLinkUsed(tokenResult.link, session.email);
    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "BLOGS",
      details: `Uploaded manual image for blog: ${updatedBlog.title}`,
      targetId: updatedBlog._id,
    }).catch(() => {});
    await cacheManager.invalidateByTag("blogs");
    await triggerFeaturedUpdate(updatedBlog);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedBlog.slug}`);
    emitSocketEvent("blog:image-uploaded", {
      blogId: updatedBlog._id.toString(),
    });
    emitSocketEvent("blog:updated", { blogId: updatedBlog._id.toString() });

    return NextResponse.json({
      success: true,
      message: "Blog image uploaded successfully.",
      imageUrl: uploaded.url,
    });
  } catch (error) {
    console.error("[BlogImageUpload] Safe upload failure:", error.message);
    return NextResponse.json(
      { success: false, code: "UPLOAD_FAILED", message: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}
