import { NextResponse } from "next/server";
import { verifyCronCaller } from "@/lib/cron/cronAuth";
import { discoverVerifiedTrends } from "@/lib/ai/blog/trendIntelligence";
import { maintainProfessionalTopicReserve } from "@/lib/ai/blog/maintainTopicReserve";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const auth = await verifyCronCaller(request, { permissionModule: "blogs" });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const reserve = await maintainProfessionalTopicReserve();
  const results = { settings: reserve.settings, trends: null, core: reserve.core, authority: reserve.authority };
  const now = new Date();
  const isCron = Boolean(request.headers.get("x-vercel-cron") || request.headers.get("authorization"));
  const shouldScanTrends = isCron || now.getUTCHours() % 6 === 0;
  if (shouldScanTrends) {
    try {
      results.trends = await discoverVerifiedTrends({ maxTopics: 2 });
    } catch (error) {
      results.trends = { success: false, message: error.message };
    }
  } else {
    results.trends = { success: true, skipped: true, message: "Official trend scan runs once every six hours." };
  }
  const success = results.trends?.success !== false && results.core?.success !== false && results.authority?.success !== false;
  return NextResponse.json({ success, nextReserveCheckInMinutes: 1440, results }, { status: success ? 200 : 500 });
}
