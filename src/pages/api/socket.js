import { Server } from 'socket.io';
import { setupSocketServer } from '@/lib/socket';

/**
 * Socket.io API Route (Pages Router)
 * This is the standard way to initialize Socket.io in Next.js.
 * Even if you use App Router, you can create a 'pages' directory for this.
 */
export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('✅ Socket.io already running');
  } else {
    console.log('🚀 Socket.io initializing...');
    const io = new Server(res.socket.server, {
      path: '/api/socket', // Custom path to match our API route
      addTrailingSlash: false,
    });
    
    // Initialize our custom server logic
    setupSocketServer(io);
    
    // Assign to globalThis so server-side controllers can use it to emit events
    globalThis.io = io;
    res.socket.server.io = io;
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
