import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession, checkPermission } from "@/lib/auth";

// POST - Import default goals from data.js
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "goals", "create")) {
      return NextResponse.json(
        { success: false, error: "Access Denied" },
        { status: 403 }
      );
    }

    const result = await GoalController.importDefaultGoals();

    await ActivityController.logFromSession(session, {
      action: "CREATE",
      module: "GOALS",
      details: `Imported default goals data: ${result.imported.goalsCount} goals, ${result.imported.roadmapCount} roadmap items, ${result.imported.milestonesCount} milestones`,
    }).catch(() => {});

    return NextResponse.json(
      { success: true, message: "Default goals data imported successfully", ...result },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] POST /api/admin/goals/import error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
