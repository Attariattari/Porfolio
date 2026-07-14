import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET single goal
export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "read")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const goal = await GoalController.getGoal(id);
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    console.error("[API] GET /api/admin/goals/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE goal
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

    // Validate input
    if (body.progress !== undefined && (body.progress < 0 || body.progress > 100)) {
      return NextResponse.json(
        { success: false, error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    const validStatuses = ["planned", "in-progress", "completed", "paused", "cancelled"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const validPriorities = ["low", "medium", "high", "critical"];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { success: false, error: `Priority must be one of: ${validPriorities.join(", ")}` },
        { status: 400 }
      );
    }

    const { id } = await params;
    const updated = await GoalController.updateGoal(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "GOALS",
      details: `Updated goal: ${updated.title}`,
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[API] PATCH /api/admin/goals/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE goal
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
    const goal = await GoalController.getGoal(id);
    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    await GoalController.deleteGoal(id);

    await ActivityController.logFromSession(session, {
      action: "DELETE",
      module: "GOALS",
      details: `Deleted goal: ${goal.title}`,
      targetId: id,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("[API] DELETE /api/admin/goals/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
