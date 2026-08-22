import mongoose from "mongoose";

const ContentPerformanceSnapshotSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    snapshotDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ["gsc_live", "ga4_live", "internal_analytics", "estimated_heuristic"],
      default: "estimated_heuristic",
    },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    averagePosition: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    serviceClicks: { type: Number, default: 0 },
    maturityDays: { type: Number, default: 0 },
    performanceState: {
      type: String,
      enum: [
        "early_indexing",
        "emerging_winner",
        "strong_performer",
        "stable",
        "declining",
        "content_decay",
        "search_opportunity",
        "insufficient_data",
      ],
      default: "early_indexing",
      index: true,
    },
    topQueries: [
      {
        query: String,
        impressions: Number,
        clicks: Number,
        position: Number,
      },
    ],
  },
  { timestamps: true }
);

ContentPerformanceSnapshotSchema.index({ blogId: 1, snapshotDate: -1 });

export const ContentPerformanceSnapshot =
  mongoose.models.ContentPerformanceSnapshot ||
  mongoose.model("ContentPerformanceSnapshot", ContentPerformanceSnapshotSchema);
