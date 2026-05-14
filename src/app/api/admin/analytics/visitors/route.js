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

        let { period = '30', view = 'daily' } = req.nextUrl.searchParams;
        
        // Parse period
        const periodDays = parseInt(period);
        if (isNaN(periodDays) || periodDays <= 0) {
            return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        startDate.setHours(0, 0, 0, 0);

        console.log('[Analytics] Period:', periodDays, 'days, Start date:', startDate);

        // Format based on view type
        const dateFormat = view === 'hourly' 
            ? "%Y-%m-%d %H:00" 
            : "%Y-%m-%d";

        const [
            dailyTrend,
            hourlyBreakdown,
            totalVisitors,
            uniqueVisitors,
            bounceRate,
            avgSessionDuration
        ] = await Promise.all([
            // Daily/Hourly trend
            VisitorLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                        count: { $sum: 1 },
                        uniqueSessions: { $addToSet: "$sessionId" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        date: "$_id",
                        uniqueCount: { $size: "$uniqueSessions" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            // Hourly breakdown (last 24 hours)
            VisitorLog.aggregate([
                { 
                    $match: { 
                        createdAt: { 
                            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
                        } 
                    } 
                },
                {
                    $group: {
                        _id: { $hour: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            // Total visitors in period
            VisitorLog.countDocuments({ createdAt: { $gte: startDate } }),
            // Unique visitors
            VisitorLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: "$sessionId" } },
                { $count: "count" }
            ]),
            // Bounce rate (sessions with only 1 page view)
            VisitorLog.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: "$sessionId",
                        pageCount: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        bouncedSessions: {
                            $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] }
                        }
                    }
                }
            ]),
            // Average session duration (ignoring 0-second bounces)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    sessionDuration: { $gt: 0 } // Only count sessions with actual time spent
                } },
                {
                    $group: {
                        _id: "$sessionId",
                        maxDuration: { $max: "$sessionDuration" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgDuration: { $avg: "$maxDuration" }
                    }
                }
            ])
        ]);

        const uniqueCount = uniqueVisitors[0]?.count || 0;
        const bounceRateData = bounceRate[0];
        const bounceRateValue = bounceRateData && bounceRateData.totalSessions > 0
            ? (bounceRateData.bouncedSessions / bounceRateData.totalSessions) * 100
            : 0;
        const avgDuration = avgSessionDuration[0]?.avgDuration || 0;

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalVisitors,
                    uniqueVisitors: uniqueCount,
                    bounceRate: parseFloat(bounceRateValue).toFixed(1),
                    avgSessionDuration: Math.round(avgDuration)
                },
                trend: dailyTrend.map(d => ({
                    date: d._id,
                    count: d.count,
                    uniqueCount: d.uniqueCount
                })),
                hourly: hourlyBreakdown.map(h => ({
                    hour: h._id,
                    count: h.count
                }))
            }
        });
    } catch (error) {
        console.error("[Analytics Visitors API] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
