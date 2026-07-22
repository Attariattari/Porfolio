import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { VisitorLog } from "@/models/VisitorLog";
import { parseUserAgent, getGeoFromIP, getClientIP } from "@/lib/tracking/deviceDetection";

export const dynamic = 'force-dynamic';

/**
 * POST /api/tracking/visitor
 * Records visitor page view with detailed metrics
 */
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            visitorId,
            sessionId,
            page,
            userAgent,
            timeOnPage = 0,
            sessionDuration = 0,
            interactionCount = 0,
            scrollDepth = 0,
            referrer = '',
        } = body;

        const requestUserAgent = req.headers.get("user-agent") || userAgent || "";
        if (/bot|crawler|spider|headless|lighthouse|pagespeed|google-inspectiontool/i.test(requestUserAgent)) {
            return new NextResponse(null, { status: 204 });
        }

        // Validation
        if (!page || !sessionId) {
            console.log('[Visitor Tracking] Missing required fields:', { page, sessionId });
            return NextResponse.json(
                { success: false, error: "Missing required fields: page and sessionId" },
                { status: 400 }
            );
        }

        const normalizedSessionId = String(sessionId).trim().slice(0, 160);
        const normalizedVisitorId = String(visitorId || sessionId).trim().slice(0, 160);
        const normalizedPage = String(page).trim().slice(0, 2048) || "/";
        if (!normalizedSessionId || !normalizedVisitorId) {
            return NextResponse.json(
                { success: false, error: "Invalid visitor identity" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if we should update an existing log for this page view
        // (same session and page, created within the last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingPageLog = await VisitorLog.findOne({
            sessionId: normalizedSessionId,
            page: normalizedPage,
            createdAt: { $gte: thirtyMinutesAgo }
        }).sort({ createdAt: -1 });

        if (existingPageLog) {
            // Update existing log
            existingPageLog.visitorId = normalizedVisitorId;
            existingPageLog.trackingVersion = 2;
            existingPageLog.sessionDuration = Math.max(existingPageLog.sessionDuration || 0, parseInt(sessionDuration) || 0);
            existingPageLog.timeOnPage = Math.max(existingPageLog.timeOnPage || 0, parseInt(timeOnPage) || 0);
            existingPageLog.interactionCount = Math.max(existingPageLog.interactionCount || 0, parseInt(interactionCount) || 0);
            existingPageLog.scrollDepth = Math.max(existingPageLog.scrollDepth || 0, Math.min(100, parseInt(scrollDepth) || 0));
            
            await existingPageLog.save();
            
            return NextResponse.json({
                success: true,
                message: "Visitor metrics updated",
                data: { id: existingPageLog._id }
            });
        }

        const [sessionExists, visitorExists] = await Promise.all([
            VisitorLog.exists({ sessionId: normalizedSessionId }),
            VisitorLog.exists({
                $or: [
                    { visitorId: normalizedVisitorId },
                    {
                        visitorId: { $exists: false },
                        sessionId: normalizedVisitorId,
                    },
                ],
            }),
        ]);
        const isNewSession = !sessionExists;
        const isFirstVisit = !visitorExists;

        // Device and location work is only needed when a new page record is created.
        const deviceInfo = parseUserAgent(requestUserAgent);
        const clientIP = getClientIP(req);
        const geoInfo = await getGeoFromIP(clientIP);

        // Create visitor log
        const visitorLog = new VisitorLog({
            page: normalizedPage,
            userAgent: requestUserAgent || 'Unknown',
            visitorId: normalizedVisitorId,
            sessionId: normalizedSessionId,
            trackingVersion: 2,
            device: {
                type: deviceInfo.type || 'unknown',
                browser: deviceInfo.browser || 'Unknown',
                os: deviceInfo.os || 'Unknown',
            },
            geo: {
                ip: clientIP,
                country: geoInfo.country || 'Unknown',
                countryCode: geoInfo.countryCode || '',
                city: geoInfo.city || 'Unknown',
                latitude: geoInfo.latitude ?? null,
                longitude: geoInfo.longitude ?? null,
            },
            sessionDuration: Math.max(0, parseInt(sessionDuration) || 0),
            referrer: referrer.trim() || '',
            isNewSession,
            timeOnPage: Math.max(0, parseInt(timeOnPage) || 0),
            interactionCount: Math.max(0, parseInt(interactionCount) || 0),
            scrollDepth: Math.max(0, Math.min(100, parseInt(scrollDepth) || 0)),
        });

        const savedLog = await visitorLog.save();
        
        // Emit socket events for real-time updates
        const { emitSocketEvent } = await import("@/lib/socket");
        if (isNewSession) {
            emitSocketEvent('new_visitor', {
                page: normalizedPage,
                timestamp: savedLog.createdAt,
                country: savedLog.geo.country,
                device: savedLog.device.type,
                isFirstVisit,
            });
        }
        emitSocketEvent('STATS_UPDATED', { type: 'visitor', page });

        return NextResponse.json({
            success: true,
            message: "Visitor tracked successfully",
            data: {
                id: savedLog._id,
                visitorId: savedLog.visitorId,
                sessionId: savedLog.sessionId,
                isFirstVisit,
                isNewSession,
                page: savedLog.page,
                device: savedLog.device.type,
                country: savedLog.geo.country,
            },
        });
    } catch (error) {
        console.error("[Visitor Tracking API] Error:", error.message);
        // Visitor analytics must never make the public page appear broken when
        // the database is temporarily unavailable. The failure remains logged
        // server-side for observability and can be retried by the next heartbeat.
        return NextResponse.json(
            { success: false, error: "Visitor analytics temporarily unavailable" },
            { status: 202 }
        );
    }
}
