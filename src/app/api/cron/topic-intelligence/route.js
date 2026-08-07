import { NextResponse } from "next/server";
import { discoverVerifiedTrends } from "@/lib/ai/blog/trendIntelligence";
import { maintainProfessionalTopicReserve } from "@/lib/ai/blog/maintainTopicReserve";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const reserve = await maintainProfessionalTopicReserve();
  const results = { settings: reserve.settings, trends: null, core: reserve.core, authority: reserve.authority };
  const now = new Date();
  const shouldScanTrends = now.getUTCMinutes() < 10 && now.getUTCHours() % 6 === 0;
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
  return NextResponse.json({ success, nextReserveCheckInMinutes: 10, results }, { status: success ? 200 : 500 });
}
