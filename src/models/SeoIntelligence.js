import mongoose from "mongoose";

const SeoIntelligenceSchema = new mongoose.Schema(
  {
    version: { type: String, default: "1.0.0" },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      index: true,
      sparse: true,
    },
    topicPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogTopicPlan",
      index: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["completed", "degraded", "skipped"],
      default: "completed",
    },
    decision: {
      type: String,
      enum: ["PASS", "PASS_WITH_RECOMMENDATIONS", "REVISE", "HUMAN_REVIEW", "BLOCK"],
      default: "PASS",
      index: true,
    },
    score: { type: Number, min: 0, max: 100, default: 80, index: true },

    searchIntent: {
      declared: { type: String, trim: true, default: "informational" },
      matched: { type: Boolean, default: true },
      score: { type: Number, min: 0, max: 100, default: 85 },
      reasons: [{ type: String, trim: true }],
    },

    topicAlignment: {
      score: { type: Number, min: 0, max: 100, default: 80 },
      focusKeywordInTitle: { type: Boolean, default: false },
      focusKeywordInSummary: { type: Boolean, default: false },
      focusKeywordInH2: { type: Boolean, default: false },
    },

    semanticCoverage: {
      score: { type: Number, min: 0, max: 100, default: 80 },
      covered: [{ type: String, trim: true }],
      missing: [{ type: String, trim: true }],
    },

    entityCoverage: {
      score: { type: Number, min: 0, max: 100, default: 80 },
      covered: [{ type: String, trim: true }],
      missing: [{ type: String, trim: true }],
    },

    contentCompleteness: {
      wordCount: { type: Number, default: 0 },
      sectionCount: { type: Number, default: 0 },
      hasFaq: { type: Boolean, default: false },
      hasTable: { type: Boolean, default: false },
      hasCode: { type: Boolean, default: false },
    },

    cannibalizationRisk: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },
    cannibalizationScore: { type: Number, min: 0, max: 100, default: 0 },
    classification: { type: String, trim: true, default: "UNIQUE" },

    competingArticles: [
      {
        blogId: { type: String, trim: true },
        title: { type: String, trim: true },
        slug: { type: String, trim: true },
        similarity: { type: Number, min: 0, max: 1, default: 0 },
        intentOverlap: { type: Number, min: 0, max: 1, default: 0 },
        relationship: { type: String, trim: true, default: "competing" },
      },
    ],

    internalAuthority: {
      score: { type: Number, min: 0, max: 100, default: 80 },
      serviceLinks: [{ type: String, trim: true }],
      recommendedLinks: [{ type: String, trim: true }],
    },

    detectedGaps: [{ type: String, trim: true }],
    warnings: [{ type: String, trim: true }],
    recommendations: [{ type: String, trim: true }],

    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SeoIntelligenceSchema.index({ blogId: 1, createdAt: -1 });
SeoIntelligenceSchema.index({ decision: 1, cannibalizationRisk: 1 });

export const SeoIntelligence =
  mongoose.models.SeoIntelligence || mongoose.model("SeoIntelligence", SeoIntelligenceSchema);
