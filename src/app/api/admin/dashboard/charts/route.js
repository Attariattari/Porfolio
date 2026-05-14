import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { Project, Service, Blog } from "@/models/Portfolio";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getAuthSession();
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized node traversal" }, { status: 401 });
        }

        await dbConnect();

        // 1. Booking Trend (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const bookingTrend = await Booking.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Service Distribution
        const serviceDistribution = await Booking.aggregate([
            {
                $group: {
                    _id: "$service",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 3. Activity Stats (Content Creation Trend - Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const getMonthlyStats = async (Model) => {
            return await Model.aggregate([
                { $match: { createdAt: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);
        };

        const [blogStats, serviceStats, projectStats] = await Promise.all([
            getMonthlyStats(Blog),
            getMonthlyStats(Service),
            getMonthlyStats(Project)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                bookingTrend,
                serviceDistribution,
                activityStats: {
                    blogs: blogStats,
                    services: serviceStats,
                    projects: projectStats
                }
            }
        });
    } catch (error) {
        console.error("[Dashboard Charts API] Aggregation failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
