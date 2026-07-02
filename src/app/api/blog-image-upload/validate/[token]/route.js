import { NextResponse } from "next/server";
import { validateBlogImageUploadToken } from "@/lib/server/blogImageUploadToken";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

function safeError(code) {
  const messages = {
    EXPIRED:
      "This secure upload link has expired. Please log in to the admin dashboard to upload the blog image or generate a new secure link.",
    USED: "This secure upload link has already been used.",
    REVOKED: "This secure upload link has been revoked.",
  };

  return messages[code] || "This secure upload link is invalid.";
}

export async function GET(request, { params }) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`blog-upload-validate:${ip}`, {
    maxRequests: 20,
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

  const { token } = await params;
  const result = await validateBlogImageUploadToken(token);

  if (!result.valid) {
    return NextResponse.json(
      { success: false, code: result.code, message: safeError(result.code) },
      { status: result.code === "EXPIRED" ? 410 : 400 },
    );
  }

  return NextResponse.json({
    success: true,
    blogTitle: result.blog.title,
    blogSummary: result.blog.summary,
    imagePrompt: result.blog.imagePrompt || result.blog.image_prompt || "",
    negativePrompt: result.blog.imageNegativePrompt || "",
    expiresAt: result.link.expiresAt,
  });
}

