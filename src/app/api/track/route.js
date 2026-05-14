import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { emitSocketEvent } from "@/lib/socket";
import { parseUserAgent, getGeoFromIP, getClientIP } from "@/lib/tracking/deviceDetection";

export async function POST(req) {
    try {
        await dbConnect();
        const { 
            page, 
            userAgent, 
            timestamp, 
            sessionId,
            sessionDuration = 0,
            interactionCount = 0,
            scrollDepth = 0 
        } = await req.json();

        // Parse device and geo info
        const deviceInfo = parseUserAgent(userAgent);
        const clientIP = getClientIP(req);
        const geoInfo = await getGeoFromIP(clientIP);

        // Try to update existing log for this page view first
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingPageLog = await VisitorLog.findOne({
            sessionId,
            page: page || '/',
            createdAt: { $gte: thirtyMinutesAgo }
        }).sort({ createdAt: -1 });

        if (existingPageLog) {
            existingPageLog.sessionDuration = Math.max(existingPageLog.sessionDuration || 0, parseInt(sessionDuration) || 0);
            existingPageLog.interactionCount = Math.max(existingPageLog.interactionCount || 0, parseInt(interactionCount) || 0);
            existingPageLog.scrollDepth = Math.max(existingPageLog.scrollDepth || 0, Math.min(100, parseInt(scrollDepth) || 0));
            await existingPageLog.save();
            return NextResponse.json({ success: true, updated: true });
        }

        const log = await VisitorLog.create({
            page: page || '/',
            userAgent: userAgent || 'Unknown',
            sessionId,
            device: {
                type: deviceInfo?.type || 'desktop',
                browser: deviceInfo?.browser || 'Unknown',
                os: deviceInfo?.os || 'Unknown',
            },
            geo: {
                ip: clientIP,
                country: geoInfo?.country || 'Unknown',
                countryCode: geoInfo?.countryCode || 'PK',
                city: geoInfo?.city || 'Unknown City',
                latitude: geoInfo?.latitude || 0,
                longitude: geoInfo?.longitude || 0,
            },
            sessionDuration: parseInt(sessionDuration) || 0,
            interactionCount: parseInt(interactionCount) || 0,
            scrollDepth: parseInt(scrollDepth) || 0,
            createdAt: timestamp || new Date()
        });

        // Emit socket events for real-time dashboard updates
        emitSocketEvent('new_visitor', { 
            page, 
            timestamp: log.createdAt,
            country: log?.geo?.country || 'Unknown',
            device: log?.device?.type || 'desktop'
        });
        emitSocketEvent('STATS_UPDATED', { type: 'visitor', page });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Track API] Error:", error);
        return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
    }
}
