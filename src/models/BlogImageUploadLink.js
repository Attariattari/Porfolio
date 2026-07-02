import mongoose from "mongoose";

const BlogImageUploadLinkSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    blogTitle: { type: String, required: true },
    targetEmail: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["active", "used", "expired", "revoked"],
      default: "active",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
    usedBy: { type: String },
    revokedAt: { type: Date },
    revokedBy: { type: String },
    createdBy: { type: String },
    emailSentAt: { type: Date },
  },
  { timestamps: true },
);

export const BlogImageUploadLink =
  mongoose.models.BlogImageUploadLink ||
  mongoose.model("BlogImageUploadLink", BlogImageUploadLinkSchema);

