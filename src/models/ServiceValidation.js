import mongoose from "mongoose";

const RiskSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, enum: ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
    field: { type: String },
    message: { type: String, required: true },
    recommendation: { type: String },
    relatedService: { type: String },
  },
  { _id: false }
);

const DimensionsSchema = new mongoose.Schema(
  {
    structural: { type: Number, default: 100 },
    completeness: { type: Number, default: 100 },
    semanticConsistency: { type: Number, default: 100 },
    duplicateSafety: { type: Number, default: 100 },
    cannibalizationSafety: { type: Number, default: 100 },
    topicAlignment: { type: Number, default: 100 },
    commercialValue: { type: Number, default: 100 },
    seoQuality: { type: Number, default: 100 },
    contentQuality: { type: Number, default: 100 },
    technicalCompatibility: { type: Number, default: 100 },
  },
  { _id: false }
);

const ServiceValidationSchema = new mongoose.Schema(
  {
    serviceSlug: {
      type: String,
      required: true,
      index: true,
    },
    opportunityId: {
      type: String,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    decision: {
      type: String,
      enum: ["APPROVE", "REVIEW", "REJECT"],
      required: true,
      index: true,
    },
    dimensions: {
      type: DimensionsSchema,
      default: {},
    },
    risks: [RiskSchema],
    recommendations: [{ type: String }],
    duplicateCandidates: [{ type: mongoose.Schema.Types.Mixed }],
    overlappingServices: [{ type: mongoose.Schema.Types.Mixed }],
    topicEvidence: [{ type: String }],
    seoIssues: [{ type: String }],
    contentIssues: [{ type: String }],
    validatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    validatorVersion: {
      type: String,
      default: "v6_quality_gate",
    },
  },
  { timestamps: true }
);

ServiceValidationSchema.index({ serviceSlug: 1, createdAt: -1 });

export const ServiceValidation =
  mongoose.models.ServiceValidation ||
  mongoose.model("ServiceValidation", ServiceValidationSchema);
