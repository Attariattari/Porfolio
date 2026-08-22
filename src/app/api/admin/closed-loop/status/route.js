import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ContentPerformanceSnapshot } from "@/models/ContentPerformanceSnapshot";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";

export async function GET() {
  try {
    const isEnabled = String(process.env.CLOSED_LOOP_INTELLIGENCE_ENABLED || "true").toLowerCase() !== "false";

    await dbConnect();
    const snapshotCount = await ContentPerformanceSnapshot.countDocuments({});
    const emergingWinnersCount = await ContentPerformanceSnapshot.countDocuments({ performanceState: "emerging_winner" });
    const searchOpportunitiesCount = await ContentPerformanceSnapshot.countDocuments({ performanceState: "search_opportunity" });
    const contentDecayCount = await ContentPerformanceSnapshot.countDocuments({ performanceState: "content_decay" });
    const serviceOpportunitiesCount = await ServiceOpportunity.countDocuments({ status: "candidate" });

    return NextResponse.json({
      success: true,
      enabled: isEnabled,
      performanceSnapshots: {
        totalSnapshots: snapshotCount,
        emergingWinnersCount,
        searchOpportunitiesCount,
        contentDecayCount,
      },
      serviceOpportunitiesCount,
      status: isEnabled ? "active" : "disabled",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ClosedLoopStatusRoute] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch closed-loop intelligence status",
        status: "degraded",
      },
      { status: 500 }
    );
  }
}
