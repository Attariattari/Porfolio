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
        const locationLimit = parseInt(limit);
        
        if (isNaN(periodDays) || periodDays <= 0) {
            return NextResponse.json({ success: false, error: "Invalid period" }, { status: 400 });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        startDate.setHours(0, 0, 0, 0);

        const [countries, cities, locationTrend] = await Promise.all([
            // Top countries (exclude Unknown/Not Detected)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "geo.country": { $nin: ["Unknown", "Not Detected", null] }
                } },
                {
                    $group: {
                        _id: {
                            country: "$geo.country",
                            countryCode: "$geo.countryCode"
                        },
                        visitors: { $sum: 1 },
                        uniqueSessions: { $addToSet: "$sessionId" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        country: "$_id.country",
                        countryCode: "$_id.countryCode",
                        visitors: 1,
                        uniqueVisitors: { $size: "$uniqueSessions" }
                    }
                },
                { $sort: { visitors: -1 } },
                { $limit: locationLimit }
            ]),
            // Top cities (exclude Unknown/Not Detected)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "geo.city": { $nin: ["Unknown", "Not Detected", null] },
                    "geo.country": { $nin: ["Unknown", "Not Detected", null] }
                } },
                {
                    $group: {
                        _id: {
                            city: "$geo.city",
                            country: "$geo.country"
                        },
                        visitors: { $sum: 1 },
                        uniqueSessions: { $addToSet: "$sessionId" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        city: "$_id.city",
                        country: "$_id.country",
                        visitors: 1,
                        uniqueVisitors: { $size: "$uniqueSessions" }
                    }
                },
                { $sort: { visitors: -1 } },
                { $limit: locationLimit }
            ]),
            // Location trend (daily country visits, exclude Unknown)
            VisitorLog.aggregate([
                { $match: { 
                    createdAt: { $gte: startDate },
                    "geo.country": { $nin: ["Unknown", "Not Detected", null] }
                } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            country: "$geo.country"
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ])
        ]);

        console.log('[Analytics Geo]', {
            period: periodDays,
            countriesCount: countries.length,
            citiesCount: cities.length
        });

        return NextResponse.json({
            success: true,
            data: {
                countries,
                cities,
                locationTrend: locationTrend.map(d => ({
                    date: d._id.date,
                    country: d._id.country,
                    count: d.count
                }))
            }
        });
    } catch (error) {
        console.error("[Analytics Geo API] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
