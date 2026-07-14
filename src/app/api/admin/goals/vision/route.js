import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { getAuthSession, checkPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!checkPermission(session, "goals", "read")) {
    return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
  }

  try {
    return NextResponse.json({ success: true, data: await GoalController.getVision() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getAuthSession();
  if (!checkPermission(session, "goals", "edit")) {
    return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = await GoalController.updateVision({
      missionStatement: String(body.missionStatement || "").trim(),
      visionStatement: String(body.visionStatement || "").trim(),
      founderMessage: String(body.founderMessage || "").trim(),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
