import mongoose from "mongoose";

const SeoMetricsSchema = new mongoose.Schema(
  {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    averagePosition: { type: Number, default: 0 },
  },
  { _id: false }
);

const ContentMetricsSchema = new mongoose.Schema(
  {
    supportingBlogCount: { type: Number, default: 0 },
    indexedContentCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const TopicMetricsSchema = new mongoose.Schema(
  {
    coverageScore: { type: Number, default: 0 },
    commercialCoverageScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const ConversionMetricsSchema = new mongoose.Schema(
  {
    ctaViews: { type: Number, default: 0 },
    ctaClicks: { type: Number, default: 0 },
    bookingStarts: { type: Number, default: 0 },
    qualifiedLeads: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const DimensionScoresSchema = new mongoose.Schema(
  {
    seoScore: { type: Number, default: 70 },
    contentAuthorityScore: { type: Number, default: 70 },
    commercialCoverageScore: { type: Number, default: 70 },
    internalLinkingScore: { type: Number, default: 70 },
    conversionScore: { type: Number, default: 70 },
    overallServiceHealthScore: { type: Number, default: 70 },
  },
  { _id: false }
);

const ServicePerformanceSnapshotSchema = new mongoose.Schema(
  {
    serviceSlug: {
      type: String,
      required: true,
      index: true,
    },
    period: {
      type: String,
      default: "30d",
      index: true,
    },
    seoMetrics: { type: SeoMetricsSchema, default: {} },
    contentMetrics: { type: ContentMetricsSchema, default: {} },
    topicMetrics: { type: TopicMetricsSchema, default: {} },
    conversionMetrics: { type: ConversionMetricsSchema, default: {} },
    scores: { type: DimensionScoresSchema, default: {} },
    healthClassification: {
      type: String,
      enum: ["EXCELLENT", "HEALTHY", "NEEDS_ATTENTION", "WEAK", "CRITICAL", "INSUFFICIENT_DATA"],
      default: "HEALTHY",
      index: true,
    },
    recommendationsGeneratedCount: { type: Number, default: 0 },
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

ServicePerformanceSnapshotSchema.index({ serviceSlug: 1, capturedAt: -1 });

export const ServicePerformanceSnapshot =
  mongoose.models.ServicePerformanceSnapshot ||
  mongoose.model("ServicePerformanceSnapshot", ServicePerformanceSnapshotSchema);
