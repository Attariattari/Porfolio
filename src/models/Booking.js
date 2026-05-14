import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  service: { type: String, required: true },
  preferredDate: { type: String, required: true },
  preferredTime: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['new', 'seen', 'confirmed', 'completed', 'rejected', 'cancelled'], 
    default: 'new' 
  },
  isRead: { type: Boolean, default: false },
  meetingLink: { type: String },
  adminNote: { type: String },
  rejectionReason: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Force refresh model if in development to pick up schema changes
// This resolves "Validation failed: status: X is not a valid enum" errors 
// during development when the schema is modified.
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Booking;
}

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
