import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ServiceOpportunity } from "@/models/ServiceOpportunity";
import { servicesSeedData } from "@/data/services.seed";

export async function GET() {
  try {
    const isEnabled = String(process.env.BLOG_SERVICE_INTELLIGENCE_ENABLED || "true").toLowerCase() !== "false";

    await dbConnect();
    const candidateCount = await ServiceOpportunity.countDocuments({ status: "candidate" });
    const totalOpportunities = await ServiceOpportunity.countDocuments({});

    const activeServices = servicesSeedData.map((s) => ({
      slug: s.slug,
      title: s.title,
      category: s.category,
    }));

    return NextResponse.json({
      success: true,
      enabled: isEnabled,
      activeServicesCount: activeServices.length,
      activeServices,
      serviceOpportunities: {
        candidateCount,
        totalOpportunities,
      },
      status: isEnabled ? "active" : "disabled",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ConversionIntelligenceStatusRoute] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch conversion intelligence status",
        status: "degraded",
      },
      { status: 500 }
    );
  }
}
