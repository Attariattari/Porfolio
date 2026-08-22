import mongoose from "mongoose";

const ArticleBlueprintSchema = new mongoose.Schema(
  {
    version: { type: String, default: "1.0.0" },
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
    articleType: {
      type: String,
      enum: ["pillar", "supporting", "standalone_authority", "verified_trend"],
      default: "supporting",
      index: true,
    },
    contentCategory: { type: String, trim: true, default: "core_web_engineering", index: true },
    clusterKey: { type: String, trim: true, index: true },
    clusterTitle: { type: String, trim: true },
    titleDirection: { type: String, trim: true, required: true },
    primaryIntent: {
      type: String,
      enum: ["informational", "commercial", "transactional", "navigational"],
      default: "informational",
    },
    secondaryIntents: [{ type: String, trim: true }],

    audience: {
      primary: { type: String, trim: true, default: "Founders and senior developers" },
      secondary: { type: String, trim: true },
      expertiseLevel: { type: String, trim: true, default: "intermediate_to_advanced" },
      businessContext: { type: String, trim: true },
    },

    readerProblem: { type: String, trim: true },
    desiredOutcome: { type: String, trim: true },
    uniqueAngle: { type: String, trim: true },

    searchCoverage: {
      primaryQuery: { type: String, trim: true },
      secondaryQueries: [{ type: String, trim: true }],
      relatedQuestions: [{ type: String, trim: true }],
      entities: [{ type: String, trim: true }],
      subtopics: [{ type: String, trim: true }],
      terminology: [{ type: String, trim: true }],
    },

    structure: [
      {
        order: { type: Number, default: 0 },
        heading: { type: String, required: true, trim: true },
        headingLevel: { type: String, enum: ["h2", "h3"], default: "h2" },
        purpose: { type: String, trim: true },
        keyQuestions: [{ type: String, trim: true }],
        requiredConcepts: [{ type: String, trim: true }],
        evidenceNeeded: { type: Boolean, default: false },
        exampleNeeded: { type: Boolean, default: false },
        codeNeeded: { type: Boolean, default: false },
        comparisonNeeded: { type: Boolean, default: false },
        estimatedDepth: { type: String, default: "standard" },
      },
    ],

    requiredElements: {
      introduction: { type: String, trim: true },
      practicalExample: { type: String, trim: true },
      codeExample: { type: String, trim: true },
      comparison: { type: String, trim: true },
      table: { type: String, trim: true },
      checklist: { type: String, trim: true },
      faq: { type: String, trim: true },
      conclusion: { type: String, trim: true },
    },

    researchMap: [
      {
        claimOrSection: { type: String, trim: true },
        source: { type: String, trim: true },
        sourceType: { type: String, trim: true },
        evidenceSummary: { type: String, trim: true },
        confidence: { type: Number, min: 0, max: 1, default: 0.8 },
      },
    ],

    internalLinkPlan: [
      {
        targetType: { type: String, trim: true },
        targetId: { type: String, trim: true },
        targetSlug: { type: String, trim: true },
        reason: { type: String, trim: true },
        anchorDirection: { type: String, trim: true },
      },
    ],

    serviceAlignment: {
      serviceSlug: { type: String, trim: true },
      reason: { type: String, trim: true },
      relevance: { type: Number, min: 0, max: 1, default: 0 },
      ctaDirection: { type: String, trim: true },
    },

    conversionStrategy: {
      intent: { type: String, trim: true },
      ctaType: { type: String, trim: true },
      ctaPlacement: { type: String, trim: true },
      valueProposition: { type: String, trim: true },
    },

    differentiation: {
      existingOverlap: [{ type: String, trim: true }],
      avoidTopics: [{ type: String, trim: true }],
      uniqueCoverage: [{ type: String, trim: true }],
      competitiveGap: { type: String, trim: true },
      cannibalizationRisk: { type: String, enum: ["low", "medium", "high"], default: "low" },
    },

    editorialRules: {
      tone: { type: String, trim: true, default: "Senior engineering and pragmatic leadership" },
      depth: { type: String, trim: true, default: "deep" },
      firstHandPerspective: { type: Boolean, default: true },
      technicalDepth: { type: String, trim: true },
      businessDepth: { type: String, trim: true },
      limitationsRequired: { type: Boolean, default: true },
      tradeoffsRequired: { type: Boolean, default: true },
    },

    generationMeta: {
      timestamp: { type: Date, default: Date.now },
      model: { type: String, default: "gemini-flash" },
      durationMs: { type: Number, default: 0 },
      researchStatus: { type: String, default: "not_available" },
      intentMismatch: { type: Boolean, default: false },
      warnings: [{ type: String }],
    },
  },
  { timestamps: true }
);

ArticleBlueprintSchema.index({ topicPlanId: 1, createdAt: -1 });
ArticleBlueprintSchema.index({ clusterKey: 1, articleType: 1 });

export const ArticleBlueprint =
  mongoose.models.ArticleBlueprint || mongoose.model("ArticleBlueprint", ArticleBlueprintSchema);
