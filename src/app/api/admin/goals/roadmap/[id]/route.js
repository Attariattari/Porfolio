import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// PATCH roadmap item
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

    const validStatuses = ["upcoming", "in-progress", "completed", "delayed"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await GoalController.updateRoadmapItem(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Roadmap item not found" },
        { status: 404 }
      );
    }

    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "GOALS_ROADMAP",
      details: `Updated roadmap item: ${updated.title}`,
      targetId: params.id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API] PATCH /api/admin/goals/roadmap/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE roadmap item
export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "delete")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    await GoalController.deleteRoadmapItem(params.id);

    await ActivityController.logFromSession(session, {
      action: "DELETE",
      module: "GOALS_ROADMAP",
      details: `Deleted roadmap item`,
      targetId: params.id,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Roadmap item deleted successfully",
    });
  } catch (error) {
    console.error("[API] DELETE /api/admin/goals/roadmap/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
