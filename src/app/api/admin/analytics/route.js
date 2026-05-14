import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized node traversal" }, { status: 401 });
        }

        await dbConnect();
        
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Parallel queries to speed up execution
        const [
            totalVisitors,
            todayVisitors,
            thisMonthVisitors,
            lastMonthVisitors,
            uniqueVisitorsData,
            pageViewsData,
            monthlyTrendData,
        ] = await Promise.all([
            VisitorLog.countDocuments(),
            VisitorLog.countDocuments({ createdAt: { $gte: startOfToday } }),
            VisitorLog.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
            VisitorLog.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
            // unique visitors by session
            VisitorLog.aggregate([
                { $group: { _id: "$sessionId" } },
                { $count: "uniqueCount" }
            ]),
            // Page views distribution
            VisitorLog.aggregate([
                { $group: { _id: "$page", count: { $sum: 1 } } }
            ]),
            // Monthly Trend (Visitor growth by date for last 30 days)
            VisitorLog.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const uniqueVisitors = uniqueVisitorsData.length > 0 ? uniqueVisitorsData[0].uniqueCount : 0;
        
        // Calculate growth rate (this month vs last month)
        let growthRate = 0;
        if (lastMonthVisitors > 0) {
            growthRate = ((thisMonthVisitors - lastMonthVisitors) / lastMonthVisitors) * 100;
        } else if (thisMonthVisitors > 0) {
            growthRate = 100; // infinite growth if last month was 0
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                totalVisitors,
                uniqueVisitors,
                todayVisitors,
                monthlyVisitors: thisMonthVisitors,
                growthRate: growthRate.toFixed(1),
                pageViews: pageViewsData,
                monthlyTrend: monthlyTrendData
            }
        });
    } catch (error) {
        console.error("[Analytics API] Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
