import mongoose from "mongoose";

const ContentPerformanceSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    ctr: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averagePosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceCtaClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    topQueries: [
      {
        query: String,
        impressions: Number,
        clicks: Number,
        position: Number,
      },
    ],
    opportunityType: {
      type: String,
      enum: ["optimization", "supporting_cluster", "conversion", "stable", "deprioritize"],
      default: "stable",
      index: true,
    },
    isEstimated: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const ContentPerformance =
  mongoose.models.ContentPerformance ||
  mongoose.model("ContentPerformance", ContentPerformanceSchema);
