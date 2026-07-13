import { NextResponse } from "next/server";
import { runDailyBlogPipeline } from "@/lib/cron/runDailyBlogPipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
    try {
        if (process.env.CRON_SECRET) {
            const authorization = request.headers.get("authorization");
            if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
                return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
            }
        }

        const result = await runDailyBlogPipeline({
            baseUrl: new URL(request.url).origin,
            source: "primary",
            backlogLimit: 2,
        });

        return NextResponse.json(result, { status: result.success ? 200 : 500 });

    } catch (error) {
        console.error("Cron Route Error:", error);
        return NextResponse.json({
            success: false,
            message: "Cron execution failed",
            error: error.message
        }, { status: 500 });
    }
}
