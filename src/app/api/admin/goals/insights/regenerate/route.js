import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function POST() {
    try {
        const session = await getAuthSession();
        if (!checkPermission(session, "goals", "edit")) {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 }, );
        }

        const insights = await GoalController.generateStrategicInsights(true);
        return NextResponse.json({ success: true, data: insights });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 }, );
    }
}