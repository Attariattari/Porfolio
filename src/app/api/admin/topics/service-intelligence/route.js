import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { matchTopicToServices } from "@/lib/ai/intelligence/services/serviceTopicMatcherEngine";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view topic service intelligence." },
        { status: 403 }
      );
    }

    const topicCandidate = await request.json().catch(() => ({}));
    if (!topicCandidate || (!topicCandidate.title && !topicCandidate.topic)) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: 'title' or 'topic'." },
        { status: 400 }
      );
    }

    const matchedResult = await matchTopicToServices(topicCandidate);

    return NextResponse.json({
      success: true,
      data: matchedResult,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate topic service intelligence." },
      { status: 500 }
    );
  }
}
