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

const getCalendarDateKeys = (date, days, timezone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const calendarToday = new Date(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
  ));

  return Array.from({ length: days }, (_, index) => {
    const day = new Date(calendarToday);
    day.setUTCDate(day.getUTCDate() - (days - 1 - index));
    return day.toISOString().slice(0, 10);
  });
};

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
    const trendByDate = new Map(monthlyTrendData.map((item) => [item._id, item]));
    const completeMonthlyTrend = getCalendarDateKeys(now, 30, ANALYTICS_TIMEZONE)
      .map((dateKey) => ({
        _id: dateKey,
        count: trendByDate.get(dateKey)?.count || 0,
        pageViews: trendByDate.get(dateKey)?.pageViews || 0,
      }));

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
        monthlyTrend: completeMonthlyTrend,
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
