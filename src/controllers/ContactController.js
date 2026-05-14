/**
 * ContactController - Manages contact form operations
 * Handles creation, retrieval, filtering, and admin reply logic
 */

import dbConnect from "@/lib/dbConnect";
import { ContactMessage } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendEmail } from "@/lib/mailer";
import { generateContactReplyEmail } from "@/lib/emailTemplates";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";

export const ContactController = {
  /**
   * Create a new contact message
   */
  create: async (data) => {
    try {
      await dbConnect();

      const newMessage = await ContactMessage.create({
        name: data.name,
        email: data.email,
        subject: data.subject || "",
        message: data.message,
        service: data.service || "general",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: "new",
        isRead: false,
      });

      const serializedMessage = serializeDoc(newMessage);

      // Emit socket event for real-time update
      try {
        emitSocketEvent(SOCKET_EVENTS.NEW_MESSAGE, serializedMessage);
        emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
        
        // Emit universal event via eventBus for SSE
        eventBus.emit(ADMIN_EVENTS.MESSAGE_UPDATE, serializedMessage);
        eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);
      } catch (socketErr) {
        console.warn("[ContactController.create] Socket emission failed:", socketErr.message);
      }

      // Create a real-time notification
      try {
        const { NotificationController } = await import("./NotificationController");
        await NotificationController.create({
          type: "message",
          title: "New Client Inquiry",
          message: `Message from ${data.name}: ${data.subject || "No Subject"}`,
        });
      } catch (err) {
        console.error("[ContactController.create] Failed to create notification:", err);
      }

      return serializedMessage;
    } catch (err) {
      console.error("[ContactController.create] Error:", err);
      throw err;
    }
  },

  /**
   * Get all messages with filters and pagination
   */
  getAll: async ({
    page = 1,
    limit = 10,
    service,
    status,
    search,
    sortBy = "latest",
  } = {}) => {
    await dbConnect();

    // Safely parse page and limit
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    console.log("[ContactController.getAll] Params:", { 
      page: pageNum, 
      limit: limitNum, 
      service, 
      status, 
      search, 
      sortBy 
    });

    // Build filter query
    const filter = {};
    
    // Define main services to exclude from "other"
    const MAIN_SERVICES = [
      "web-development",
      "ui-ux-design",
      "api-development",
      "mobile-app-development",
      "cloud-devops",
      "seo-optimization"
    ];

    if (service !== undefined && service !== null && service !== "") {
      if (service === "other") {
        filter.service = { $nin: MAIN_SERVICES };
      } else {
        filter.service = service;
      }
    }
    
    if (status !== undefined && status !== null && status !== "") {
      filter.status = status;
    }

    // Add search filter
    if (search && search !== undefined && search !== "") {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    // Build sort query
    let sortQuery = { createdAt: -1 }; // default: latest
    if (sortBy === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sortBy === "name") {
      sortQuery = { name: 1 };
    } else if (sortBy === "email") {
      sortQuery = { email: 1 };
    }

    console.log("[ContactController.getAll] Filter applied:", JSON.stringify(filter));

    // Execute query with pagination
    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort(sortQuery)
        .limit(limitNum)
        .skip(skip)
        .lean(),
      ContactMessage.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      data: serializeDoc(messages),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    };
  },

  /**
   * Get single message by ID and mark as read
   */
  getById: async (messageId) => {
    await dbConnect();

    // Only update to 'seen' if it's currently 'new'
    // This prevents 'replied' messages from reverting to 'seen' status
    const message = await ContactMessage.findById(messageId);
    if (!message) throw new Error("Message not found");

    if (message.status === "new") {
      message.status = "seen";
      message.isRead = true;
      await message.save();
    }

    if (!message) {
      throw new Error("Message not found");
    }

    const serialized = serializeDoc(message);

    // Emit socket event
    emitSocketEvent(SOCKET_EVENTS.MESSAGE_SEEN, serialized);
    emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);

    // Emit universal events for SSE
    eventBus.emit(ADMIN_EVENTS.MESSAGE_UPDATE, { messageId, status: "seen" });
    eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);

    return serialized;
  },

  /**
   * Send admin reply to user
   */
  sendReply: async (messageId, replyText, adminUserId) => {
    try {
      await dbConnect();

      const message = await ContactMessage.findById(messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      // Update message with reply
      message.adminReply = {
        text: replyText,
        repliedAt: new Date(),
        repliedBy: adminUserId,
      };
      message.status = "replied";
      await message.save();

      // Send email to user
      try {
        if (!process.env.SMTP_USER) {
          console.warn(`[ContactController.sendReply] SMTP_USER not set. Email skipped for ${message.email}`);
          return { success: true, mocked: true, message: "Reply saved" };
        }

        const emailhtml = generateContactReplyEmail({
          userName: message.name.split(" ")[0],
          originalMessage: message.message,
          adminReply: replyText,
          subject: message.subject,
        });

        await sendEmail({
          to: message.email,
          subject: `[Muhyo Tech] Response to Your Message: ${message.subject || "No Subject"}`,
          html: emailhtml,
        });
      } catch (emailErr) {
        console.error("[ContactController.sendReply] Email failure:", emailErr);
      }

      // Emit socket event
      try {
        emitSocketEvent(SOCKET_EVENTS.MESSAGE_REPLIED, { 
          messageId, 
          status: "replied",
          adminReply: serializeDoc(message.adminReply)
        });
        emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
        
        // Emit universal events for SSE
        eventBus.emit(ADMIN_EVENTS.MESSAGE_UPDATE, { messageId, status: "replied" });
        eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);
      } catch (socketErr) {
        console.warn("[ContactController.sendReply] Socket emission failed:", socketErr.message);
      }

      return { success: true, message: "Reply sent successfully" };
    } catch (err) {
      console.error("[ContactController.sendReply] Error:", err);
      throw err;
    }
  },

  /**
   * Delete a message
   */
  delete: async (messageId) => {
    await dbConnect();

    const deleted = await ContactMessage.findByIdAndDelete(messageId);
    if (!deleted) {
      throw new Error("Message not found");
    }

    // Emit socket event
    emitSocketEvent(SOCKET_EVENTS.MESSAGE_DELETED, messageId);
    emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);

    // Emit universal events for SSE
    eventBus.emit(ADMIN_EVENTS.MESSAGE_UPDATE, { messageId, status: "deleted" });
    eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);

    return { success: true, message: "Message deleted" };
  },

  /**
   * Get unread count (for admin dashboard badge)
   */
  getUnreadCount: async () => {
    await dbConnect();

    const count = await ContactMessage.countDocuments({
      status: "new",
    });

    return count;
  },

  /**
   * Get summary stats (dashboard)
   */
  getStats: async () => {
    await dbConnect();

    const [totalMessages, newMessages, seenMessages, repliedMessages, services] =
      await Promise.all([
        ContactMessage.countDocuments(),
        ContactMessage.countDocuments({ status: "new" }),
        ContactMessage.countDocuments({ status: "seen" }),
        ContactMessage.countDocuments({ status: "replied" }),
        ContactMessage.distinct("service"),
      ]);

    // Get latest message timestamp
    const latestMessage = await ContactMessage.findOne()
      .sort({ createdAt: -1 })
      .select("createdAt");

    return {
      totalMessages,
      newMessages,
      seenMessages,
      repliedMessages,
      services: services.filter(Boolean),
      lastMessageTime: latestMessage?.createdAt || null,
    };
  },

  /**
   * Get messages by service (for filtering)
   */
  getByService: async (service, limit = 10) => {
    await dbConnect();

    const messages = await ContactMessage.find({ service })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return serializeDoc(messages);
  },
};
