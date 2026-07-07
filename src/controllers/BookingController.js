import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { serializeDoc } from "@/lib/mongooseHelper";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";
import { sendEmail } from "@/lib/mailer";
import { NotificationController } from "./NotificationController";
import { 
  generateBookingConfirmationEmail, 
  generateBookingActionEmail 
} from "@/lib/emailTemplates";
import { findPublicServiceOption } from "@/lib/services/getPublicServiceOptions";

const cleanText = (value = "") =>
  String(value)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeBookingPayload = async (data = {}) => {
  const requestedService = cleanText(data.serviceSlug || data.service || "");
  const serviceOption = await findPublicServiceOption(requestedService).catch(() => null);
  const serviceSlug = serviceOption?.slug || requestedService;
  const serviceTitle = serviceOption?.title || cleanText(data.serviceTitle || data.service || serviceSlug);

  return {
    name: cleanText(data.name),
    email: cleanText(data.email).toLowerCase(),
    phone: cleanText(data.phone),
    service: serviceTitle || serviceSlug,
    serviceSlug,
    serviceTitle: serviceTitle || serviceSlug,
    preferredDate: cleanText(data.preferredDate),
    preferredTime: cleanText(data.preferredTime),
    projectType: cleanText(data.projectType),
    timelinePreference: cleanText(data.timelinePreference),
    contactPreference: cleanText(data.contactPreference),
    message: cleanText(data.message),
    source: cleanText(data.source || "booking-form"),
    sourcePage: cleanText(data.sourcePage),
    contextTitle: cleanText(data.contextTitle),
    status: "new",
    priority: data.priority || "normal",
    isRead: false,
  };
};

