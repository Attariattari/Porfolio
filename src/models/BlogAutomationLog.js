import mongoose from "mongoose";

const BlogAutomationLogSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", index: true },
    contentStatus: { type: String },
    imageStatus: { type: String },
    imagePromptEmailSent: { type: Boolean, default: false },
    uploadLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogImageUploadLink",
    },
    imageError: { type: String },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    status: {
      type: String,
      enum: ["success", "partial_success", "failed"],
      default: "success",
      index: true,
    },
    message: { type: String },
  },
  { timestamps: true },
);

export const BlogAutomationLog =
  mongoose.models.BlogAutomationLog ||
  mongoose.model("BlogAutomationLog", BlogAutomationLogSchema);

