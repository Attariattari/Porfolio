import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { getAuthSession } from "@/lib/auth";
import {
            addAnalyticsIdentityStage,
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

        // Last 30 minutes for "active" users
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const [activeUsers, recentSessions, topPages] = await Promise.all([
            // Current active users (last 30 minutes)
            VisitorLog.aggregate([
                { $match: { updatedAt: { $gte: thirtyMinutesAgo } } },
                addAnalyticsIdentityStage(),
                validVisitorIdentityStage(),
                { $group: { _id: "$analyticsVisitorId" } },
                { $count: "activeCount" }
            ]),
            // Recent user activities
            VisitorLog.aggregate([
                { $match: { updatedAt: { $gte: thirtyMinutesAgo } } },
                addAnalyticsIdentityStage(),
                validVisitorIdentityStage(),
                { $sort: { updatedAt: -1 } },
                {
                    $group: {
                        _id: "$analyticsSessionId",
                        sessionId: { $first: "$analyticsSessionId" },
                        page: { $first: "$page" },
                        device: { $first: "$device" },
                        geo: { $first: "$geo" },
                        lastSeen: { $first: "$updatedAt" },
                    }
                },
                { $sort: { lastSeen: -1 } },
                { $limit: 15 },
            ]),
            // Most visited pages in last 30 min
            VisitorLog.aggregate([
                { $match: { 
                    updatedAt: { $gte: thirtyMinutesAgo },
                    page: { $ne: null, $ne: "" }
                } },
                {
                    $group: {
                        _id: "$page",
                        sessions: { $addToSet: "$sessionId" }
                    }
                },
                { $project: { _id: 1, count: { $size: "$sessions" } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        const activeCount = activeUsers[0]?.activeCount || 0;

        // Enrich recent sessions with real data
        const enrichedRecent = recentSessions
            .filter(log => log.device?.type)
            .map(log => ({
                sessionId: log.sessionId,
                page: log.page || '/',
                device: log.device?.type || 'Unknown',
                browser: log.device?.browser || 'Unknown',
                country: log.geo?.country && !['Unknown', 'Not Detected'].includes(log.geo.country)
                    && !['Unknown', 'Unknown City', 'Local Machine', 'Not Detected'].includes(log.geo?.city)
                    ? log.geo.country 
                    : 'Unknown',
                city: log.geo?.city && !['Unknown', 'Unknown City', 'Local Machine', 'Not Detected'].includes(log.geo.city)
                    ? log.geo.city
                    : null,
                timeAgo: getTimeAgo(log.lastSeen)
            }))
            .slice(0, 10);

        return NextResponse.json({
            success: true,
            data: {
                activeUsers: activeCount,
                recentActivity: enrichedRecent,
                topPages: topPages.map(p => ({
                    page: p._id,
                    visits: p.count
                }))
            }
        });
    } catch (error) {
        console.error("[Analytics Active API] Error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    
    return `${Math.floor(seconds / 86400)}d ago`;
}
