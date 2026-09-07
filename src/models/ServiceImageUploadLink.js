import mongoose from "mongoose";

const ServiceImageUploadLinkSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    serviceTitle: { type: String, required: true },
    serviceSlug: { type: String, index: true },
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

export const ServiceImageUploadLink =
  mongoose.models.ServiceImageUploadLink ||
  mongoose.model("ServiceImageUploadLink", ServiceImageUploadLinkSchema);

export default ServiceImageUploadLink;
