import mongoose from "mongoose";

const BloggerPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, required: true }, // 900-1200 words HTML content
    summary: { type: String },
    tags: [{ type: String }],

    // Parent Blog Relationship (Muhyo Tech Master Blog)
    parentBlogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      unique: true,
      index: true,
    },
    parentBlogTitle: { type: String, required: true },
    parentBlogSlug: { type: String, required: true },
    parentBlogUrl: { type: String, required: true },

    // Quality Control (Reusing existing QC System)
    qualityStatus: {
      type: String,
      enum: ["passed", "rejected", "pending"],
      default: "pending",
    },
    qualityScore: { type: Number, default: 0 },
    qualityMetrics: { type: Object },
    qualityFeedback: { type: String },

    // Publishing Status & Blogger API Details
    publishStatus: {
      type: String,
      enum: ["draft", "pending_review", "generating", "publishing", "published", "failed"],
      default: "pending_review",
      index: true,
    },
    bloggerPostId: { type: String },
    bloggerUrl: { type: String },
    publishedAt: { type: Date },
    publishingStartedAt: { type: Date },
    errorLog: { type: String },

    aiGenerated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BloggerPost =
  mongoose.models.BloggerPost || mongoose.model("BloggerPost", BloggerPostSchema);
