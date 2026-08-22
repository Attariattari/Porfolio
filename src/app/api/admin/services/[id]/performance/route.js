import { NextResponse } from "next/server";
import { getAuthSession, checkPermission } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import Booking from "@/models/Booking";
import { ServicePerformanceSnapshot } from "@/models/ServicePerformanceSnapshot";
import {
  calculateServiceHealth,
  calculateServicePerformanceTrend,
  detectServicePerformanceGapsAndRecommendations,
} from "@/lib/ai/intelligence/services/servicePerformanceEngine";

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "services", "view")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: You do not have permission to view service performance." },
        { status: 403 }
      );
    }

    const { id } = params;
    await dbConnect();

    let serviceDoc = await Service.findById(id).lean().catch(() => null);
    if (!serviceDoc) {
      serviceDoc = await Service.findOne({ slug: id }).lean().catch(() => null);
    }

    const targetSlug = serviceDoc?.slug || id;

    const blogs = await Blog.find({}).lean().catch(() => []);
    const bookings = await Booking.find({}).lean().catch(() => []);
    const snapshots = await ServicePerformanceSnapshot.find({ serviceSlug: targetSlug }).sort({ capturedAt: 1 }).lean().catch(() => []);

    const health = calculateServiceHealth(targetSlug, { blogs, bookings });
    const trend = calculateServicePerformanceTrend(targetSlug, snapshots);
    const gapAnalysis = detectServicePerformanceGapsAndRecommendations(targetSlug, { blogs, bookings });

    return NextResponse.json({
      success: true,
      serviceSlug: targetSlug,
      serviceTitle: serviceDoc?.title || targetSlug,
      health,
      trend,
      recommendations: gapAnalysis.recommendations,
      snapshotsHistoryCount: snapshots.length,
      snapshotsHistory: snapshots.slice(-5),
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service detail performance." },
      { status: 500 }
    );
  }
}
