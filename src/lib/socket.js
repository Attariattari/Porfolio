/**
 * Socket.io Real-Time Events System (OPTIONAL)
 * For live message updates in admin dashboard.
 */

import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '@/lib/socketCore';
export { emitSocketEvent, setupSocketServer, SOCKET_EVENTS } from '@/lib/socketCore';

const SOCKET_TRANSPORT_PATH = '/api/socketio';
let localSocketBootstrap = null;

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
