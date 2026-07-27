import mongoose from "mongoose";

const BlogTopicPlanSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  articleType: { type: String, enum: ["pillar", "supporting"], default: "supporting", index: true },
  clusterKey: { type: String, trim: true, index: true },
  clusterTitle: { type: String, trim: true },
  parentTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogTopicPlan", default: null, index: true },
  clusterOrder: { type: Number, min: 0, max: 2, default: 0 },
  pillar: { type: String, required: true, trim: true, index: true },
  subtopic: { type: String, required: true, trim: true },
  problem: { type: String, required: true, trim: true },
  solutionAngle: { type: String, required: true, trim: true },
  businessValue: { type: String, trim: true },
  audience: { type: String, trim: true },
  focusKeyword: { type: String, required: true, trim: true },
  searchIntent: { type: String, enum: ["informational", "commercial", "transactional", "navigational"], default: "informational" },
  format: { type: String, trim: true },
  relatedServiceSlugs: [{ type: String }],
  fingerprint: { type: String, required: true, unique: true, index: true },
  source: { type: String, enum: ["ai", "manual", "fallback"], default: "ai", index: true },
  status: { type: String, enum: ["planned", "reserve", "ready", "processing", "used", "rejected", "failed"], default: "ready", index: true },
  priority: { type: Number, min: 0, max: 100, default: 50, index: true },
  scheduledFor: { type: Date, default: null, index: true },
  notes: { type: String, trim: true },
  retryCount: { type: Number, default: 0 },
  processingStartedAt: Date,
  usedAt: Date,
  usedByBlogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
  failureReason: String,
}, { timestamps: true });

BlogTopicPlanSchema.index({ status: 1, scheduledFor: 1, priority: -1, createdAt: 1 });
BlogTopicPlanSchema.index({ clusterKey: 1, articleType: 1, clusterOrder: 1 });

export const BlogTopicPlan = mongoose.models.BlogTopicPlan || mongoose.model("BlogTopicPlan", BlogTopicPlanSchema);
