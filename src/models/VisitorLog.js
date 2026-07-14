import mongoose from "mongoose";

const visitorLogSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    index: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  visitorId: {
    type: String,
    index: true,
  },
  trackingVersion: {
    type: Number,
    default: 1,
  },
  // Device Detection
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    browser: String,
    os: String,
  },
  // Geolocation
  geo: {
    ip: String,
    country: String,
    countryCode: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },
  // Session metrics
  sessionDuration: Number, // in seconds
  referrer: String,
  isNewSession: {
    type: Boolean,
    default: true,
  },
  // Page interaction
  scrollDepth: Number, // 0-100 percentage
  timeOnPage: Number, // in seconds
  interactionCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Indexes for performance
visitorLogSchema.index({ createdAt: -1 });
visitorLogSchema.index({ 'device.type': 1 });
visitorLogSchema.index({ 'geo.country': 1 });
visitorLogSchema.index({ page: 1, createdAt: -1 });
visitorLogSchema.index({ sessionId: 1, createdAt: -1 });
visitorLogSchema.index({ visitorId: 1, createdAt: -1 });
visitorLogSchema.index({ visitorId: 1, sessionId: 1, createdAt: -1 });

export const VisitorLog = mongoose.models.VisitorLog || mongoose.model("VisitorLog", visitorLogSchema);
