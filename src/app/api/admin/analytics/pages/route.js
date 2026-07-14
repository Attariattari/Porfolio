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

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const periodDays = getAnalyticsPeriod(req.nextUrl.searchParams.get('period'));
        const requestedLimit = Number.parseInt(req.nextUrl.searchParams.get('limit') || '20', 10);
        const pageLimit = Math.min(Math.max(requestedLimit || 20, 1), 100);
        
        if (isNaN(periodDays) || periodDays <= 0) {
            return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
        }

        const { startDate, endDate } = getRollingPeriodRange(periodDays);
        const periodRange = { $gte: startDate, $lte: endDate };

        const [topPages, pageEngagement, pageTrend] = await Promise.all([
            // Top visited pages
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: periodRange,
                    page: { $ne: null, $ne: "" }
                } },
                addAnalyticsIdentityStage(),
                validVisitorIdentityStage(),
                {
                    $group: {
                        _id: "$page",
                        visits: { $sum: 1 },
                        uniqueVisitors: { $addToSet: "$analyticsVisitorId" },
                        avgTimeOnPage: { $avg: "$timeOnPage" },
                        avgScrollDepth: { $avg: "$scrollDepth" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        page: "$_id",
                        visits: 1,
                        uniqueVisitors: { $size: "$uniqueVisitors" },
                        avgTimeOnPage: { $round: ["$avgTimeOnPage", 0] },
                        avgScrollDepth: { $round: ["$avgScrollDepth", 0] }
                    }
                },
                { $sort: { visits: -1 } },
                { $limit: pageLimit }
            ]),
            // Page engagement metrics with real bounce rate calculation
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: periodRange,
                    trackingVersion: 2,
                    page: { $ne: null, $ne: "" }
                } },
                addAnalyticsIdentityStage(),
                validVisitorIdentityStage(),
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: "$analyticsSessionId",
                        visitorId: { $first: "$analyticsVisitorId" },
                        pages: {
                            $push: {
                                page: "$page",
                                interactions: { $ifNull: ["$interactionCount", 0] },
                            }
                        },
                        firstPage: { $first: "$page" },
                        pageCount: { $sum: 1 },
                        maxDuration: { $max: { $ifNull: ["$sessionDuration", 0] } },
                    }
                },
                { $unwind: "$pages" },
                {
                    $group: {
                        _id: "$pages.page",
                        visits: { $sum: 1 },
                        avgSessionDuration: { $avg: "$maxDuration" },
                        avgInteractions: { $avg: "$pages.interactions" },
                        uniqueSessions: { $addToSet: "$_id" },
                        uniqueVisitors: { $addToSet: "$visitorId" },
                        // A bounce is when a session started on this page AND had only 1 page total
                        bounces: { 
                            $sum: { 
                                $cond: [
                                    { $and: [{ $eq: ["$firstPage", "$pages.page"] }, { $eq: ["$pageCount", 1] }] },
                                    1, 
                                    0
                                ] 
                            } 
                        },
                        entries: {
                            $sum: { $cond: [{ $eq: ["$firstPage", "$pages.page"] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        page: "$_id",
                        visits: 1,
                        avgSessionDuration: { $round: ["$avgSessionDuration", 0] },
                        avgInteractions: { $round: ["$avgInteractions", 1] },
                        uniqueCount: { $size: "$uniqueSessions" },
                        uniqueVisitors: { $size: "$uniqueVisitors" },
                        bounceRate: { 
                            $round: [
                                { $cond: [
                                    { $gt: ["$entries", 0] }, 
                                    { $multiply: [{ $divide: ["$bounces", "$entries"] }, 100] }, 
                                    0
                                ] }, 
                                1
                            ] 
                        }
                    }
                },
                { $sort: { visits: -1 } },
                { $limit: pageLimit }
            ]),
            // Page trend (daily page visits)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: periodRange,
                    page: { $ne: null, $ne: "" }
                } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: ANALYTICS_TIMEZONE } },
                            page: "$page"
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: {
                topPages,
                pageEngagement,
                pageTrend: pageTrend.map(p => ({
                    date: p._id.date,
                    page: p._id.page,
                    count: p.count
                })),
                periodDays,
                timezone: ANALYTICS_TIMEZONE,
            }
        });
    } catch (error) {
        console.error("[Analytics Pages API] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
