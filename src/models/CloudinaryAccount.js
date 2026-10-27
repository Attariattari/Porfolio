import mongoose from "mongoose";

/**
 * CloudinaryAccount Schema
 * Manages dynamic multi-account Cloudinary credentials and real-time usage telemetry.
 */
const CloudinaryAccountSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Account label is required"],
      trim: true,
      default: "Secondary Media Account",
    },
    cloudName: {
      type: String,
      required: [true, "Cloud Name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    apiKey: {
      type: String,
      required: [true, "API Key is required"],
      trim: true,
    },
    apiSecret: {
      type: String,
      required: [true, "API Secret is required"],
      trim: true,
    },
    uploadPreset: {
      type: String,
      default: "ml_default",
      trim: true,
    },
    isMaster: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 1, // Higher priority preferred during tied capacity
    },
    status: {
      type: String,
      enum: ["healthy", "warning", "exhausted", "error", "paused"],
      default: "healthy",
    },
    // Real-Time Metrics from Cloudinary Usage API
    usage: {
      totalCredits: { type: Number, default: 25 },
      usedCredits: { type: Number, default: 0 },
      remainingCredits: { type: Number, default: 25 },
      usagePercent: { type: Number, default: 0 },
      bandwidthBytes: { type: Number, default: 0 },
      storageBytes: { type: Number, default: 0 },
      transformations: { type: Number, default: 0 },
      lastSyncedAt: { type: Date, default: null },
    },
    // Audit & failure tracking
    errorLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: { type: String, trim: true },
        httpCode: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// High-speed routing compound index
CloudinaryAccountSchema.index({ isActive: 1, "usage.remainingCredits": -1 });

export const CloudinaryAccount =
  mongoose.models.CloudinaryAccount ||
  mongoose.model("CloudinaryAccount", CloudinaryAccountSchema);

export default CloudinaryAccount;
