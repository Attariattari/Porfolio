import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        let { period = '30', limit = '20' } = req.nextUrl.searchParams;
        const periodDays = parseInt(period);
        const pageLimit = parseInt(limit);
        
        if (isNaN(periodDays) || periodDays <= 0) {
            return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        startDate.setHours(0, 0, 0, 0);

        const [topPages, pageEngagement, pageTrend] = await Promise.all([
            // Top visited pages
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    page: { $ne: null, $ne: "" }
                } },
                {
                    $group: {
                        _id: "$page",
                        visits: { $sum: 1 },
                        uniqueVisitors: { $addToSet: "$sessionId" },
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
                { $limit: pageLimit || 20 }
            ]),
            // Page engagement metrics with real bounce rate calculation
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    page: { $ne: null, $ne: "" }
                } },
                {
                    $group: {
                        _id: "$sessionId",
                        pages: { $push: "$page" },
                        durations: { $push: "$sessionDuration" },
                        interactions: { $push: "$interactionCount" },
                        firstPage: { $first: "$page" },
                        pageCount: { $sum: 1 }
                    }
                },
                { $unwind: "$pages" },
                {
                    $group: {
                        _id: "$pages",
                        visits: { $sum: 1 },
                        avgSessionDuration: { $avg: { $arrayElemAt: ["$durations", 0] } },
                        avgInteractions: { $avg: { $arrayElemAt: ["$interactions", 0] } },
                        uniqueSessions: { $addToSet: "$_id" },
                        // A bounce is when a session started on this page AND had only 1 page total
                        bounces: { 
                            $sum: { 
                                $cond: [
                                    { $and: [{ $eq: ["$firstPage", "$pages"] }, { $eq: ["$pageCount", 1] }] }, 
                                    1, 
                                    0
                                ] 
                            } 
                        },
                        entries: {
                            $sum: { $cond: [{ $eq: ["$firstPage", "$pages"] }, 1, 0] }
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
                { $limit: pageLimit || 20 }
            ]),
            // Page trend (daily page visits)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    page: { $ne: null, $ne: "" }
                } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
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
                }))
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
