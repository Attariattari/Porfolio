import mongoose from "mongoose";

const AuditEventSchema = new mongoose.Schema({
  action: { type: String, required: true },
  at: { type: Date, default: Date.now },
  by: String,
  details: String,
}, { _id: false });

const InternalLinkSuggestionSchema = new mongoose.Schema({
  sourceBlogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
  targetBlogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
  sourceSlug: { type: String, required: true, index: true },
  targetSlug: { type: String, required: true, index: true },
  anchorText: { type: String, required: true },
  proposedAnchorText: String,
  reason: { type: String, required: true },
  relationship: {
    type: String,
    enum: ["pillar_to_supporting", "supporting_to_pillar", "same_cluster", "contextual", "repair"],
    default: "contextual",
    index: true,
  },
  confidence: { type: Number, min: 0, max: 1, default: 0 },
  status: {
    type: String,
    enum: ["pending", "applied", "rejected", "failed", "rolled_back", "stale", "manual_review"],
    default: "pending",
    index: true,
  },
  automatic: { type: Boolean, default: false },
  placementAvailable: { type: Boolean, default: false },
  placementStatus: {
    type: String,
    enum: ["ready", "manual_required", "unavailable"],
    default: "ready",
  },
  currentExcerpt: { type: String },
  proposedExcerpt: { type: String },
  sourceParagraphHtml: String,
  proposedParagraphHtml: String,
  aiGeneratedPlacement: { type: Boolean, default: false },
  aiPlacementAttempts: { type: Number, default: 0, min: 0 },
  lastAIAttemptAt: Date,
  excerptBefore: String,
  excerptAfter: String,
  previousContent: { type: String },
  manualReviewReason: String,
  repairMetadata: {
    legacyFallbackDetected: Boolean,
    repairedAt: Date,
    brokenTargetSlug: String,
    replacementSlug: String,
  },
  auditMetadata: {
    lastAuditId: String,
    lastAuditedAt: Date,
    ruleVersion: String,
  },
  history: { type: [AuditEventSchema], default: () => [] },
  appliedAt: Date,
  appliedBy: String,
  rolledBackAt: Date,
  error: String,
}, { timestamps: true });

InternalLinkSuggestionSchema.index(
  { sourceBlogId: 1, targetBlogId: 1 },
  { unique: true },
);

export const InternalLinkSuggestion =
  mongoose.models.InternalLinkSuggestion ||
  mongoose.model("InternalLinkSuggestion", InternalLinkSuggestionSchema);
