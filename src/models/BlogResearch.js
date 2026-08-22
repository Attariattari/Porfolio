import mongoose from "mongoose";

const BlogResearchSchema = new mongoose.Schema({
  topicPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogTopicPlan",
    index: true,
    sparse: true,
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    index: true,
    sparse: true,
  },
  researchFingerprint: {
    type: String,
    required: true,
    index: true,
  },
  topicTitle: { type: String, required: true, trim: true },
  focusKeyword: { type: String, trim: true, index: true },
  searchIntent: { type: String, trim: true },
  intentEvidence: {
    type: mongoose.Schema.Types.Mixed,
    default: { declaredIntent: "informational", observedIntent: "informational", confidence: 0.8, evidence: [] },
  },
  serpResults: [{
    title: String,
    url: String,
    domain: String,
    snippet: String,
    position: Number,
  }],
  competitorInsights: {
    type: mongoose.Schema.Types.Mixed,
    default: { recurringTopics: [], technicalDepth: "standard", weakAreas: [], opportunities: [] },
  },
  contentGaps: {
    type: mongoose.Schema.Types.Mixed,
    default: { missingTopics: [], weakAreas: [], opportunityAreas: [] },
  },
  questions: [{ type: String }],
  entities: [{ type: String }],
  sources: [{
    url: String,
    title: String,
    domain: String,
    sourceType: {
      type: String,
      enum: ["official_documentation", "official_announcement", "reputable_technical_source", "community_source", "general_source"],
      default: "general_source",
    },
    authorityLevel: { type: Number, min: 0, max: 1, default: 0.5 },
    publishedAt: Date,
    retrievedAt: { type: Date, default: Date.now },
    relevanceScore: { type: Number, min: 0, max: 1, default: 0.8 },
    freshnessScore: { type: Number, min: 0, max: 1, default: 0.8 },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
  }],
  claims: [{
    claim: String,
    sourceUrl: String,
    evidence: String,
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    freshness: String,
    sourceType: String,
  }],
  recommendations: [{ type: String }],
  researchConfidence: { type: Number, min: 0, max: 1, default: 0.7, index: true },
  provider: { type: String, default: "serp_llm_synthesizer" },
  status: {
    type: String,
    enum: ["completed", "partial", "cached", "failed", "unavailable"],
    default: "completed",
    index: true,
  },
  error: { type: String, trim: true },
  retrievedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: true },
}, { timestamps: true });

BlogResearchSchema.index({ researchFingerprint: 1, status: 1, expiresAt: 1 });

export const BlogResearch = mongoose.models.BlogResearch || mongoose.model("BlogResearch", BlogResearchSchema);
