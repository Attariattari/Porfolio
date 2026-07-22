import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";
import {
  ANALYTICS_TIMEZONE,
  addAnalyticsIdentityStage,
  getAnalyticsPeriod,
  getCalendarDayRange,
  validVisitorIdentityStage,
} from "@/lib/analytics/visitorAnalytics";

export const dynamic = "force-dynamic";

const sessionBasePipeline = (startDate, endDate) => [
  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
  addAnalyticsIdentityStage(),
  validVisitorIdentityStage(),
  { $sort: { createdAt: 1 } },
  {
    $group: {
      _id: "$analyticsSessionId",
      visitorId: { $first: "$analyticsVisitorId" },
      device: { $first: "$device.type" },
      os: { $first: "$device.os" },
      browser: { $first: "$device.browser" },
      userAgent: { $first: "$userAgent" },
      startedAt: { $first: "$createdAt" },
    },
  },
];

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const periodDays = getAnalyticsPeriod(req.nextUrl.searchParams.get("period"));
    if (!periodDays) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
    }
    const { startDate, endDate } = getCalendarDayRange(periodDays, new Date(), ANALYTICS_TIMEZONE);
    const base = sessionBasePipeline(startDate, endDate);
    const knownValue = { $type: "string", $nin: ["", "Unknown", "unknown", "Not Detected"] };

    const [deviceDistribution, osDistribution, browserDistribution, deviceTrend] = await Promise.all([
      VisitorLog.aggregate([
        ...base,
        { $match: { device: knownValue, userAgent: knownValue } },
        {
          $group: {
            _id: "$device",
            count: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 1,
            device: "$_id",
            count: 1,
            uniqueCount: { $size: "$visitors" },
          },
        },
        { $sort: { count: -1 } },
      ]),
      VisitorLog.aggregate([
        ...base,
        { $match: { os: knownValue, userAgent: knownValue } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorLog.aggregate([
        ...base,
        { $match: { browser: knownValue, userAgent: knownValue } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      VisitorLog.aggregate([
        ...base,
        { $match: { device: knownValue, userAgent: knownValue } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$startedAt",
                  timezone: ANALYTICS_TIMEZONE,
                },
              },
              device: "$device",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),
    ]);

    const totalSessions = deviceDistribution.reduce((sum, item) => sum + item.count, 0);
    const devices = deviceDistribution.map((item) => ({
      ...item,
      percentage: totalSessions
        ? Number(((item.count / totalSessions) * 100).toFixed(2))
        : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        devices,
        operatingSystems: osDistribution.map((item) => ({ ...item, os: item._id })),
        browsers: browserDistribution.map((item) => ({ ...item, browser: item._id })),
        trend: deviceTrend.map((item) => ({
          date: item._id.date,
          device: item._id.device,
          count: item.count,
        })),
        periodDays,
        timezone: ANALYTICS_TIMEZONE,
      },
    });
  } catch (error) {
    console.error("[Analytics Devices API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch device analytics" },
      { status: 500 },
    );
  }
}
