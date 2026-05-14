import { NextResponse } from "next/server";
import { ActivityController } from "@/controllers/ActivityController";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const activities = await ActivityController.getRecent(15);
        return NextResponse.json({ success: true, data: activities });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
