import { NextResponse } from "next/server";
import { Blog } from "@/models/Portfolio";
import { validateBlogImageUploadToken } from "@/lib/server/blogImageUploadToken";
import { generateAndSaveSocialKit } from "@/lib/ai/blog/generateSocialKit";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import dbConnect from "@/lib/dbConnect";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request, { params }) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`blog-social-kit-get:${ip}`, {
    maxRequests: 20,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { token } = await params;
  const tokenResult = await validateBlogImageUploadToken(token);

  if (!tokenResult.valid) {
    return NextResponse.json(
      { success: false, message: "Secure link is no longer valid." },
      { status: tokenResult.code === "EXPIRED" ? 410 : 400 }
    );
  }

  await dbConnect();
  const blog = await Blog.findById(tokenResult.blog._id);
  if (!blog) {
    return NextResponse.json({ success: false, message: "Blog not found." }, { status: 404 });
  }

  let socialKit = blog.socialKit;

  if (!socialKit || socialKit.status !== "ready" || !socialKit.linkedin) {
    try {
      socialKit = await generateAndSaveSocialKit(blog._id);
    } catch (err) {
      console.warn("[SocialKit Token Route] Generation warning:", err.message);
    }
  }

  return NextResponse.json({
    success: true,
    blogId: blog._id.toString(),
    blogTitle: blog.title,
    blogSlug: blog.slug,
    socialKit: socialKit || null,
  });
}

export async function POST(request, { params }) {
  return GET(request, { params });
}
