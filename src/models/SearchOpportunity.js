import mongoose from "mongoose";

const SearchOpportunitySchema = new mongoose.Schema(
  {
    queryCluster: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    normalizedQuery: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    relatedQueries: [
      {
        query: String,
        impressions: Number,
        clicks: Number,
        position: Number,
        ctr: Number,
      },
    ],
    searchIntent: {
      type: String,
      enum: [
        "informational",
        "problem_solution",
        "comparison",
        "commercial_investigation",
        "transactional",
        "trend",
        "navigational",
      ],
      default: "informational",
      index: true,
    },
    existingCoverage: {
      type: Boolean,
      default: false,
      index: true,
    },
    linkedContent: [
      {
        contentType: { type: String, enum: ["blog", "topic_plan"] },
        id: { type: mongoose.Schema.Types.ObjectId },
        title: String,
        slug: String,
      },
    ],
    impressions: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
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
    },
    averagePosition: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    opportunityType: {
      type: String,
      enum: ["optimization", "supporting_cluster", "content_gap", "near_page_one", "stable", "deprioritize"],
      default: "stable",
      index: true,
    },
    recommendedAction: {
      type: String,
      enum: [
        "optimize_existing",
        "expand_existing_cluster",
        "potential_new_supporting",
        "potential_new_pillar",
        "potential_standalone",
        "no_action",
        "monitor",
      ],
      default: "no_action",
      index: true,
    },
    opportunityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      index: true,
    },
    cannibalizationRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      default: "gsc_api",
      index: true,
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

SearchOpportunitySchema.index({ opportunityType: 1, opportunityScore: -1 });
SearchOpportunitySchema.index({ existingCoverage: 1, recommendedAction: 1 });

export const SearchOpportunity =
  mongoose.models.SearchOpportunity ||
  mongoose.model("SearchOpportunity", SearchOpportunitySchema);
