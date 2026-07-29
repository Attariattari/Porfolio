/**
 * Socket event names and server-side helpers.
 *
 * This module intentionally has no browser Socket.IO dependency. Public
 * server-rendered controllers can emit optional events without pulling the
 * admin socket client into the public route dependency graph.
 */
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  NEW_MESSAGE: "new_message",
  MESSAGE_REPLIED: "message_replied",
  MESSAGE_SEEN: "message_seen",
  MESSAGE_DELETED: "message_deleted",
  STATS_UPDATED: "stats_updated",
  NOTIFICATION_RECEIVED: "notification_received",
  NOTIFICATION_UPDATED: "notification_updated",
  NOTIFICATION_DELETED: "notification_deleted",
  NOTIFICATIONS_CLEARED: "notifications_cleared",
  NEW_BOOKING: "new_booking",
  BOOKING_UPDATED: "booking_updated",
  BOOKING_DELETED: "booking_DELETED",
  BOOKING_STATS_UPDATED: "booking_stats_updated",
  BOOKING_SEEN: "booking_seen",
  NEW_SUBSCRIBER: "new_subscriber",
  NEW_BLOG: "new_blog",
  BLOG_UPDATED: "blog:updated",
  BLOG_IMAGE_UPLOADED: "blog:image-uploaded",
  NEW_SERVICE: "new_service",
  SERVICE_CREATED: "service:created",
  SERVICE_UPDATED: "service:updated",
  SERVICES_IMPORTED: "services:imported",
  PUBLIC_DATA_UPDATED: "public-data:updated",
  CACHE_INVALIDATED: "cache:invalidated",
  NEW_PROJECT: "new_project",
  SETTINGS_UPDATED: "settings_updated",
  BLOGS_REORDERED: "blogs_reordered",
  PROJECTS_REORDERED: "projects_reordered",
  SERVICES_REORDERED: "services_reordered",
};

export function setupSocketServer(ioServer) {
  ioServer.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_admin", (userId) => {
      socket.join(`admin_${userId}`);
      console.log(`User ${userId} joined admin room`);
    });

    socket.on("listen_messages", () => {
      socket.join("messages_room");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return ioServer;
}

export function emitSocketEvent(eventName, data) {
  if (globalThis.io) {
    console.log(`[SOCKET] Emitting event: ${eventName}`);
    globalThis.io.emit(eventName, data);
    return true;
  }

  if (process.env.SOCKET_DEBUG === "true") {
    console.debug(`[SOCKET] Skipped ${eventName}: Socket.io is not initialized`);
  }

  return false;
}
