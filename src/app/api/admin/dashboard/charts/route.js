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
        const today = new Date();
        const thirtyDaysAgo = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate() - 29
        ));

        const bookingTrend = await Booking.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "UTC"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Mongo only returns dates that contain bookings. Fill the missing days so
        // the chart always represents the complete rolling 30-day window.
        const bookingsByDate = new Map(
            bookingTrend.map(({ _id, count }) => [_id, count])
        );
        const completeBookingTrend = Array.from({ length: 30 }, (_, index) => {
            const date = new Date(thirtyDaysAgo);
            date.setUTCDate(date.getUTCDate() + index);
            const dateKey = date.toISOString().slice(0, 10);

            return {
                _id: dateKey,
                count: bookingsByDate.get(dateKey) || 0
            };
        });

        // 2. Service Distribution
        const serviceDistribution = await Booking.aggregate([
            { $match: { service: { $type: "string", $ne: "" } } },
            {
                $group: {
                    _id: "$service",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 3. Activity Stats (Content Creation Trend - Last 6 months)
        const sixMonthsAgo = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth() - 5,
            1
        ));

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

        const fillMonthlyStats = (stats) => {
            const countsByMonth = new Map(stats.map(({ _id, count }) => [_id, count]));

            return Array.from({ length: 6 }, (_, index) => {
                const date = new Date(Date.UTC(
                    sixMonthsAgo.getUTCFullYear(),
                    sixMonthsAgo.getUTCMonth() + index,
                    1
                ));
                const monthKey = date.toISOString().slice(0, 7);
                return { _id: monthKey, count: countsByMonth.get(monthKey) || 0 };
            });
        };

        return NextResponse.json({
            success: true,
            data: {
                bookingTrend: completeBookingTrend,
                serviceDistribution,
                activityStats: {
                    blogs: fillMonthlyStats(blogStats),
                    services: fillMonthlyStats(serviceStats),
                    projects: fillMonthlyStats(projectStats)
                }
            }
        });
    } catch (error) {
        console.error("[Dashboard Charts API] Aggregation failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
