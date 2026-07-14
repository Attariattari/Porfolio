import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 },
      );
    }

    const body = await request.json();
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    const { id } = await params;
    const progress = await GoalController.updateRecentProgress(id, body);
    if (!progress) {
      return NextResponse.json(
        { success: false, error: "Progress update not found" },
        { status: 404 },
      );
    }

    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "GOALS_PROGRESS",
      details: `Updated recent progress: ${progress.title}`,
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("[API] PATCH /api/admin/goals/progress/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "delete")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await GoalController.deleteRecentProgress(id);

    await ActivityController.logFromSession(session, {
      action: "DELETE",
      module: "GOALS_PROGRESS",
      details: "Deleted recent progress update",
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Progress update deleted successfully",
    });
  } catch (error) {
    console.error("[API] DELETE /api/admin/goals/progress/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
