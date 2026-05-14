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

        let { period = '30' } = req.nextUrl.searchParams;
        const periodDays = parseInt(period);
        
        if (isNaN(periodDays) || periodDays <= 0) {
            return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        startDate.setHours(0, 0, 0, 0);

        const [deviceDistribution, osDistribution, browserDistribution, deviceTrend] = await Promise.all([
            // Device type distribution (exclude unknown)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "device.type": { $ne: null }
                } },
                {
                    $group: {
                        _id: "$device.type",
                        count: { $sum: 1 },
                        uniqueSessions: { $addToSet: "$sessionId" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        device: "$_id",
                        count: 1,
                        percentage: { $literal: 0 }, // Will calculate in code
                        uniqueCount: { $size: "$uniqueSessions" }
                    }
                },
                { $sort: { count: -1 } }
            ]),
            // OS distribution (exclude unknown)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "device.os": { $ne: null }
                } },
                {
                    $group: {
                        _id: "$device.os",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),
            // Browser distribution (exclude unknown)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "device.browser": { $ne: null }
                } },
                {
                    $group: {
                        _id: "$device.browser",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),
            // Device trend (daily device counts, exclude unknown)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "device.type": { $ne: null }
                } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            device: "$device.type"
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ])
        ]);

        // Calculate percentages
        const total = deviceDistribution.reduce((sum, d) => sum + d.count, 0);
        const deviceWithPercentage = deviceDistribution.map(d => ({
            _id: d._id,
            device: d.device,
            count: d.count,
            percentage: total > 0 ? parseFloat(((d.count / total) * 100).toFixed(2)) : 0,
            uniqueCount: d.uniqueCount
        }));

        console.log('[Analytics Devices]', {
            period: periodDays,
            deviceCount: deviceWithPercentage.length,
            total
        });

        return NextResponse.json({
            success: true,
            data: {
                devices: deviceWithPercentage,
                operatingSystems: osDistribution.map(d => ({ _id: d._id, os: d._id, count: d.count })),
                browsers: browserDistribution.map(d => ({ _id: d._id, browser: d._id, count: d.count })),
                trend: deviceTrend.map(d => ({
                    date: d._id.date,
                    device: d._id.device,
                    count: d.count
                }))
            }
        });
    } catch (error) {
        console.error("[Analytics Devices API] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
