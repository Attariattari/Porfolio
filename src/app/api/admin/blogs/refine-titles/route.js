import { NextResponse } from "next/server";
import { refineAndModernizeTitles } from "@/lib/ai/blog/titleRefinementEngine";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { includeTodayBlogs = true, includeQueuedTopics = true, dryRun = true } = body;

    const result = await refineAndModernizeTitles({
      includeTodayBlogs,
      includeQueuedTopics,
      dryRun,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[RefineTitlesAPI] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refine titles" },
      { status: 500 }
    );
  }
}
