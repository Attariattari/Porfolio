/**
 * Socket.io Real-Time Events System (OPTIONAL)
 * For live message updates in admin dashboard
 * 
 * Usage:
 * 1. Add this server initialization to your Next.js app
 * 2. Connect client to socket in admin components
 * 3. Listen for real-time updates
 */

import { io } from 'socket.io-client';

// Events emitted from server
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_MESSAGE: 'new_message',
  MESSAGE_REPLIED: 'message_replied',
  MESSAGE_SEEN: 'message_seen',
  MESSAGE_DELETED: 'message_deleted',
  STATS_UPDATED: 'stats_updated',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_UPDATED: 'notification_updated',
  NOTIFICATION_DELETED: 'notification_deleted',
  NOTIFICATIONS_CLEARED: 'notifications_cleared',
  NEW_BOOKING: 'new_booking',
  BOOKING_UPDATED: 'booking_updated',
  BOOKING_DELETED: 'booking_DELETED',
  BOOKING_STATS_UPDATED: 'booking_stats_updated',
  BOOKING_SEEN: 'booking_seen',
  NEW_SUBSCRIBER: 'new_subscriber',
  NEW_BLOG: 'new_blog',
  NEW_SERVICE: 'new_service',
  NEW_PROJECT: 'new_project',
  SETTINGS_UPDATED: 'settings_updated',
  BLOGS_REORDERED: 'blogs_reordered',
  PROJECTS_REORDERED: 'projects_reordered',
  SERVICES_REORDERED: 'services_reordered',
};

/**
 * Initialize Socket.io client in browser
 */
export function initializeSocket(options = {}) {
  if (typeof window === 'undefined') return null;

  // Wake up the socket server if it's not running
  fetch('/api/socket').catch(err => console.warn('Socket wakeup failed', err));

  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '/', {
    path: '/api/socket',
    addTrailingSlash: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    ...options,
  });

  return socket;
}

/**
 * Server-side Socket.io initialization (Node.js backend)
 */
export const setupSocketServer = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join specific rooms
    socket.on('join_admin', (userId) => {
      socket.join(`admin_${userId}`);
      console.log(`User ${userId} joined admin room`);
    });

    // Listen for new messages
    socket.on('listen_messages', (data) => {
      socket.join('messages_room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

/**
 * Emit events from server (in API routes)
 */
export const emitSocketEvent = (eventName, data) => {
  if (globalThis.io) {
    console.log(`📡 [SOCKET] Emitting event: ${eventName}`);
    globalThis.io.emit(eventName, data);
  } else {
    console.warn(`⚠️ [SOCKET] Cannot emit ${eventName}: globalThis.io is not initialized`);
  }
};
