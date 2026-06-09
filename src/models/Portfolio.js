import mongoose from "mongoose";

// 1. PROJECT SCHEMA
const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    techStack: [{ type: String }],
    category: { type: String },
    purpose: { type: String },
    impact: { type: String },
    details: { type: String },
    thumbnail: { type: String },
    gallery: [{ type: String }],
    featured: { type: Boolean, default: false, index: true },
    publishStatus: {
        type: String,
        enum: ["draft", "pending", "published"],
        default: "draft",
        index: true,
    },
    order: { type: Number, default: 0, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
});

// 2. SERVICE SCHEMA
const ServiceSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    problemSolved: { type: String },
    benefits: [{ type: String }],
    process: [{
        title: String,
        description: String,
    }, ],
    features: [{ type: String }],
    techStack: [{ type: String }],
    banner: { type: String },
    faq: [{
        question: String,
        answer: String,
    }, ],
    order: { type: Number, default: 0, index: true },
    featured: { type: Boolean, default: false, index: true },
    publishStatus: {
        type: String,
        enum: ["draft", "pending", "published"],
        default: "draft",
        index: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
});

// 3. BLOG SCHEMA
const BlogSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String },
    content: { type: String }, // HTML or Markdown
    date: { type: String },
    author: { type: String, default: "Pir Ghulam Muhyo Din" },
    authorRole: { type: String, default: "Founder" },
    category: { type: String },
    tags: [{ type: String }],
    image: { type: String },
    featured: { type: Boolean, default: false, index: true },
    featuredScore: { type: Number, default: 0 },
    featuredOrder: { type: Number, default: 0, index: true },
    publishStatus: {
        type: String,
        enum: ["draft", "pending", "published"],
        default: "draft",
        index: true,
    },
    readTime: { type: String },
    order: { type: Number, default: 0, index: true },
    aiGenerated: { type: Boolean, default: false },
    imageGenerated: { type: Boolean, default: false },
    imageStatus: {
        type: String,
        enum: ["pending", "generating", "completed", "failed"],
        default: "pending",
    },
    generatedAt: { type: Date },
    qualityStatus: {
        type: String,
        enum: ["passed", "failed"],
        default: "passed",
    },
    qualityScore: { type: Number, default: 0 },
    qualityMetrics: {
        readability: { type: Number, default: 0 },
        seo: { type: Number, default: 0 },
        humanTone: { type: Number, default: 0 },
    },
    // === NEW: Enhanced Image Generation Audit Data ===
    imagePromptEnhanced: { type: String }, // Final architectural prompt used for image generation
    imageNarrativeAnalysis: {
        keyLesson: String,
        emotionalTone: String,
        visualMetaphor: String,
        settingType: String,
        humanElements: String,
        lightingMood: String,
    },
    imageAuditScore: { type: Number, default: 0 }, // Overall quality score from auditor (0-10)
    imageAuditVisualScore: { type: Number, default: 0 }, // Visual quality (0-10)
    imageAuditRelevanceScore: { type: Number, default: 0 }, // Relevance to article (0-10)
    imageAuditCtrPotential: { type: Boolean, default: false }, // Would this increase CTR?
    imageAuditAttempts: { type: Number, default: 0 }, // Number of generation attempts
    imageRetryCount: { type: Number, default: 0 }, // Total retry attempts
    imageError: { type: String }, // Last error message if generation failed
    createdAt: { type: Date, default: Date.now, index: true },
});

// 4. SKILL SCHEMA
const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, min: 0, max: 100 },
    category: { type: String }, // Frontend, Backend, etc.
});

// 5. ABOUT SCHEMA
const AboutSchema = new mongoose.Schema({
    // ==== CORE DYNAMIC PROFILE DATA ====
    name: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: true },

    // ==== CONTENT ====
    bio: { type: String }, // Short 1-2 line bio
    longDescription: { type: String }, // Detailed story/background
    mission: { type: String }, // Professional mission statement
    typewriterWords: [{ type: String }], // Words for typewriter animation

    // ==== CONTACT INFORMATION ====
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    workingHours: { type: String }, // e.g., "9 AM - 6 PM PST"

    // ==== WORK EXPERIENCE ====
    experiences: [{
        year: String,
        role: String,
        company: String,
        duration: String,
        description: String,
        milestones: [String],
    }, ],

    // ==== METADATA ====
    updatedAt: { type: Date, default: Date.now },
});

// 6. RESUME SCHEMA
const ResumeSchema = new mongoose.Schema({
    name: String,
    role: String,
    tagline: String,
    aboutSummary: String,
    contact: [{
        icon: String,
        text: String,
    }, ],
    stats: [{
        label: String,
        value: String,
        icon: String,
    }, ],
    experience: [{
        role: String,
        company: String,
        duration: String,
        metrics: String,
        achievements: [String],
    }, ],
    education: [{
        degree: String,
        institution: String,
        duration: String,
    }, ],
    skillCategories: [{
        category: String,
        items: [String],
    }, ],
    notableProjects: [{
        name: String,
        tech: [String],
        outcome: String,
    }, ],
});

// 7. SOCIAL LINKS SCHEMA - Professional Social Links System
const SocialLinksSchema = new mongoose.Schema({
    links: [{
        platform: {
            type: String,
            required: true,
            enum: ["linkedin", "github", "twitter", "facebook", "whatsapp"],
        },
        url: { type: String, required: true },
    }, ],
    updatedAt: { type: Date, default: Date.now },
});

// 8. MESSAGE SCHEMA (For Contact Form - Legacy)
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ["unread", "read", "archived"],
        default: "unread",
    },
    createdAt: { type: Date, default: Date.now },
});

