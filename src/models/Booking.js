import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  service: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  serviceSlug: { type: String, index: true },
  serviceTitle: { type: String },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  projectType: { type: String },
  timelinePreference: { type: String },
  contactPreference: { type: String },
  message: { type: String },
  source: { type: String },
  sourcePage: { type: String },
  contextTitle: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'read', 'seen', 'confirmed', 'completed', 'rejected', 'cancelled'], 
    default: 'new' 
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal',
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  meetingLink: { type: String },
  adminNote: { type: String },
  adminNotes: { type: String },
  replyMessage: { type: String },
  rejectionReason: { type: String },
  confirmedAt: { type: Date },
  rejectedAt: { type: Date },
  completedAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

BookingSchema.pre("validate", function syncBookingFields() {
  if (!this.service && this.serviceTitle) this.service = this.serviceTitle;
  if (!this.serviceTitle && this.service) this.serviceTitle = this.service;
  if (!this.serviceSlug && this.service) this.serviceSlug = this.service;
  if (!this.adminNotes && this.adminNote) this.adminNotes = this.adminNote;
  if (!this.adminNote && this.adminNotes) this.adminNote = this.adminNotes;
});

// Force refresh model if in development to pick up schema changes
// This resolves "Validation failed: status: X is not a valid enum" errors 
// during development when the schema is modified.
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Booking;
}

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
