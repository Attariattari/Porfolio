import dbConnect from "@/lib/dbConnect";
import { Notification } from "@/models/AdminModels";
import { serializeDoc } from "@/lib/mongooseHelper";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";

export const NotificationController = {
  /**
   * Create a new notification
   */
  create: async (data) => {
    await dbConnect();
    const notification = await Notification.create({
      type: data.type || "system",
      title: data.title,
      message: data.message,
      status: "unread",
      relatedUserId: data.relatedUserId,
    });

    const serialized = serializeDoc(notification);
    eventBus.emit(ADMIN_EVENTS.NOTIFICATION, serialized);
    emitSocketEvent(SOCKET_EVENTS.NOTIFICATION_RECEIVED, serialized);
    return serialized;
  },

  /**
   * Get all notifications
   */
  getAll: async () => {
    await dbConnect();
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    return notifications.map(serializeDoc);
  },

  /**
   * Mark notification as read
   */
  updateStatus: async (id, status = "read") => {
    await dbConnect();
    const allowedStatuses = ["unread", "read", "approved", "denied"];
    const nextStatus = allowedStatuses.includes(status) ? status : "read";
    const notification = await Notification.findByIdAndUpdate(
      id,
      { status: nextStatus },
      { new: true }
    );
    if (!notification) throw new Error("Notification not found");
    
    const serialized = serializeDoc(notification);
    eventBus.emit(ADMIN_EVENTS.NOTIFICATION_UPDATE, serialized);
    emitSocketEvent(SOCKET_EVENTS.NOTIFICATION_UPDATED, serialized);
    return serialized;
  },

  markAsRead: async (id) => NotificationController.updateStatus(id, "read"),

  /**
   * Mark all as read
   */
  markAllAsRead: async () => {
    await dbConnect();
    await Notification.updateMany({ status: "unread" }, { status: "read" });
    eventBus.emit(ADMIN_EVENTS.NOTIFICATIONS_CLEAR);
    emitSocketEvent(SOCKET_EVENTS.NOTIFICATIONS_CLEARED);
    return { success: true };
  },

  /**
   * Delete a notification
   */
  delete: async (id) => {
    await dbConnect();
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) throw new Error("Notification not found");
    
    eventBus.emit(ADMIN_EVENTS.NOTIFICATION_DELETE, id);
    emitSocketEvent(SOCKET_EVENTS.NOTIFICATION_DELETED, id);
    return { success: true };
  }
};
