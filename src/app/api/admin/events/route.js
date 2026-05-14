import { NextResponse } from "next/server";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const encoder = new TextEncoder();
    const session = await getAuthSession();
    const isAuthorized = !!session;

    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (event, data) => {
                const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            const onNotif = (data) => {
                if (isAuthorized) sendEvent('notification', data);
            };

            const onNotifUpdate = (data) => {
                if (isAuthorized) sendEvent('notification_update', data);
            };

            const onNotifDelete = (id) => {
                if (isAuthorized) sendEvent('notification_delete', { id });
            };

            const onNotifClear = () => {
                if (isAuthorized) sendEvent('notification_clear', {});
            };

            const onUser = (data) => {
                sendEvent('user', data);
            };

            const onMessage = (data) => {
                if (isAuthorized) sendEvent('message', data);
            };

            const onStats = (data) => {
                if (isAuthorized) sendEvent('stats', data);
            };

            const onBooking = (data) => {
                if (isAuthorized) sendEvent('booking', data);
            };

            const onSettings = (data) => {
                if (isAuthorized) sendEvent('settings', data);
            };

            eventBus.on(ADMIN_EVENTS.NOTIFICATION, onNotif);
            eventBus.on(ADMIN_EVENTS.NOTIFICATION_UPDATE, onNotifUpdate);
            eventBus.on(ADMIN_EVENTS.NOTIFICATION_DELETE, onNotifDelete);
            eventBus.on(ADMIN_EVENTS.NOTIFICATIONS_CLEAR, onNotifClear);
            eventBus.on(ADMIN_EVENTS.USER_UPDATE, onUser);
            eventBus.on(ADMIN_EVENTS.MESSAGE_UPDATE, onMessage);
            eventBus.on(ADMIN_EVENTS.STATS_UPDATE, onStats);
            eventBus.on(ADMIN_EVENTS.BOOKING_UPDATE, onBooking);
            eventBus.on(ADMIN_EVENTS.SETTINGS_UPDATE, onSettings);

            const keepAlive = setInterval(() => {
                controller.enqueue(encoder.encode(': keepalive\n\n'));
            }, 15000);

            request.signal.addEventListener('abort', () => {
                clearInterval(keepAlive);
                eventBus.off(ADMIN_EVENTS.NOTIFICATION, onNotif);
                eventBus.off(ADMIN_EVENTS.NOTIFICATION_UPDATE, onNotifUpdate);
                eventBus.off(ADMIN_EVENTS.NOTIFICATION_DELETE, onNotifDelete);
                eventBus.off(ADMIN_EVENTS.NOTIFICATIONS_CLEAR, onNotifClear);
                eventBus.off(ADMIN_EVENTS.USER_UPDATE, onUser);
                eventBus.off(ADMIN_EVENTS.MESSAGE_UPDATE, onMessage);
                eventBus.off(ADMIN_EVENTS.STATS_UPDATE, onStats);
                eventBus.off(ADMIN_EVENTS.BOOKING_UPDATE, onBooking);
                eventBus.off(ADMIN_EVENTS.SETTINGS_UPDATE, onSettings);
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // For Nginx
        },
    });
}
