import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import Booking from "@/models/Booking";
import { ServicePerformanceSnapshot } from "@/models/ServicePerformanceSnapshot";
import {
  calculateServiceHealth,
  detectServicePerformanceGapsAndRecommendations,
  feedPerformanceInsightsToTopicSystem,
} from "@/lib/ai/intelligence/services/servicePerformanceEngine";
import { getServiceIntelligenceSnapshotSync } from "@/lib/ai/intelligence/services/serviceIntelligenceSnapshot";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view performance intelligence." },
        { status: 403 }
      );
    }

    await dbConnect();
    const services = await Service.find({}).lean().catch(() => []);
    const blogs = await Blog.find({}).lean().catch(() => []);
    const bookings = await Booking.find({}).lean().catch(() => []);
    const catalog = services.length > 0 ? services : getServiceIntelligenceSnapshotSync();

    const catalogHealthReports = [];
    const allRecommendations = [];

    for (const service of catalog) {
      const health = calculateServiceHealth(service.slug, { blogs, bookings, existingServicesSnapshot: catalog });
      catalogHealthReports.push(health);

      const gapAnalysis = detectServicePerformanceGapsAndRecommendations(service.slug, { blogs, bookings, existingServicesSnapshot: catalog });
      allRecommendations.push(...gapAnalysis.recommendations);
    }

    const topicQueueOpportunities = feedPerformanceInsightsToTopicSystem(allRecommendations);

    return NextResponse.json({
      success: true,
      catalogHealthReports,
      totalServices: catalog.length,
      recommendationQueue: allRecommendations,
      topicQueueOpportunities,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service performance metrics." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "edit")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to capture performance snapshots." },
        { status: 403 }
      );
    }

    await dbConnect();
    const services = await Service.find({}).lean().catch(() => []);
    const blogs = await Blog.find({}).lean().catch(() => []);
    const catalog = services.length > 0 ? services : getServiceIntelligenceSnapshotSync();

    const createdSnapshots = [];

    for (const service of catalog) {
      const health = calculateServiceHealth(service.slug, { blogs, existingServicesSnapshot: catalog });
      const gapAnalysis = detectServicePerformanceGapsAndRecommendations(service.slug, { blogs, existingServicesSnapshot: catalog });

      const snapshot = await ServicePerformanceSnapshot.create({
        serviceSlug: service.slug,
        period: "30d",
        contentMetrics: { supportingBlogCount: health.supportingBlogCount },
        topicMetrics: { coverageScore: health.topicCoverageScore },
        scores: health.scores,
        healthClassification: health.healthClassification,
        recommendationsGeneratedCount: gapAnalysis.recommendations.length,
      }).catch(() => null);

      if (snapshot) createdSnapshots.push(snapshot);
    }

    return NextResponse.json({
      success: true,
      message: `Performance cycle complete. Captured ${createdSnapshots.length} service performance snapshots.`,
      createdSnapshotsCount: createdSnapshots.length,
      capturedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute performance intelligence cycle." },
      { status: 500 }
    );
  }
}
