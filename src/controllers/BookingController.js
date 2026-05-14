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

export const BookingController = {
  /**
   * Create a new booking request
   */
  create: async (data) => {
    try {
      await dbConnect();
      const booking = await Booking.create({
        ...data,
        status: 'new',
        isRead: false
      });

      const serialized = serializeDoc(booking);

      // Emit events for real-time dashboard updates
      emitSocketEvent(SOCKET_EVENTS.NEW_BOOKING, serialized);
      emitSocketEvent(SOCKET_EVENTS.BOOKING_STATS_UPDATED); 
      eventBus.emit(ADMIN_EVENTS.BOOKING_UPDATE, serialized);
      eventBus.emit(ADMIN_EVENTS.STATS_UPDATE);

      // Create internal notification
      try {
        await NotificationController.create({
          type: "booking",
          title: "New Call Booking",
          message: `Booking request from ${data.name} for ${data.service}`,
        });
      } catch (err) {
        console.error("[BookingController.create] Notification failed:", err);
      }

      // Send initial request confirmation email to user
      try {
        if (process.env.SMTP_USER) {
          const emailHtml = generateBookingConfirmationEmail({
            userName: data.name,
            service: data.service,
            date: data.preferredDate,
            time: data.preferredTime
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
    if (service) query.service = service;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
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
   * Get single booking by ID and mark as seen if new
   */
  getById: async (id) => {
    if (!id) throw new Error("ID required for operational retrieval");
    await dbConnect();
    
    // Use an atomic update to mark as seen ONLY if it was new
    // This prevents status resets from other states
    let booking = await Booking.findOneAndUpdate(
      { _id: id, status: 'new' },
      { $set: { status: 'seen', isRead: true, updatedAt: new Date() } },
      { new: true }
    );

    // If it wasn't new, just fetch it as is
    if (!booking) {
      booking = await Booking.findById(id);
    }

    if (!booking) throw new Error("Booking record not found in mainframe");

    const serialized = serializeDoc(booking);

    // If we transitioned to 'seen', emit updates
    if (booking.status === 'seen' && booking.isRead === true) {
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
    
    const { status, meetingLink, adminNote, rejectionReason, isManualEmail, customMessage } = updateData;
    
    const existing = await Booking.findById(id);
    if (!existing) throw new Error("Booking not found");

    // Prepare update object
    const updateObj = { updatedAt: new Date() };
    
    // Explicitly check for status to permit state change
    if (status) {
      console.log(`[BookingController] Status transitioning from ${existing.status} to ${status}`);
      updateObj.status = status;
    }
    
    if (meetingLink !== undefined) updateObj.meetingLink = meetingLink;
    if (adminNote !== undefined) updateObj.adminNote = adminNote;
    if (rejectionReason !== undefined) updateObj.rejectionReason = rejectionReason;
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
