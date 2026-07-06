import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "read")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 },
      );
    }

    const progress = await GoalController.getRecentProgress(false);
    return NextResponse.json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/goals/progress error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "create")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 },
      );
    }

    const body = await request.json();
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    const progress = await GoalController.createRecentProgress(body);

    await ActivityController.logFromSession(session, {
      action: "CREATE",
      module: "GOALS_PROGRESS",
      details: `Created recent progress update: ${progress.title}`,
      targetId: progress._id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: progress }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/admin/goals/progress error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
