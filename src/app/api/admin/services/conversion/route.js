import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Blog from "@/models/Blog";
import { generateConversionStrategy } from "@/lib/ai/intelligence/conversionLinkingEngine";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view conversion intelligence." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { blog, topic, blogId } = body;

    let targetPayload = blog || topic || {};

    if (blogId) {
      await dbConnect();
      const dbBlog = await Blog.findById(blogId).lean();
      if (!dbBlog) {
        return NextResponse.json(
          { success: false, error: `Blog with ID '${blogId}' not found.` },
          { status: 404 }
        );
      }
      targetPayload = dbBlog;
    }

    if (!targetPayload.title) {
      return NextResponse.json(
        { success: false, error: "Missing required payload: 'blog', 'topic', or 'blogId' with title." },
        { status: 400 }
      );
    }

    const strategy = generateConversionStrategy(targetPayload);

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate conversion strategy." },
      { status: 500 }
    );
  }
}
