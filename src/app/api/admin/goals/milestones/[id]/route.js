import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// PATCH milestone
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { id } = await params;
    const updated = await GoalController.updateMilestone(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "GOALS_MILESTONES",
      details: `Updated milestone: ${updated.title}`,
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API] PATCH /api/admin/goals/milestones/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE milestone
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "delete")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await GoalController.deleteMilestone(id);

    await ActivityController.logFromSession(session, {
      action: "DELETE",
      module: "GOALS_MILESTONES",
      details: `Deleted milestone`,
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    console.error("[API] DELETE /api/admin/goals/milestones/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
