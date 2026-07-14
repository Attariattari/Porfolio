import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";
import {
  ANALYTICS_TIMEZONE,
  addAnalyticsIdentityStage,
  calculateGrowthRate,
  getUniqueCount,
  validVisitorIdentityStage,
} from "@/lib/analytics/visitorAnalytics";

export const dynamic = "force-dynamic";

const uniqueVisitorsPipeline = (match = null) => [
  ...(match ? [{ $match: match }] : []),
  addAnalyticsIdentityStage(),
  validVisitorIdentityStage(),
  { $group: { _id: "$analyticsVisitorId" } },
  { $count: "count" },
];

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized node traversal" },
        { status: 401 },
      );
    }

    await dbConnect();

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalPageViews,
      uniqueVisitorsData,
      last24VisitorsData,
      currentPeriodVisitorsData,
      previousPeriodVisitorsData,
      earliestVerifiedTracking,
      pageViewsData,
      monthlyTrendData,
    ] = await Promise.all([
      VisitorLog.countDocuments(),
      VisitorLog.aggregate(uniqueVisitorsPipeline()),
      VisitorLog.aggregate(uniqueVisitorsPipeline({ createdAt: { $gte: last24Hours, $lte: now } })),
      VisitorLog.aggregate(uniqueVisitorsPipeline({
        createdAt: { $gte: last30Days, $lte: now },
        trackingVersion: 2,
      })),
      VisitorLog.aggregate(uniqueVisitorsPipeline({
        createdAt: { $gte: previous30Days, $lt: last30Days },
        trackingVersion: 2,
      })),
      VisitorLog.findOne({ trackingVersion: 2 }).sort({ createdAt: 1 }).select("createdAt").lean(),
      VisitorLog.aggregate([
        { $match: { page: { $type: "string", $ne: "" } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      VisitorLog.aggregate([
        { $match: { createdAt: { $gte: last30Days, $lte: now } } },
        addAnalyticsIdentityStage(),
        validVisitorIdentityStage(),
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: ANALYTICS_TIMEZONE,
              },
            },
            visitors: { $addToSet: "$analyticsVisitorId" },
            pageViews: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$visitors" },
            pageViews: 1,
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const uniqueVisitors = getUniqueCount(uniqueVisitorsData);
    const last24Visitors = getUniqueCount(last24VisitorsData);
    const currentPeriodVisitors = getUniqueCount(currentPeriodVisitorsData);
    const previousPeriodVisitors = getUniqueCount(previousPeriodVisitorsData);
    const hasCompleteGrowthBaseline = Boolean(
      earliestVerifiedTracking?.createdAt &&
      new Date(earliestVerifiedTracking.createdAt) <= previous30Days,
    );
    const growthRate = hasCompleteGrowthBaseline
      ? calculateGrowthRate(currentPeriodVisitors, previousPeriodVisitors)
      : null;

    return NextResponse.json({
      success: true,
      data: {
        // Compatibility field: this now means actual distinct visitors, never page-view documents.
        totalVisitors: uniqueVisitors,
        uniqueVisitors,
        totalPageViews,
        todayVisitors: last24Visitors,
        last24Visitors,
        monthlyVisitors: currentPeriodVisitors,
        previousPeriodVisitors,
        growthRate,
        growthAvailable: growthRate !== null,
        growthStatus: growthRate === null ? "Collecting verified baseline" : "Verified",
        growthPeriodDays: 30,
        pageViews: pageViewsData,
        monthlyTrend: monthlyTrendData,
        timezone: ANALYTICS_TIMEZONE,
      },
    });
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
