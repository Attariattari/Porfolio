import { NextResponse } from "next/server";
import { runPerformanceIntelligenceCycle } from "@/lib/ai/intelligence/performance/performanceCollector";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const isEnabled = String(process.env.PHASE8_PERFORMANCE_INTELLIGENCE_ENABLED || "true").toLowerCase() !== "false";
    const result = await runPerformanceIntelligenceCycle({ enablePerformance: isEnabled });

    return NextResponse.json(
      {
        success: true,
        enabled: isEnabled,
        result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PerformanceCronRoute] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute performance intelligence sync",
        status: "degraded",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await runPerformanceIntelligenceCycle({
      enablePerformance: true,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    });

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger performance sync" },
      { status: 500 }
    );
  }
}