export const BookingController = {
  /**
   * Create a new booking request
   */
  create: async (data) => {
    try {
      await dbConnect();
      const payload = await normalizeBookingPayload(data);
      const booking = await Booking.create(payload);

      const serialized = serializeDoc(booking);

      // Emit events for real-time dashboard updates
      emitSocketEvent(SOCKET_EVENTS.NEW_BOOKING, serialized);
      emitSocketEvent("booking:created", serialized);
      emitSocketEvent(SOCKET_EVENTS.BOOKING_STATS_UPDATED); 
      eventBus.emit(ADMIN_EVENTS.BOOKING_UPDATE, serialized);
      eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);

      // Create internal notification
      try {
        await NotificationController.create({
          type: "booking",
          title: "New Call Booking",
          message: `Booking request from ${payload.name} for ${payload.serviceTitle}`,
        });
      } catch (err) {
        console.error("[BookingController.create] Notification failed:", err);
      }

      // Send initial request confirmation email to user
      try {
        if (process.env.SMTP_USER) {
          const emailHtml = generateBookingConfirmationEmail({
            userName: payload.name,
            service: payload.serviceTitle,
            date: payload.preferredDate,
            time: payload.preferredTime
          });
          
          await sendEmail({
            to: data.email,
            subject: "[Muhyo Tech] Strategy Call Requested",
            html: emailHtml,
          });
        }
      } catch (emailErr) {
        console.error("[BookingController.create] Email failed:", emailErr);
      }

      // Send optional admin notification without blocking the booking flow
      try {
        const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail && process.env.SMTP_USER) {
          await sendEmail({
            to: adminEmail,
            subject: "[Muhyo Tech] New Booking Request",
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                <h2>New booking request</h2>
                <p><strong>Name:</strong> ${payload.name}</p>
                <p><strong>Email:</strong> ${payload.email}</p>
                <p><strong>Phone:</strong> ${payload.phone || "Not provided"}</p>
                <p><strong>Service:</strong> ${payload.serviceTitle}</p>
                <p><strong>Preferred date/time:</strong> ${payload.preferredDate} ${payload.preferredTime}</p>
                <p><strong>Source page:</strong> ${payload.sourcePage || payload.source}</p>
                <p><strong>Message:</strong></p>
                <p>${payload.message}</p>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/bookings">Open admin bookings</a></p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.error("[BookingController.create] Admin email failed:", emailErr);
      }

      return serialized;
    } catch (error) {
      console.error("[BookingController.create] Error:", error);
      throw error;
    }
  },

  /**
   * Get all bookings with filtering and pagination
   */
  getAll: async (filters = {}) => {
    await dbConnect();
    const { page = 1, limit = 10, status, service, search } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (service) {
      query.$or = [
        { service: service },
        { serviceSlug: service },
        { serviceTitle: { $regex: service, $options: 'i' } },
      ];
    }
    if (search) {
      const searchQuery = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
        { serviceSlug: { $regex: search, $options: 'i' } },
        { serviceTitle: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchQuery }];
        delete query.$or;
      } else {
        query.$or = searchQuery;
      }
    }

    const [data, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(query)
    ]);

    return {
      success: true,
      data: data.map(serializeDoc),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + data.length < total,
        hasPrev: page > 1
      }
    };
  },

  /**
   * Get single booking by ID and mark as read if new
   */
  getById: async (id) => {
    if (!id) throw new Error("ID required for operational retrieval");
    await dbConnect();
    
    // Use an atomic update to mark as read ONLY if it was new
    // This prevents status resets from other states
    let booking = await Booking.findOneAndUpdate(
      { _id: id, status: 'new' },
      { $set: { status: 'read', isRead: true, readAt: new Date(), updatedAt: new Date() } },
      { new: true }
    );

    // If it wasn't new, just fetch it as is
    if (!booking) {
      booking = await Booking.findById(id);
    }

    if (!booking) throw new Error("Booking record not found in mainframe");

    const serialized = serializeDoc(booking);

    // If we transitioned to read, emit updates
    if ((booking.status === 'read' || booking.status === 'seen') && booking.isRead === true) {
      emitSocketEvent(SOCKET_EVENTS.BOOKING_SEEN, serialized);
      emitSocketEvent(SOCKET_EVENTS.BOOKING_STATS_UPDATED); 
      emitSocketEvent(SOCKET_EVENTS.BOOKING_UPDATED, serialized);
      eventBus.emit(ADMIN_EVENTS.BOOKING_UPDATE, serialized);
      eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);
    }

    return serialized;
  },

  /**
   * Update booking status and details
   */
  update: async (id, updateData) => {
    if (!id) throw new Error("ID required for operational update");
    await dbConnect();
    
    console.log(`[BookingController] Updating booking ${id} with:`, updateData);
    
    const { status, meetingLink, adminNote, adminNotes, rejectionReason, isManualEmail, customMessage, replyMessage } = updateData;
    
    const existing = await Booking.findById(id);
    if (!existing) throw new Error("Booking not found");

    // Prepare update object
    const updateObj = { updatedAt: new Date() };
    
    // Explicitly check for status to permit state change
    if (status) {
      console.log(`[BookingController] Status transitioning from ${existing.status} to ${status}`);
      updateObj.status = status;
      if (status === "read") updateObj.readAt = new Date();
      if (status === "confirmed") updateObj.confirmedAt = new Date();
      if (status === "rejected") updateObj.rejectedAt = new Date();
      if (status === "completed") updateObj.completedAt = new Date();
    }
    
    if (meetingLink !== undefined) updateObj.meetingLink = meetingLink;
    if (adminNote !== undefined) updateObj.adminNote = adminNote;
    if (adminNotes !== undefined) updateObj.adminNotes = adminNotes;
    if (rejectionReason !== undefined) updateObj.rejectionReason = rejectionReason;
    if (replyMessage !== undefined) updateObj.replyMessage = replyMessage;
    if (updateData.isRead !== undefined) updateObj.isRead = updateData.isRead;

    // Perform atomic update
    const updated = await Booking.findByIdAndUpdate(
      id, 
      { $set: updateObj }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) throw new Error("Failed to commit updates to database");
    
    console.log(`[BookingController] Update successful. New status: ${updated.status}`);
    
    const serialized = serializeDoc(updated);

    // Emit socket events
    emitSocketEvent(SOCKET_EVENTS.BOOKING_UPDATED, serialized);
    emitSocketEvent("booking:updated", serialized);
    emitSocketEvent(SOCKET_EVENTS.BOOKING_STATS_UPDATED);
    eventBus.emit(ADMIN_EVENTS.BOOKING_UPDATE, serialized);
    eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);

    // Handle Email Triggers
    try {
      if (process.env.SMTP_USER && (status || isManualEmail)) {
        let shouldSend = false;
        let emailType = status;

        if (isManualEmail) {
           shouldSend = true;
           emailType = 'manual';
        } else if (status && status !== existing.status && ['confirmed', 'completed', 'rejected'].includes(status)) {
           shouldSend = true;
        }

        if (shouldSend) {
          const emailHtml = generateBookingActionEmail({
            userName: updated.name,
            status: emailType,
            service: updated.service,
            date: updated.preferredDate,
            time: updated.preferredTime,
            meetingLink: updated.meetingLink,
            rejectionReason: updated.rejectionReason,
            customMessage: customMessage
          });

          await sendEmail({
            to: updated.email,
            subject: `[Muhyo Tech] Update Regarding Your Booking`,
            html: emailHtml,
          });
        }
      }
    } catch (emailErr) {
      console.error("[BookingController.update] Email failed:", emailErr);
    }

    return serialized;
  },

  /**
   * Delete a booking
   */
  delete: async (id) => {
    if (!id) throw new Error("ID required for purge");
    await dbConnect();
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) throw new Error("Booking not found");

    emitSocketEvent(SOCKET_EVENTS.BOOKING_DELETED, id);
    emitSocketEvent(SOCKET_EVENTS.BOOKING_STATS_UPDATED);
    eventBus.emit(ADMIN_EVENTS.BOOKING_UPDATE, { id, status: 'deleted' });
    eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);
    return { success: true };
  },

  /**
   * Get operational statistics
   */
  getStats: async () => {
    await dbConnect();
    const [total, newCount, confirmed, completed] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'new' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' })
    ]);

    return { 
      total, 
      new: newCount,
      confirmed, 
      completed 
    };
  }
};
