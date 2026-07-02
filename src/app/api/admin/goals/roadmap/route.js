import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// GET all roadmap items
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "read")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const roadmap = await GoalController.getAllRoadmap(false);
    return NextResponse.json({
      success: true,
      count: roadmap.length,
      data: roadmap,
    });
  } catch (error) {
    console.error("[API] GET /api/admin/goals/roadmap error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// CREATE roadmap item
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

    if (!body.year) {
      return NextResponse.json(
        { success: false, error: "Year is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["upcoming", "in-progress", "completed", "delayed"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const newItem = await GoalController.createRoadmapItem(body);

    await ActivityController.logFromSession(session, {
      action: "CREATE",
      module: "GOALS_ROADMAP",
      details: `Created roadmap item: ${newItem.title}`,
      targetId: newItem._id,
    }).catch(() => {});

    return NextResponse.json(
      { success: true, data: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/admin/goals/roadmap error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
