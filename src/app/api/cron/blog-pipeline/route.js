import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";
import { verifyCronCaller } from "@/lib/cron/cronAuth";
import { runDailyBlogPipeline } from "@/lib/cron/runDailyBlogPipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
    try {
        await dbConnect();

        const auth = await verifyCronCaller(request, { permissionModule: "blogs" });
        if (!auth.authorized) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Record Cron heartbeat if triggered by scheduler or cron service
        if (auth.source === "vercel-cron" || auth.source === "external-cron" || auth.source === "cron-service") {
            await SiteConfig.updateOne(
                {},
                {
                    $set: {
                        "blogAutomation.lastVercelCronAt": new Date(),
                        "blogAutomation.lastVercelCronStatus": "active",
                    },
                }
            ).catch((err) => console.error("[Cron Heartbeat Record Error]:", err.message));
        }

        const result = await runDailyBlogPipeline({
            baseUrl: new URL(request.url).origin,
            source: auth.source,
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
