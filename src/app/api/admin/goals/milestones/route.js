import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET all milestones
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "read")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const milestones = await GoalController.getAllMilestones(false);
    return NextResponse.json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/goals/milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE milestone
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "create")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: "Date is required" },
        { status: 400 }
      );
    }

    const newMilestone = await GoalController.createMilestone(body);

    await ActivityController.logFromSession(session, {
      action: "CREATE",
      module: "GOALS_MILESTONES",
      details: `Created milestone: ${newMilestone.title}`,
      targetId: newMilestone._id,
    }).catch(() => {});

    return NextResponse.json(
      { success: true, data: newMilestone },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/admin/goals/milestones error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
