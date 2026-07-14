import { Server } from 'socket.io';
import { setupSocketServer } from '@/lib/socket';

const SOCKET_TRANSPORT_PATH = '/api/socketio';

/**
 * Installs Socket.IO on the local persistent Next.js HTTP server. Keeping this
 * normal HTTP endpoint separate from the transport path prevents 400 responses
 * caused by Socket.IO interpreting a bootstrap request as a handshake.
 */
export default function handler(req, res) {
  const httpServer = res.socket.server;
  const existing = httpServer.io;

  if (existing?.muhyoTransportPath === SOCKET_TRANSPORT_PATH) {
    globalThis.io = existing;
    return res.status(204).end();
  }

  // Supports development HMR after a transport-path change without requiring
  // a stale server instance to remain attached to the HTTP server.
  if (existing) existing.close();

  const io = new Server(httpServer, {
    path: SOCKET_TRANSPORT_PATH,
    addTrailingSlash: false,
  });

  io.muhyoTransportPath = SOCKET_TRANSPORT_PATH;
  setupSocketServer(io);
  globalThis.io = io;
  httpServer.io = io;

  return res.status(204).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
