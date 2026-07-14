import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";
import {
  ANALYTICS_TIMEZONE,
  addAnalyticsIdentityStage,
  getAnalyticsPeriod,
  getRollingPeriodRange,
  validVisitorIdentityStage,
} from "@/lib/analytics/visitorAnalytics";

export const dynamic = "force-dynamic";

const sessionLocationPipeline = (startDate, endDate) => [
  { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
  addAnalyticsIdentityStage(),
  validVisitorIdentityStage(),
  { $sort: { createdAt: 1 } },
  {
    $group: {
      _id: "$analyticsSessionId",
      visitorId: { $first: "$analyticsVisitorId" },
      country: { $first: "$geo.country" },
      countryCode: { $first: "$geo.countryCode" },
      city: { $first: "$geo.city" },
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
    const requestedLimit = Number.parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
    const locationLimit = Math.min(Math.max(requestedLimit || 20, 1), 100);
    if (!periodDays) {
      return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
    }

    const { startDate, endDate } = getRollingPeriodRange(periodDays);
    const base = sessionLocationPipeline(startDate, endDate);
    const knownLocation = { $nin: [null, "", "Unknown", "Not Detected"] };

    const [countries, cities, locationTrend] = await Promise.all([
      VisitorLog.aggregate([
        ...base,
        { $match: { country: knownLocation } },
        {
          $group: {
            _id: { country: "$country", countryCode: "$countryCode" },
            visitorIds: { $addToSet: "$visitorId" },
            visits: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            country: "$_id.country",
            countryCode: "$_id.countryCode",
            visitors: { $size: "$visitorIds" },
            uniqueVisitors: { $size: "$visitorIds" },
            visits: 1,
          },
        },
        { $sort: { visitors: -1 } },
        { $limit: locationLimit },
      ]),
      VisitorLog.aggregate([
        ...base,
        { $match: { country: knownLocation, city: knownLocation } },
        {
          $group: {
            _id: { city: "$city", country: "$country" },
            visitorIds: { $addToSet: "$visitorId" },
            visits: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 1,
            city: "$_id.city",
            country: "$_id.country",
            visitors: { $size: "$visitorIds" },
            uniqueVisitors: { $size: "$visitorIds" },
            visits: 1,
          },
        },
        { $sort: { visitors: -1 } },
        { $limit: locationLimit },
      ]),
      VisitorLog.aggregate([
        ...base,
        { $match: { country: knownLocation } },
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
              country: "$country",
            },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$visitors" },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        countries,
        cities,
        locationTrend: locationTrend.map((item) => ({
          date: item._id.date,
          country: item._id.country,
          count: item.count,
        })),
        periodDays,
        timezone: ANALYTICS_TIMEZONE,
      },
    });
  } catch (error) {
    console.error("[Analytics Geo API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch geographic analytics" },
      { status: 500 },
    );
  }
}
