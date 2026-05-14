import { NextResponse } from "next/server";
import { NewsletterLog } from "@/models/NewsletterLog";
import { getAuthSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!session || session.role !== "super-admin") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const logs = await NewsletterLog.find()
            .sort({ sentAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
