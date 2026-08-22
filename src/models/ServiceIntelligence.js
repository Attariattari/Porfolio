import mongoose from "mongoose";

const ServiceIntelligenceSchema = new mongoose.Schema(
  {
    serviceSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },
    topicCoverageScore: { type: Number, min: 0, max: 100, default: 70 },
    contentDepthScore: { type: Number, min: 0, max: 100, default: 70 },
    internalLinksScore: { type: Number, min: 0, max: 100, default: 70 },
    commercialCoverageScore: { type: Number, min: 0, max: 100, default: 70 },
    serpCoverageScore: { type: Number, min: 0, max: 100, default: 70 },
    conversionReadinessScore: { type: Number, min: 0, max: 100, default: 70 },
    overallAuthorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
      index: true,
    },
    coveredTopicCount: { type: Number, default: 0 },
    missingTopicCount: { type: Number, default: 0 },
    suggestedTopics: [
      {
        title: String,
        intent: String,
        priority: Number,
        reason: String,
      },
    ],
    highImpressionLowConversionBridges: [
      {
        blogSlug: String,
        impressions: Number,
        ctr: Number,
        conversionRate: Number,
        suggestion: String,
      },
    ],
    lastEvaluatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

export const ServiceIntelligence =
  mongoose.models.ServiceIntelligence ||
  mongoose.model("ServiceIntelligence", ServiceIntelligenceSchema);

export default ServiceIntelligence;
