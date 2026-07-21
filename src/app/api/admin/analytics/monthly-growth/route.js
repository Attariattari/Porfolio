import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession } from "@/lib/auth";
import { VisitorLog } from "@/models/VisitorLog";
import {
  ANALYTICS_TIMEZONE,
  addAnalyticsIdentityStage,
  calculateGrowthRate,
  getCalendarMonthRange,
  validVisitorIdentityStage,
} from "@/lib/analytics/visitorAnalytics";

export const dynamic = "force-dynamic";

const monthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
};

const previousMonthKey = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
};

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const month = req.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const range = getCalendarMonthRange(month, ANALYTICS_TIMEZONE);
    if (!range) return NextResponse.json({ success: false, message: "Invalid month" }, { status: 400 });

    await dbConnect();
    const result = await VisitorLog.aggregate([
      { $match: { createdAt: { $gte: range.previousStartDate, $lt: range.endDate } } },
      addAnalyticsIdentityStage(),
      validVisitorIdentityStage(),
      {
        $group: {
          _id: {
            period: { $cond: [{ $gte: ["$createdAt", range.startDate] }, "current", "previous"] },
            day: { $dayOfMonth: { date: "$createdAt", timezone: ANALYTICS_TIMEZONE } },
          },
          visitors: { $addToSet: "$analyticsVisitorId" },
          pageViews: { $sum: 1 },
        },
      },
      { $project: { _id: 1, visitors: { $size: "$visitors" }, pageViews: 1 } },
    ]);

    const totalsResult = await VisitorLog.aggregate([
      { $match: { createdAt: { $gte: range.previousStartDate, $lt: range.endDate } } },
      addAnalyticsIdentityStage(),
      validVisitorIdentityStage(),
      {
        $group: {
          _id: { $cond: [{ $gte: ["$createdAt", range.startDate] }, "current", "previous"] },
          visitors: { $addToSet: "$analyticsVisitorId" },
          pageViews: { $sum: 1 },
        },
      },
      { $project: { _id: 1, visitors: { $size: "$visitors" }, pageViews: 1 } },
    ]);

    const totals = Object.fromEntries(totalsResult.map((item) => [item._id, item]));
    const daysInSelectedMonth = new Date(Date.UTC(...month.split("-").map(Number), 0)).getUTCDate();
    const previousKey = previousMonthKey(month);
    const daysInPreviousMonth = new Date(Date.UTC(...previousKey.split("-").map(Number), 0)).getUTCDate();
    const daily = Array.from({ length: Math.max(daysInSelectedMonth, daysInPreviousMonth) }, (_, index) => {
      const day = index + 1;
      const current = result.find((item) => item._id.period === "current" && item._id.day === day);
      const previous = result.find((item) => item._id.period === "previous" && item._id.day === day);
      return {
        day,
        currentVisitors: current?.visitors || 0,
        previousVisitors: previous?.visitors || 0,
        currentPageViews: current?.pageViews || 0,
        previousPageViews: previous?.pageViews || 0,
      };
    });
    const currentVisitors = totals.current?.visitors || 0;
    const previousVisitors = totals.previous?.visitors || 0;

    return NextResponse.json({
      success: true,
      data: {
        month,
        monthLabel: monthLabel(month),
        previousMonth: previousKey,
        previousMonthLabel: monthLabel(previousKey),
        currentVisitors,
        previousVisitors,
        currentPageViews: totals.current?.pageViews || 0,
        previousPageViews: totals.previous?.pageViews || 0,
        difference: currentVisitors - previousVisitors,
        growthRate: calculateGrowthRate(currentVisitors, previousVisitors),
        daily,
        timezone: ANALYTICS_TIMEZONE,
      },
    });
  } catch (error) {
    console.error("[Monthly Growth API] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch monthly growth" }, { status: 500 });
  }
}
