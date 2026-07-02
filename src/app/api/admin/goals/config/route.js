import { NextResponse } from "next/server";
import { GoalController } from "@/controllers/GoalController";
import dbConnect from "@/lib/dbConnect";
import { GoalsConfig } from "@/models/Portfolio";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getAuthSession();
        if (!checkPermission(session, "goals", "read")) {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 }, );
        }

        await dbConnect();
        let config = await GoalsConfig.findOne({}).lean();
        if (!config) {
            config = await GoalsConfig.create({ healthMode: "auto" });
        }
        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 }, );
    }
}

export async function PATCH(request) {
    try {
        const session = await getAuthSession();
        if (!checkPermission(session, "goals", "edit")) {
            return NextResponse.json({ success: false, error: "Access Denied" }, { status: 403 }, );
        }

        await dbConnect();
        const data = await request.json();
        const config = await GoalsConfig.findOneAndUpdate({}, data, {
            new: true,
            upsert: true,
        }).lean();
        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 }, );
    }
}