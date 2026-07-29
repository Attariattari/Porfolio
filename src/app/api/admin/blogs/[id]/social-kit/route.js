import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { generateAndSaveSocialKit, validateShareReadySocialKit } from "@/lib/ai/blog/generateSocialKit";
import { cacheManager } from "@/lib/cache";
import { serializeDoc } from "@/lib/mongooseHelper";

export const runtime = "nodejs";
export const maxDuration = 180;

const canEdit = (session) =>
  ["super-admin", "root-super-admin"].includes(session?.role) || checkPermission(session, "blogs", "edit");

async function authorize(request) {
  const session = await getAuthSession();
  if (!canEdit(session)) return { error: NextResponse.json({ success: false, error: "Access denied." }, { status: 403 }) };
  const limit = await checkRateLimit(`admin-social-kit:${getClientIP(request)}`, { maxRequests: 20, windowMs: 60 * 1000 });
  if (!limit.allowed) return { error: NextResponse.json({ success: false, error: "Too many requests. Please try again shortly." }, { status: 429 }) };
  return { session };
}

export async function POST(request, { params }) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const kit = await generateAndSaveSocialKit(id, { useAI: true, feedback: body.feedback || "", platforms: body.platforms });
    return NextResponse.json({ success: true, data: serializeDoc(kit) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await authorize(request);
  if (auth.error) return auth.error;
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const posts = Object.fromEntries(["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram"].map((key) => [key, String(body[key] || "").trim()]));
    if (Object.values(posts).some((value) => !value)) {
      return NextResponse.json({ success: false, error: "All six social posts are required." }, { status: 400 });
    }
    if (posts.x.length > 280) {
      return NextResponse.json({ success: false, error: "X post must be 280 characters or fewer." }, { status: 400 });
    }
    const blog = await Blog.findById(id);
    if (!blog) return NextResponse.json({ success: false, error: "Blog not found." }, { status: 404 });
    validateShareReadySocialKit(posts, blog);
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
    await cacheManager.invalidateByTag("blogs");
    return NextResponse.json({ success: true, data: serializeDoc(blog.socialKit) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
