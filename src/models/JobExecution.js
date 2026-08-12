import mongoose from "mongoose";

const JobExecutionSchema = new mongoose.Schema(
  {
    slot: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      default: "primary",
      index: true,
    },
    workerId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["claimed", "processing", "completed", "failed", "expired"],
      default: "claimed",
      index: true,
    },
    leaseAcquiredAt: {
      type: Date,
      default: Date.now,
    },
    leaseExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastHeartbeatAt: {
      type: Date,
      default: Date.now,
    },
    currentStage: {
      type: String,
      enum: [
        "SLOT_CLAIMED",
        "TOPIC_CLAIMED",
        "DRAFT_GENERATED",
        "QUALITY_APPROVED",
        "BLOG_SAVED",
        "IMAGE_COMPLETED",
        "MANUAL_IMAGE_REQUIRED",
      ],
      default: "SLOT_CLAIMED",
      index: true,
    },
    checkpointData: {
      topicPlanId: { type: String, default: null },
      selectedTopic: { type: String, default: null },
      automationContext: { type: mongoose.Schema.Types.Mixed, default: null },
      blogDraft: { type: mongoose.Schema.Types.Mixed, default: null },
      qualityMetrics: { type: mongoose.Schema.Types.Mixed, default: null },
      blogId: { type: String, default: null },
      imagePrompt: { type: String, default: null },
      emailSent: { type: Boolean, default: false },
      uploadLinkId: { type: String, default: null },
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast lock lookup & cleanup
JobExecutionSchema.index({ slot: 1, status: 1 });
JobExecutionSchema.index({ status: 1, leaseExpiresAt: 1 });

export const JobExecution =
  mongoose.models.JobExecution ||
  mongoose.model("JobExecution", JobExecutionSchema);
