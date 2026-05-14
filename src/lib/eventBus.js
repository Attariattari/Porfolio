import { EventEmitter } from 'events';

// Universal Event Bus for Real-time Muhyo Tech Authority
const globalEventBus = global.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    global.eventBus = globalEventBus;
}

export const ADMIN_EVENTS = {
    NOTIFICATION: 'authority:notif',
    NOTIFICATION_UPDATE: 'authority:notif_update',
    NOTIFICATION_DELETE: 'authority:notif_delete',
    NOTIFICATIONS_CLEAR: 'authority:notif_clear',
    USER_UPDATE: 'authority:user',
    MESSAGE_UPDATE: 'authority:message',
    STATS_UPDATE: 'authority:stats',
    BOOKING_UPDATE: 'authority:booking',
    SETTINGS_UPDATE: 'authority:settings',
};

export default globalEventBus;
