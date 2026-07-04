import mongoose from "mongoose";

const TextObjectSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    icon: String,
  },
  { _id: false, strict: false },
);

const ProcessStepSchema = new mongoose.Schema(
  {
    step: Number,
    title: String,
    description: String,
  },
  { _id: false, strict: false },
);

const TechnologySchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    icon: String,
  },
  { _id: false, strict: false },
);

const FaqSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
  },
  { _id: false },
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    shortDescription: { type: String, trim: true },
    fullDescription: { type: String },
    category: { type: String, trim: true },
    icon: { type: String, trim: true },
    heroImage: { type: String },
    overview: { type: String },
    problemsSolved: [TextObjectSchema],
    deliverables: [TextObjectSchema],
    features: [TextObjectSchema],
    benefits: [TextObjectSchema],
    processSteps: [ProcessStepSchema],
    technologies: [{ type: mongoose.Schema.Types.Mixed }],
    clientRequirements: [{ type: mongoose.Schema.Types.Mixed }],
    relatedProjects: [{ type: mongoose.Schema.Types.Mixed }],
    faqs: [FaqSchema],
    deliveryNote: { type: String },
    quoteNote: {
      type: String,
      default:
        "Pricing depends on project requirements, features, timeline, and scope. Book a call to discuss your project and receive a custom quote.",
    },
    ctaTitle: { type: String },
    ctaDescription: { type: String },
    ctaPrimaryText: { type: String },
    ctaSecondaryText: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    keywords: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "pending", "published"],
      default: "published",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },

    // Legacy compatibility fields used by existing admin/public screens.
    description: { type: String },
    problemSolved: { type: String },
    techStack: [{ type: String }],
    process: [TextObjectSchema],
    banner: { type: String },
    image: { type: String },
    images: [{ type: String }],
    faq: [FaqSchema],
    publishStatus: {
      type: String,
      enum: ["draft", "pending", "published"],
      default: "published",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, strict: false },
);

ServiceSchema.pre("validate", function syncLegacyFields() {
  if (!this.status && this.publishStatus) this.status = this.publishStatus;
  if (!this.publishStatus && this.status) this.publishStatus = this.status;
  if (this.isFeatured === undefined && this.featured !== undefined) {
    this.isFeatured = this.featured;
  }
  if (this.featured === undefined && this.isFeatured !== undefined) {
    this.featured = this.isFeatured;
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description;
  }
  if (!this.description && this.shortDescription) {
    this.description = this.shortDescription;
  }
  if (!this.heroImage && this.banner) this.heroImage = this.banner;
  if (!this.banner && this.heroImage) this.banner = this.heroImage;
  if (!this.image && this.heroImage) this.image = this.heroImage;
  if ((!this.techStack || this.techStack.length === 0) && this.technologies?.length) {
    this.techStack = this.technologies
      .map((item) => (typeof item === "string" ? item : item?.name))
      .filter(Boolean);
  }
  if ((!this.technologies || this.technologies.length === 0) && this.techStack?.length) {
    this.technologies = this.techStack;
  }
});

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
