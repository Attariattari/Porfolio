import mongoose from "mongoose";

const ServiceOpportunitySchema = new mongoose.Schema(
  {
    topicTitle: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    detectedNeed: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedService: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedServiceSlug: {
      type: String,
      trim: true,
      index: true,
    },
    targetAudience: {
      type: String,
      default: "business_owner",
    },
    targetIndustry: {
      type: String,
      default: "general_technology",
    },
    opportunityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    // Phase 4 Intelligence Extensions
    normalizedConcept: {
      type: String,
      trim: true,
      index: true,
    },
    sourceTopicSlugs: [{ type: String }],
    clusterTopicCount: {
      type: Number,
      default: 1,
    },
    coverageLevel: {
      type: String,
      enum: ["NONE", "WEAK", "PARTIAL", "STRONG", "DIRECT"],
      default: "NONE",
    },
    coverageScore: {
      type: Number,
      default: 0,
    },
    overlapLevel: {
      type: String,
      enum: ["NO_OVERLAP", "LOW_OVERLAP", "MODERATE_OVERLAP", "HIGH_OVERLAP", "DUPLICATE"],
      default: "NO_OVERLAP",
    },
    overlapScore: {
      type: Number,
      default: 0,
    },
    opportunityLevel: {
      type: String,
      enum: ["IGNORE", "WATCH", "PROMISING", "HIGH_PRIORITY"],
      default: "PROMISING",
    },
    evidence: [{ type: String }],
    recommendedAction: {
      type: String,
      enum: [
        "CREATE_NEW_SERVICE",
        "EXPAND_EXISTING_SERVICE",
        "IMPROVE_SERVICE_POSITIONING",
        "CREATE_SUPPORTING_CONTENT",
        "LINK_TO_EXISTING_SERVICE",
        "IGNORE",
      ],
      default: "CREATE_NEW_SERVICE",
    },
    matchedServiceSlugs: [{ type: String }],
    status: {
      type: String,
      enum: ["candidate", "approved", "existing_service", "rejected", "implemented"],
      default: "candidate",
      index: true,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

ServiceOpportunitySchema.index({ normalizedConcept: 1 });

ServiceOpportunitySchema.index({ status: 1, opportunityScore: -1 });

export const ServiceOpportunity =
  mongoose.models.ServiceOpportunity ||
  mongoose.model("ServiceOpportunity", ServiceOpportunitySchema);
