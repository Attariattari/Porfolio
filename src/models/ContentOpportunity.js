import mongoose from "mongoose";

const ContentOpportunitySchema = new mongoose.Schema(
  {
    version: { type: String, default: "1.0.0" },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      index: true,
      sparse: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    opportunityType: {
      type: String,
      enum: [
        "ctr_optimization",
        "ranking_boost",
        "content_gap",
        "cluster_expansion",
        "content_decay",
        "emerging_query",
      ],
      required: true,
      index: true,
    },
    opportunityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
      index: true,
    },
    reason: { type: String, trim: true },
    evidence: { type: mongoose.Schema.Types.Mixed, default: {} },
    recommendedAction: { type: String, trim: true },
    recommendedTopicTitle: { type: String, trim: true },
    targetClusterKey: { type: String, trim: true, index: true },
    status: {
      type: String,
      enum: ["suggested", "approved", "rejected", "converted_to_topic", "expired"],
      default: "suggested",
      index: true,
    },
    lastSyncAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ContentOpportunitySchema.index({ slug: 1, opportunityType: 1 }, { unique: true });
ContentOpportunitySchema.index({ status: 1, opportunityScore: -1 });

export const ContentOpportunity =
  mongoose.models.ContentOpportunity ||
  mongoose.model("ContentOpportunity", ContentOpportunitySchema);
