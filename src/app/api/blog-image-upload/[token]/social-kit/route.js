import { NextResponse } from "next/server";
import { Blog } from "@/models/Portfolio";
import { validateBlogImageUploadToken } from "@/lib/server/blogImageUploadToken";
import {
  generateAndSaveSocialKit,
  validateShareReadySocialKit,
} from "@/lib/ai/blog/generateSocialKit";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { getAuthSession } from "@/lib/auth";
import { serializeDoc } from "@/lib/mongooseHelper";
import dbConnect from "@/lib/dbConnect";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Shared token auth ────────────────────────────────────────────────────────
async function authorizeToken(request, params) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`blog-social-kit:${ip}`, {
    maxRequests: 20,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return {
      error: NextResponse.json(
        { success: false, message: "Too many requests. Please try again shortly." },
        { status: 429 }
      ),
    };
  }

  const { token } = await params;
  const tokenResult = await validateBlogImageUploadToken(token);
  if (!tokenResult.valid) {
    return {
      error: NextResponse.json(
        { success: false, message: "Secure link is no longer valid." },
        { status: tokenResult.code === "EXPIRED" ? 410 : 400 }
      ),
    };
  }

  // Also require the user to be a logged-in admin
  const session = await getAuthSession();
  const isAdmin =
    session?.role === "admin" ||
    session?.role === "super-admin" ||
    session?.role === "root-super-admin";
  if (!session || !isAdmin) {
    return {
      error: NextResponse.json(
        { success: false, message: "Admin login required." },
        { status: 401 }
      ),
    };
  }

  return { token, tokenResult, session };
}

// ─── GET: Fetch or auto-generate social kit ───────────────────────────────────
export async function GET(request, { params }) {
  const auth = await authorizeToken(request, params);
  if (auth.error) return auth.error;

  await dbConnect();
  const blog = await Blog.findById(auth.tokenResult.blog._id);
  if (!blog) {
    return NextResponse.json({ success: false, message: "Blog not found." }, { status: 404 });
  }

  let socialKit = blog.socialKit;

  // Auto-generate if kit is missing or incomplete
  if (!socialKit || socialKit.status !== "ready" || !socialKit.linkedin) {
    try {
      socialKit = await generateAndSaveSocialKit(blog._id, { useAI: true });
    } catch (err) {
      console.warn("[SocialKit Token Route] Generation warning:", err.message);
    }
  }

  return NextResponse.json({
    success: true,
    blogId: blog._id.toString(),
    blogTitle: blog.title,
    blogSlug: blog.slug,
    socialKit: socialKit ? serializeDoc(socialKit) : null,
  });
}

// ─── POST: Regenerate social kit with optional feedback ──────────────────────
export async function POST(request, { params }) {
  const auth = await authorizeToken(request, params);
  if (auth.error) return auth.error;

  await dbConnect();
  const blog = await Blog.findById(auth.tokenResult.blog._id);
  if (!blog) {
    return NextResponse.json({ success: false, message: "Blog not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const feedback = String(body.feedback || "").trim();

  const kit = await generateAndSaveSocialKit(blog._id, { useAI: true, feedback });

  return NextResponse.json({ success: true, data: serializeDoc(kit) });
}

// ─── PATCH: Save manually edited posts ───────────────────────────────────────
export async function PATCH(request, { params }) {
  const auth = await authorizeToken(request, params);
  if (auth.error) return auth.error;

  await dbConnect();
  const blog = await Blog.findById(auth.tokenResult.blog._id);
  if (!blog) {
    return NextResponse.json({ success: false, message: "Blog not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const allPlatforms = ["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram", "devto"];
  const posts = Object.fromEntries(
    allPlatforms.map((key) => [key, String(body[key] || "").trim()])
  );

  if (Object.values(posts).some((value) => !value)) {
    return NextResponse.json(
      { success: false, error: "All seven social posts are required to save." },
      { status: 400 }
    );
  }

  if (posts.x.length > 280) {
    return NextResponse.json(
      { success: false, error: "X post must be 280 characters or fewer." },
      { status: 400 }
    );
  }

  try {
    validateShareReadySocialKit(posts, blog);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }

  blog.socialKit = {
    ...(blog.socialKit?.toObject?.() || blog.socialKit || {}),
    ...posts,
    status: "ready",
    source: "manual",
    imageUrl: blog.featuredImage?.url || blog.image || "",
    updatedAt: new Date(),
    error: "",
  };
  await blog.save();

  return NextResponse.json({ success: true, data: serializeDoc(blog.socialKit) });
}