// 9. CONTACT MESSAGE SCHEMA - Production Contact Form
const ContactMessageSchema = new mongoose.Schema({
    // Core fields
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 255,
    },
    subject: { type: String, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },

    // Service categorization
    service: {
        type: String,
        default: "general",
    },

    // Message status tracking
    status: {
        type: String,
        enum: ["new", "seen", "replied"],
        default: "new",
    },

    // Admin reply system
    adminReply: {
        text: { type: String, maxlength: 5000 },
        repliedAt: { type: Date },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Read tracking
    isRead: { type: Boolean, default: false },

    // Security & logging
    ipAddress: { type: String },
    userAgent: { type: String },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// 10. HERO SCHEMA
const HeroSchema = new mongoose.Schema({
    typewriterWords: [{ type: String }],
    description: { type: String },
    visualImage: { type: String },
    features: [{
        icon: String,
        label: String,
        description: String,
    }, ],
    updatedAt: { type: Date, default: Date.now },
});

// 11. SITE CONFIG SCHEMA - Real-Time Settings System
const SiteConfigSchema = new mongoose.Schema({
    // Brand Identity
    siteTitle: {
        type: String,
        required: true,
        default: "Muhyo Tech",
        trim: true,
    },
    siteAccent: {
        type: String,
        required: true,
        default: "Tech",
        trim: true,
    },

    // Admin Information
    adminName: {
        type: String,
        required: true,
        default: "Pir Ghulam Muhyo Din",
        trim: true,
    },
    email: {
        type: String,
        required: true,
        default: "attariattari549@gmail.com",
        lowercase: true,
        trim: true,
    },
    location: {
        type: String,
        default: "Lahore, Pakistan",
        trim: true,
    },

    // Super Admin Email Transfer System
    superAdminEmail: {
        type: String,
        required: true,
        default: "attariattari549@gmail.com",
        lowercase: true,
        trim: true,
        index: true,
    },
    superAdminTransferHistory: [{
        oldEmail: { type: String, lowercase: true, trim: true },
        newEmail: { type: String, lowercase: true, trim: true },
        transferredAt: { type: Date, default: Date.now },
        transferredBy: { type: String }, // Email of the admin who initiated
        ipAddress: { type: String },
        verified: { type: Boolean, default: false },
    }, ],

    // SEO
    seo: {
        title: {
            type: String,
            default: "Muhyo Tech - Full Stack Developer",
            trim: true,
        },
        description: {
            type: String,
            default: "Full Stack Web Developer specializing in modern web applications",
            trim: true,
        },
    },

    // Timestamps
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String }, // Admin email who updated it
});

// 12. OTP SCHEMA - Super Admin Transfer OTP System
const SuperAdminOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    code: { type: String, required: true }, // Hashed OTP
    plainCode: { type: String }, // For logging only (remove after 1 min)
    type: {
        type: String,
        enum: ["transfer_current", "transfer_new"],
        required: true,
    },
    transferSessionId: {
        type: String,
        required: true,
        index: true,
    },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now },
});

// TTL Index to auto-delete expired OTPs
SuperAdminOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 13. TRANSFER SESSION SCHEMA - Track the entire transfer workflow
const SuperAdminTransferSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true, index: true },
    currentEmail: { type: String, required: true, lowercase: true, trim: true },
    newEmail: { type: String, required: true, lowercase: true, trim: true },
    initiatedBy: { type: String, required: true, lowercase: true, trim: true },
    status: {
        type: String,
        enum: [
            "pending",
            "current_verified",
            "new_verified",
            "confirmed",
            "completed",
            "failed",
            "cancelled",
        ],
        default: "pending",
        index: true,
    },
    currentEmailVerified: { type: Boolean, default: false },
    currentEmailVerifiedAt: { type: Date },
    newEmailVerified: { type: Boolean, default: false },
    newEmailVerifiedAt: { type: Date },
    finalConfirmedAt: { type: Date },
    completedAt: { type: Date },
    failureReason: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    expiresAt: { type: Date, index: true },
    createdAt: { type: Date, default: Date.now },
});

// Create indexes for performance
ContactMessageSchema.index({ email: 1 });
ContactMessageSchema.index({ service: 1 });
ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: -1 }); // For sorting latest first

// Exporting all models
export const Project =
    mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export const Service =
    mongoose.models.Service || mongoose.model("Service", ServiceSchema);
export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
export const Skill =
    mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
export const About =
    mongoose.models.About || mongoose.model("About", AboutSchema);
export const SocialLinks =
    mongoose.models.SocialLinks ||
    mongoose.model("SocialLinks", SocialLinksSchema);
export const Resume =
    mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);
export const Message =
    mongoose.models.Message || mongoose.model("Message", MessageSchema);
// Force refresh model if in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.ContactMessage;
    delete mongoose.models.Hero;
    delete mongoose.models.About;
    delete mongoose.models.Service;
    delete mongoose.models.SocialLinks;
    delete mongoose.models.SiteConfig;
    delete mongoose.models.SuperAdminOTP;
    delete mongoose.models.SuperAdminTransferSession;
}
export const ContactMessage =
    mongoose.models.ContactMessage ||
    mongoose.model("ContactMessage", ContactMessageSchema);
export const Hero = mongoose.models.Hero || mongoose.model("Hero", HeroSchema);
export const SiteConfig =
    mongoose.models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema);
export const SuperAdminOTP =
    mongoose.models.SuperAdminOTP ||
    mongoose.model("SuperAdminOTP", SuperAdminOTPSchema);
export const SuperAdminTransferSession =
    mongoose.models.SuperAdminTransferSession ||
    mongoose.model("SuperAdminTransferSession", SuperAdminTransferSessionSchema);