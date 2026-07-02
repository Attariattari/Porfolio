import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET all goals (Admin - all statuses)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "read")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const goals = await GoalController.getAllGoals(false); // All, not just published
    return NextResponse.json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/goals error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE new goal
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "create")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have 'create' permission for goals." },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate progress
    if (body.progress !== undefined && (body.progress < 0 || body.progress > 100)) {
      return NextResponse.json(
        { success: false, error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatuses = ["planned", "in-progress", "completed", "paused", "cancelled"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate priority enum
    const validPriorities = ["low", "medium", "high", "critical"];
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json(
        { success: false, error: `Priority must be one of: ${validPriorities.join(", ")}` },
        { status: 400 }
      );
    }

    const newGoal = await GoalController.createGoal(body);

    // Log activity
    await ActivityController.logFromSession(session, {
      action: "CREATE",
      module: "GOALS",
      details: `Created goal: ${newGoal.title}`,
      targetId: newGoal._id,
    }).catch(() => {});

    return NextResponse.json(
      { success: true, data: newGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/admin/goals error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// PATCH - Reorder goals
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    if (!Array.isArray(body.goals)) {
      return NextResponse.json(
        { success: false, error: "Expected array of goals" },
        { status: 400 }
      );
    }

    const reordered = await GoalController.reorderGoals(body.goals);

    await ActivityController.logFromSession(session, {
      action: "UPDATE",
      module: "GOALS",
      details: `Reordered ${reordered.length} goals`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: reordered,
    });
  } catch (error) {
    console.error("[API] PATCH /api/admin/goals error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
