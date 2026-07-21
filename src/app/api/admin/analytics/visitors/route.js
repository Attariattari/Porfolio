import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";
import {
  ANALYTICS_TIMEZONE,
  addAnalyticsIdentityStage,
  calculateGrowthRate,
  getAnalyticsPeriod,
  getCalendarDayRange,
  getUniqueCount,
  validVisitorIdentityStage,
} from "@/lib/analytics/visitorAnalytics";

export const dynamic = "force-dynamic";

const periodIdentityPipeline = (createdAt) => [
  { $match: { createdAt } },
  addAnalyticsIdentityStage(),
  validVisitorIdentityStage(),
];

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const periodDays = getAnalyticsPeriod(req.nextUrl.searchParams.get("period"));
    const view = req.nextUrl.searchParams.get("view") === "hourly" ? "hourly" : "daily";
    if (!periodDays) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
    }

    const { startDate, endDate, previousStartDate, dateKeys } = getCalendarDayRange(
      periodDays, new Date(), ANALYTICS_TIMEZONE,
    );
    const currentRange = { $gte: startDate, $lte: endDate };
    const previousRange = { $gte: previousStartDate, $lt: startDate };

    const [
      dailyTrend,
      hourlyBreakdown,
      totalPageViews,
      uniqueVisitors,
      currentVerifiedVisitors,
      previousVerifiedVisitors,
      sessionQuality,
      averageSessionDuration,
    ] = await Promise.all([
      VisitorLog.aggregate([
        ...periodIdentityPipeline(currentRange),
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
            sessions: { $addToSet: "$analyticsSessionId" },
            pageViews: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            date: "$_id",
            count: { $size: "$visitors" },
            uniqueCount: { $size: "$visitors" },
            sessions: { $size: "$sessions" },
            pageViews: 1,
          },
        },
        { $sort: { _id: 1 } },
      ]),
      VisitorLog.aggregate([
        ...periodIdentityPipeline(currentRange),
        {
          $group: {
            _id: {
              $hour: { date: "$createdAt", timezone: ANALYTICS_TIMEZONE },
            },
            visitors: { $addToSet: "$analyticsVisitorId" },
            sessions: { $addToSet: "$analyticsSessionId" },
            pageViews: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            hour: "$_id",
            count: { $size: "$visitors" },
            sessions: { $size: "$sessions" },
            pageViews: 1,
          },
        },
        { $sort: { _id: 1 } },
      ]),
      VisitorLog.countDocuments({ createdAt: currentRange }),
      VisitorLog.aggregate([
        ...periodIdentityPipeline(currentRange),
        { $group: { _id: "$analyticsVisitorId" } },
        { $count: "count" },
      ]),
      VisitorLog.aggregate([
        { $match: { createdAt: currentRange } },
        addAnalyticsIdentityStage(),
        validVisitorIdentityStage(),
        { $group: { _id: "$analyticsVisitorId" } },
        { $count: "count" },
      ]),
      VisitorLog.aggregate([
        { $match: { createdAt: previousRange } },
        addAnalyticsIdentityStage(),
        validVisitorIdentityStage(),
        { $group: { _id: "$analyticsVisitorId" } },
        { $count: "count" },
      ]),
      VisitorLog.aggregate([
        {
          $match: {
            createdAt: currentRange,
            trackingVersion: 2,
          },
        },
        addAnalyticsIdentityStage(),
        validVisitorIdentityStage(),
        {
          $group: {
            _id: "$analyticsSessionId",
            pageCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            bouncedSessions: {
              $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] },
            },
          },
        },
      ]),
      VisitorLog.aggregate([
        {
          $match: {
            createdAt: currentRange,
            trackingVersion: 2,
            sessionDuration: { $gt: 0 },
          },
        },
        addAnalyticsIdentityStage(),
        validVisitorIdentityStage(),
        {
          $group: {
            _id: "$analyticsSessionId",
            maxDuration: { $max: "$sessionDuration" },
          },
        },
        {
          $group: {
            _id: null,
            average: { $avg: "$maxDuration" },
          },
        },
      ]),
    ]);

    const uniqueCount = getUniqueCount(uniqueVisitors);
    const currentVerifiedCount = getUniqueCount(currentVerifiedVisitors);
    const previousVerifiedCount = getUniqueCount(previousVerifiedVisitors);
    const quality = sessionQuality[0];
    const bounceRate = quality?.totalSessions
      ? Number(((quality.bouncedSessions / quality.totalSessions) * 100).toFixed(1))
      : null;
    const avgSessionDuration = averageSessionDuration[0]?.average;
    const growthRate = calculateGrowthRate(currentVerifiedCount, previousVerifiedCount);
    const trendByDate = new Map(dailyTrend.map((item) => [item._id, item]));
    const completeDailyTrend = dateKeys.map((dateKey) => ({
      _id: dateKey,
      date: dateKey,
      count: trendByDate.get(dateKey)?.count || 0,
      uniqueCount: trendByDate.get(dateKey)?.uniqueCount || 0,
      sessions: trendByDate.get(dateKey)?.sessions || 0,
      pageViews: trendByDate.get(dateKey)?.pageViews || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          // Kept for older clients; this is now distinct people/browsers, not log rows.
          totalVisitors: uniqueCount,
          uniqueVisitors: uniqueCount,
          totalPageViews,
          bounceRate,
          avgSessionDuration:
            typeof avgSessionDuration === "number" ? Math.round(avgSessionDuration) : null,
          measuredSessions: quality?.totalSessions || 0,
          verifiedVisitors: currentVerifiedCount,
          previousVerifiedVisitors: previousVerifiedCount,
          growthRate,
          growthAvailable: true,
          growthStatus: previousVerifiedCount === 0 && currentVerifiedCount > 0
            ? "First active period"
            : "Live comparison",
          periodDays,
        },
        trend: completeDailyTrend,
        hourly: hourlyBreakdown,
        view,
        timezone: ANALYTICS_TIMEZONE,
        range: {
          from: dateKeys[0],
          to: dateKeys[dateKeys.length - 1],
          days: periodDays,
        },
      },
    });
  } catch (error) {
    console.error("[Analytics Visitors API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch visitor analytics" },
      { status: 500 },
    );
  }
}
