import mongoose from "mongoose";

const SystemEmailSchema = new mongoose.Schema(
  {
    to: { type: String, required: true, lowercase: true, trim: true, index: true },
    from: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    html: { type: String },
    text: { type: String },
    type: {
      type: String,
      enum: [
        "account_setup",
        "password_reset",
        "account_restore",
        "admin_reply",
        "general_notification",
        "system_alert",
      ],
      default: "general_notification",
      index: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
      index: true,
    },
    error: { type: String },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const SystemEmail =
  mongoose.models.SystemEmail || mongoose.model("SystemEmail", SystemEmailSchema);
export default SystemEmail;
