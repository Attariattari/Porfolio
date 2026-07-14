/**
 * Socket.io Real-Time Events System (OPTIONAL)
 * For live message updates in admin dashboard.
 */

import { io } from 'socket.io-client';

const SOCKET_TRANSPORT_PATH = '/api/socketio';
let localSocketBootstrap = null;

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
  BLOG_UPDATED: 'blog:updated',
  BLOG_IMAGE_UPLOADED: 'blog:image-uploaded',
  NEW_SERVICE: 'new_service',
  SERVICE_CREATED: 'service:created',
  SERVICE_UPDATED: 'service:updated',
  SERVICES_IMPORTED: 'services:imported',
  PUBLIC_DATA_UPDATED: 'public-data:updated',
  CACHE_INVALIDATED: 'cache:invalidated',
  NEW_PROJECT: 'new_project',
  SETTINGS_UPDATED: 'settings_updated',
  BLOGS_REORDERED: 'blogs_reordered',
  PROJECTS_REORDERED: 'projects_reordered',
  SERVICES_REORDERED: 'services_reordered',
};

/**
 * Initialize Socket.io client in browser.
 */
export function initializeSocket(options = {}) {
  if (typeof window === 'undefined') return null;

  // The legacy Socket.IO server relies on a persistent Node HTTP server.
  // Keep it available for local/VPS development, but do not try to wake it on
  // Vercel Functions unless an external compatible socket service is enabled.
  const socketEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_SOCKET_IO === 'true';

  if (!socketEnabled) return null;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '/';
  const socket = io(socketUrl, {
    path: SOCKET_TRANSPORT_PATH,
    addTrailingSlash: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    autoConnect: Boolean(process.env.NEXT_PUBLIC_SOCKET_URL),
    ...options,
  });

  // Local Next.js needs one normal HTTP request to install Socket.IO on the
  // persistent development server. Its transport uses a different path so
  // this bootstrap request is never mistaken for a Socket.IO handshake.
  if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
    if (!localSocketBootstrap) {
      localSocketBootstrap = fetch('/api/socket-bootstrap', { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`Socket bootstrap returned ${response.status}`);
        })
        .catch((error) => {
          localSocketBootstrap = null;
          throw error;
        });
    }

    localSocketBootstrap
      .then(() => {
        if (!socket.__muhyoDisposed) socket.connect();
      })
      .catch((error) => {
        if (!socket.__muhyoDisposed) console.warn('Socket initialization failed:', error.message);
      });
  }

  return socket;
}

export function disposeSocket(socket) {
  if (!socket) return;
  socket.__muhyoDisposed = true;
  socket.removeAllListeners();
  socket.disconnect();
}

/**
 * Server-side Socket.io initialization (Node.js backend).
 */
export const setupSocketServer = (ioServer) => {
  ioServer.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_admin', (userId) => {
      socket.join(`admin_${userId}`);
      console.log(`User ${userId} joined admin room`);
    });

    socket.on('listen_messages', () => {
      socket.join('messages_room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return ioServer;
};

/**
 * Emit events from server API routes. Socket.io is optional, so events are
 * skipped quietly until /api/socket-bootstrap has initialized the server.
 */
export const emitSocketEvent = (eventName, data) => {
  if (globalThis.io) {
    console.log(`[SOCKET] Emitting event: ${eventName}`);
    globalThis.io.emit(eventName, data);
    return true;
  }

  if (process.env.SOCKET_DEBUG === 'true') {
    console.debug(`[SOCKET] Skipped ${eventName}: Socket.io is not initialized`);
  }

  return false;
};
