import mongoose from "mongoose";

const BlogTopicPlanSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
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
  status: { type: String, enum: ["reserve", "ready", "processing", "used", "rejected", "failed"], default: "ready", index: true },
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

export const BlogTopicPlan = mongoose.models.BlogTopicPlan || mongoose.model("BlogTopicPlan", BlogTopicPlanSchema);
