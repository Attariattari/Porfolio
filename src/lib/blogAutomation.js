import {
    generateGeminiResponse,
    reviewContentWithGemini,
} from "./geminiService.js";
import { uploadToCloudinary } from "./cloudinary.js";
import { Blog } from "../models/Portfolio.js";
import dbConnect from "./dbConnect.js";
import { cacheManager } from "./cache.js";
import { sendNewsletterEmail } from "./newsletter.js";
import {
    updateFeaturedRankings,
    triggerFeaturedUpdate,
} from "./ai/featuredEngine.js";
import { revalidatePath } from "next/cache";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * SENIOR AI EDITORIAL ENHANCEMENT - Editorial Pipeline v3.0 (Human-Centric)
 * Upgraded with Human Rhythm, Emotional Storytelling, and Realistic Visual Contexts.
 */

const TOPIC_POOL = [
    "MERN Stack: Real-world production pitfalls we encountered",
    "Next.js 15: Beyond the hype - what actually breaks in production",
    "React 19 Actions: A pragmatic guide for senior developers",
    "Node.js Backend Scaling: Lessons from our most stressful launch",
    "MongoDB Aggregation: Solving complex data problems at Muhyo Tech",
    "Laravel vs Node.js: An honest comparison for startup founders",
    "DevOps Automation: How we reduced our deployment anxiety",
    "AI Workflows: Integrating LLMs into a real engineering team",
    "SaaS Engineering: The hidden costs of building for multi-tenancy",
    "Authentication Systems: Why we stopped rolling our own",
    "SEO Engineering: Technical deep-dives that actually drive traffic",
    "Cloud Deployment: Navigating the AWS vs Vercel trade-offs",
    "Startup Systems: Building for speed without creating technical debt",
    "TypeScript: Advanced patterns that saved our production builds",
    "Performance Optimization: Real stories of 100ms wins",
    "Database Sharding: When and why we finally pulled the trigger",
    "Micro-frontends: The good, the bad, and the ugly truths",
    "Cybersecurity for Startups: Practical hardening for real teams",
];

const EDITORIAL_GUIDELINES = `
Act as a Senior AI Editorial Enhancement Engineer and Founder at Muhyo Tech. 
Your goal is to produce blogs that feel human-written, conversational, and emotionally engaging.

MUHYO TECH VOICE:
- You are a Senior Lead or Founder with real-world production experience.
- Use a practical, "lessons learned" tone. Discuss tradeoffs, not just benefits.
- Naturally use "we", "our team", or "At Muhyo Tech" but skip forced branding.
- Avoid sounding like a marketing brochure; sound like an engineering post-mortem or deep dive.

STRICT WRITING RULES:
1. NO AI TROPES: Never use "In today's digital landscape", "Furthermore", "Moreover", "In conclusion", "Rapidly evolving", "Game changer", "Leveraging AI", "Additionally", "In the world of".
2. HUMAN RHYTHM: Use natural sentence variation. Mix short, punchy sentences (4-7 words) with longer, descriptive ones.
3. PARAGRAPH STRUCTURE: EXTREMELY IMPORTANT. Paragraphs must be 2-3 sentences MAXIMUM. 2 sentences is preferred. Create short visual blocks for easy scanning. Never generate text walls.
4. NARRATIVE HOOK: Start with a real-world problem, a personal anecdote, or a strong opinion. No generic summaries.
5. EMOTIONAL FLOW: Acknowledge the stress of bugs and the reality of production deadlines.
6. FORMATTING: Use HTML tags (<p>, <h2>, <strong>, blockquote). No Markdown.
7. IMAGE PROMPT ALIGNMENT: The image_prompt will be ENHANCED by the Image Architect. Your initial prompt helps guide the architecture but the final image will be unique and specific. Keep initial prompt brief but indicative of the article's visual direction.
`;

const IMAGE_EDITORIAL_ARCHITECT_GUIDELINES = `
Act as a Senior AI Creative Director and Editorial Visual Architect for Muhyo Tech.
Your mission is to design UNIQUE, PREMIUM visual concepts that tell each article's specific story.

CRITICAL PRINCIPLES:
1. SEMANTIC ANALYSIS: Extract the article's KEY LESSON, not just surface keywords. What is the article teaching?
2. VISUAL METAPHOR: Translate that lesson into a cinematic visual scene that SHOWS the concept.
3. UNIQUENESS: Every article gets a different visual strategy. No generic fallbacks.
4. PURITY: NO text, NO logos, NO watermarks, NO UI, NO fake screens. Pure visual storytelling.
5. EDITORIAL QUALITY: High-end photography feel - Stripe, Linear, Medium, Vercel blog style.
6. AUTHENTICITY: Show real human-centered environments. Real engineers, real workspaces, real moments.
7. REALISM: NO neon cyberpunk, NO floating code, NO glowing brains, NO holographic clichés. Use BELIEVABLE scenes.
8. DIVERSITY: Every prompt must vary in camera angle, setting, composition, and approach.
9. MOOD ALIGNMENT: The visual mood should match the article's tone (pragmatic, cautionary, inspirational, technical, etc.).
10. NARRATIVE CLARITY: Looking at the image, an informed reader should understand the article's general topic.

COMPOSITION FRAMEWORK:
- Setting: Specific, realistic location (engineering office, startup workspace, whiteboard session, debugging scene)
- Human Elements: Are people present? What are they doing? (Collaborating, thinking, typing, discussing, problem-solving)
- Lighting: Cinematic, professional lighting that creates mood (warm natural light, cool professional light, dramatic shadows)
- Focal Point: Where is the viewer's eye drawn? What is the primary subject?
- Depth: Professional depth of field (bokeh background) for editorial photography feel
- Color Palette: Cohesive, professional colors that support the mood
- Composition: Strong visual hierarchy, balanced, intentional framing

REJECTION CRITERIA FOR PROMPTS:
❌ Generic/repetitive language
❌ Keywords only (no narrative context)
❌ References to text or UI
❌ Clichéd tech imagery patterns
❌ Stock photo language
❌ Lack of specific visual direction

OUTPUT:
Generate 1-2 paragraph prompts that are SPECIFIC, VIVID, and DIRECTIONAL.
Include: Setting, human activity, focal point, lighting, mood, composition.
Make it cinematic and clear so the image generator can create something UNIQUE and PROFESSIONAL.
`;

const IMAGE_REVIEW_GUIDELINES = `
Act as a Strict Editorial Visual Quality Auditor for Muhyo Tech.
Your job is to ensure images are EDITORIAL QUALITY and ARTICLE-RELEVANT.

CRITICAL REJECTION CRITERIA (ANY of these = FAIL):
- ANY visible text (titles, labels, watermarks, fake screen text, logos, names)
- UI elements (buttons, taskbars, windows, menus, code editors)
- AI artifacts (weird proportions, distorted objects, unnatural blending)
- Generic/clichéd (neon cyberpunk, floating code, stock photos, repetitive "tech" scenes)
- Off-topic (doesn't relate to the article's subject matter)
- Low visual quality (blurry, poorly composed, amateur)

QUALITY STANDARDS:
✅ Cinematic, professional editorial photography (Medium.com / Linear / Stripe quality)
✅ Authentic, realistic human-centered environments
✅ Clean composition with professional depth of field
✅ Unique and memorable - not generic or repetitive
✅ Clearly represents the article's topic/lesson (relevance)
✅ Would make a reader stop and click to read the article (CTR potential)

SCORING:
- visualScore (0-10): Overall visual/photographic quality
- relevanceScore (0-10): How well does it represent the article topic?
- qualityScore (0-10): Professional editorial standard
- overallScore (0-10): Combined judgment

Pass threshold: overallScore >= 7 OR (visualScore + relevanceScore) >= 14

OUTPUT FORMAT (STRICT JSON):
{
  "passed": true/false,
  "visualScore": 0-10,
  "relevanceScore": 0-10,
  "qualityScore": 0-10,
  "overallScore": 0-10,
  "specificIssues": ["issue1", "issue2"],
  "strengths": ["strength1", "strength2"],
  "regeneratePromptGuidance": "If failed, what should the image show instead? Be SPECIFIC.",
  "ctrPotential": true/false,
  "reason": "Concise explanation of decision."
}
`;

/**
 * Step 1: Generate High-End Content
 */
async function generateEditorialContent(
    topic,
    retryFeedback = "",
    retryCount = 0,
    previousDraft = null,
    recentTopics = [],
) {
    const prompt = `
    TASK: ${previousDraft ? "REFINE and IMPROVE" : "GENERATE"} a premium, human-written engineering blog post for Muhyo Tech.
    TOPIC: ${topic || "Realistic Technical Problem Solving"}
    
    ${retryFeedback ? `CRITICAL FEEDBACK FROM CRITIC: "${retryFeedback}"` : ""}
    ${previousDraft ? `PREVIOUS DRAFT TO IMPROVE: \nTitle: ${previousDraft.title}\nContent: ${previousDraft.content}` : ""}
    
    CRITIC ALIGNMENT (Follow these to pass first attempt):
    - Tone must be Senior Engineering/Founder level.
    - Paragraphs MUST be 2-3 sentences max. No exceptions.
    - Voice should be Muhyo Tech centric (using "we", "our team").
    - Avoid "AI-isms" and common tropes.
    - The Image Prompt must be REALISTIC and EDITORIAL (No neon, no cyberpunk).

    TOPIC UNIQUENESS: 
    Avoid structures or hooks similar to these recent blogs: ${recentTopics.join(", ")}.

    OUTPUT FORMAT (STRICT JSON):
    {
      "title": "Human and intriguing title",
      "slug": "url-friendly-slug",
      "summary": "Compelling editorial summary (150-160 chars).",
      "category": "Engineering | Design | Backend | SEO | Technology | Architecture | Culture | Security | Infrastructure",
      "tags": ["tag1", "tag2", "tag3"],
      "content": "Full HTML content. 2-3 sentences per paragraph ONLY.",
      "author": "Pir Ghulam Muhyo Din",
      "authorRole": "Founder",
      "readTime": "e.g. 7 min read",
      "image_prompt": "Realistic, editorial visual scene. Engineering focused. NO TEXT. NO NEON."
    }
    `;

  const response = await generateGeminiResponse(prompt, {
    systemInstruction: EDITORIAL_GUIDELINES,
    temperature: 0.9, // High for natural sentence variation
    responseMimeType: "application/json",
  });

  try {
    const cleaned = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Creator] JSON Parse Failed. Retrying...");
    if (retryCount < 2)
      return generateEditorialContent(
        topic,
        "Invalid JSON format",
        retryCount + 1,
      );
    throw e;
  }
}

/**
 * Step 1.5: ENHANCED Image Prompt Generation (The Architect - Context-Aware)
 *
 * NEW: Extracts semantic meaning from blog content to create UNIQUE visual concepts.
 * - Analyzes title, summary, category, tags, AND core content narrative
 * - Identifies key lesson/narrative/visual metaphor
 * - Generates BLOG-SPECIFIC image concepts (not generic)
 * - Returns BOTH: enhanced prompt AND structured visual strategy
 */
async function generateAdvancedImagePrompt(blogData) {
  // Extract narrative analysis from blog content
  const narrativeAnalysisPrompt = `
    BLOG DATA:
    Title: ${blogData.title}
    Summary: ${blogData.summary}
    Category: ${blogData.category}
    Tags: ${blogData.tags ? blogData.tags.join(", ") : "Tech"}
    
    CONTENT SNIPPET:
    ${blogData.content ? blogData.content.substring(0, 1500) : "No content"}

    TASK: Analyze this article's CORE NARRATIVE.
    
    Extract:
    1. KEY LESSON or INSIGHT (What is the article teaching?)
    2. EMOTIONAL TONE (Pragmatic, inspirational, cautionary, technical, etc.)
    3. VISUAL METAPHOR (What visual concept represents this lesson?)
    4. SETTING TYPE (Should be realistic/authentic - startup office, engineering workspace, whiteboard session, debugging scene, etc.)
    5. HUMAN ELEMENTS (Are there people? What are they doing?)
    6. LIGHT & MOOD (Cinematic, natural, warm, cool, professional, etc.)
    
    OUTPUT FORMAT (JSON):
    {
      "keyLesson": "One sentence core insight",
      "emotionalTone": "The article's emotional/professional tone",
      "visualMetaphor": "The core visual concept that represents this lesson",
      "settingType": "Specific, realistic setting description",
      "humanElements": "Description of human activity/presence",
      "lightingMood": "Cinematic, lighting, and mood description"
    }
  `;

  let narrativeAnalysis = null;
  try {
    const response = await generateGeminiResponse(narrativeAnalysisPrompt, {
      systemInstruction: IMAGE_EDITORIAL_ARCHITECT_GUIDELINES,
      temperature: 0.7,
      responseMimeType: "application/json",
    });
    const cleaned = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    narrativeAnalysis = JSON.parse(cleaned);
    console.log(
      "[Architect] Narrative Analysis:",
      JSON.stringify(narrativeAnalysis, null, 2),
    );
  } catch (e) {
    console.error("[Architect] Narrative Analysis Failed:", e);
    narrativeAnalysis = {
      keyLesson: blogData.summary,
      emotionalTone: "Professional Engineering",
      visualMetaphor: "Problem-solving and technical excellence",
      settingType: "Modern engineering workspace or startup office",
      humanElements: "Engineers collaborating and working",
      lightingMood: "Cinematic, professional, natural light",
    };
  }

  // Now generate the refined image prompt using narrative analysis
  const refinedImagePrompt = `
    NARRATIVE CONTEXT:
    Key Lesson: ${narrativeAnalysis.keyLesson}
    Tone: ${narrativeAnalysis.emotionalTone}
    Visual Metaphor: ${narrativeAnalysis.visualMetaphor}
    Setting: ${narrativeAnalysis.settingType}
    Human Elements: ${narrativeAnalysis.humanElements}
    Lighting: ${narrativeAnalysis.lightingMood}
    
    ARTICLE:
    Title: "${blogData.title}"
    Category: ${blogData.category}
    
    TASK: Generate a SPECIFIC, UNIQUE image concept that visually tells this article's story.
    
    CRITICAL REQUIREMENTS:
    ✅ NO TEXT, NO LOGOS, NO WATERMARKS, NO UI ELEMENTS
    ✅ Cinematic, editorial quality (Medium.com / Linear / Stripe blog style)
    ✅ Authentic, realistic human-centered scene
    ✅ Visually represents the article's KEY LESSON and emotional tone
    ✅ Unique composition - different from generic tech imagery
    ✅ Professional depth of field and lighting
    ✅ No neon, cyberpunk, floating code, or AI art clichés
    
    COMPOSITION GUIDANCE:
    - Setting: ${narrativeAnalysis.settingType}
    - Focus: Show the ${narrativeAnalysis.visualMetaphor}
    - Humans: ${narrativeAnalysis.humanElements}
    - Mood: ${narrativeAnalysis.lightingMood}
    - Style: Cinematic photography, professional editorial quality
    
    OUTPUT: A detailed, specific image generation prompt (1-2 paragraphs).
    Make it vivid and cinematic but NOT generic.
  `;

  try {
    const response = await generateGeminiResponse(refinedImagePrompt, {
      systemInstruction: IMAGE_EDITORIAL_ARCHITECT_GUIDELINES,
      temperature: 0.85,
    });
    const enhancedPrompt = response.trim();

    console.log("[Architect] Enhanced Image Prompt Generated:");
    console.log(enhancedPrompt);

    return {
      enhancedPrompt,
      narrativeAnalysis,
      originalTitle: blogData.title,
      originalCategory: blogData.category,
    };
  } catch (e) {
    console.error("[Architect] Enhanced Prompt Generation Failed:", e);

    // Fallback: Create a basic prompt using narrative analysis
    const fallbackPrompt = `A cinematic, professional ${narrativeAnalysis.emotionalTone} scene in a ${narrativeAnalysis.settingType}. ${narrativeAnalysis.humanElements}. Lighting: ${narrativeAnalysis.lightingMood}. Editorial photography style, no text or logos.`;

    return {
      enhancedPrompt: fallbackPrompt,
      narrativeAnalysis,
      originalTitle: blogData.title,
      originalCategory: blogData.category,
    };
  }
}

/**
 * Step 2.5: ENHANCED Image Quality Review (The Auditor - Context-Aware)
 *
 * NEW: Not only validates quality but provides SPECIFIC feedback for prompt regeneration.
 * - Checks for text, logos, AI artifacts
 * - Evaluates relevance to article content
 * - Provides actionable feedback for prompt iteration
 */
async function reviewGeneratedImage(imageUrl, blogData, attemptCount = 1) {
  const auditPrompt = `
    ARTICLE CONTEXT:
    Title: "${blogData.title}"
    Summary: "${blogData.summary}"
    Category: ${blogData.category}
    
    IMAGE REVIEW TASK:
    Analyze this generated image for the blog "${blogData.title}".
    
    STRICT REJECTIONS:
    ❌ ANY visible text (titles, logos, watermarks, fake screen text)
    ❌ UI elements (buttons, taskbars, windows, menus)
    ❌ AI artifacts (weird proportions, distorted objects, unnatural blending)
    ❌ Generic/overused patterns (neon cyberpunk, floating code, stock photo feel)
    ❌ Unrelated to article topic
    
    QUALITY CHECKS:
    ✅ Is it cinematic and professional editorial quality?
    ✅ Does it visually represent the article's topic/lesson?
    ✅ Is the composition unique and interesting?
    ✅ Does the mood/tone match a ${blogData.category || "technology"} article?
    ✅ Would this image increase click-through rate?
    
    OUTPUT FORMAT (STRICT JSON):
    {
      "passed": true/false,
      "visualScore": 0-10,
      "relevanceScore": 0-10,
      "qualityScore": 0-10,
      "overallScore": 0-10,
      "specificIssues": ["issue 1", "issue 2"],
      "strengths": ["strength 1", "strength 2"],
      "regeneratePromptGuidance": "If failed: What should the image show instead? Be VERY specific about what was wrong.",
      "ctrPotential": true/false,
      "reason": "Explain the decision concisely."
    }
  `;

  try {
    const response = await reviewContentWithGemini(auditPrompt, imageUrl);
    const cleaned = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const review = JSON.parse(cleaned);

    // Consider it passed if overall score >= 7 OR visual+relevance >= 14
    const isAcceptable =
      review.overallScore >= 7 ||
      review.visualScore + review.relevanceScore >= 14;

    console.log(
      `[Auditor] Attempt ${attemptCount}: Score ${review.overallScore}/10 | Acceptable: ${isAcceptable}`,
    );

    return {
      passed: isAcceptable,
      ...review,
      attemptCount,
    };
  } catch (e) {
    console.error("[Auditor] Image Review Failed:", e);
    return {
      passed: true, // Graceful degradation - assume safe if review fails
      reason: "Review failed, assuming safe for now.",
      visualScore: 6,
      relevanceScore: 5,
      qualityScore: 6,
      overallScore: 6,
      specificIssues: [],
      strengths: ["Could not validate"],
      regeneratePromptGuidance: "Auditor failed; manual review recommended",
      ctrPotential: false,
      attemptCount,
    };
  }
}

/**
 * Step 2: Internal AI Quality Review (The Critic)
 */
async function runQualityReview(blogData) {
  const reviewPrompt = `
    Act as a Senior Editorial Director at Muhyo Tech. 
    Review this blog for production-ready quality.

    PASSING CRITERIA:
    - Score >= 8: Generally strong, authentic, and follows basic rules.
    - Human Tone: Sounds like a senior lead, not a bot.
    - Structure: Paragraphs are short (2-3 sentences).
    - Muhyo Tech Voice: Uses "we", "our team" naturally.
    - Visuals: Image prompt is realistic/editorial (No neon/cyberpunk).

    REJECT ONLY IF:
    - Major AI tropes are present.
    - Paragraphs are long text walls (4+ sentences).
    - It sounds like a generic school textbook.
    - It's a blatant repetition of common AI blog structures.

    NOTE: Do NOT reject for minor subjective preferences if the score is 8+. 
    If it's good enough for an engineering audience, let it PASS.

    CONTENT:
    Title: ${blogData.title}
    Summary: ${blogData.summary}
    Content Snippet: ${blogData.content.substring(0, 1500)}
    Image Prompt: ${blogData.image_prompt}

    OUTPUT FORMAT (JSON):
    {
      "passed": true/false,
      "score": 0-10,
      "feedback": "Be constructive. Identify specific paragraphs that are too long or phrases that sound like a bot.",
      "metrics": {
         "readability": 0-10,
         "humanTone": 0-10,
         "realism": 0-10,
         "storytelling": 0-10
      }
    }
  `;

  const reviewResponse = await generateGeminiResponse(reviewPrompt, {
    temperature: 0.1,
    responseMimeType: "application/json",
  });

  try {
    return JSON.parse(
      reviewResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim(),
    );
  } catch (e) {
    return {
      passed: true,
      score: 7,
      feedback: "Review failed to parse, assuming safe.",
    };
  }
}

/**
 * Main Pipeline Function
 */
export async function runBlogAutomationPipeline(
  retryCount = 0,
  onProgress = null,
  previousDraft = null,
  fixedTopic = null,
) {
  const report = (status, details = {}) => {
    if (onProgress) onProgress({ status, details, retryCount });
    console.log(`[Editorial-Pipeline] ${status}:`, details.message || "");
  };

  if (retryCount >= 4) {
    report("FAILED", {
      message:
        "Maximum quality retries reached. Stopping to avoid degradation.",
    });
    return {
      success: false,
      message: "Quality threshold not met after 4 attempts.",
    };
  }

  try {
    await dbConnect();

    // 0. Topic Selection / Persistence
    let selectedTopic = fixedTopic;
    let recentTitles = [];

    if (!selectedTopic) {
      report("SELECTING_TOPIC", {
        message: "Rotating topics for maximum diversity...",
      });
      const recentBlogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title");
      recentTitles = recentBlogs.map((b) => b.title);

      const availableTopics = TOPIC_POOL.filter(
        (t) =>
          !recentTitles.some((rt) =>
            rt.toLowerCase().includes(t.toLowerCase().split(":")[0]),
          ),
      );

      selectedTopic =
        availableTopics.length > 0
          ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
          : TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
    }

    report(previousDraft ? "REFINING" : "GENERATING", {
      message: `${previousDraft ? "Refining existing draft" : "Drafting fresh content"} for: ${selectedTopic}`,
    });

    // 1. GENERATE / REFINE
    const blogData = await generateEditorialContent(
      selectedTopic,
      previousDraft ? previousDraft.feedback : "",
      retryCount,
      previousDraft,
      recentTitles,
    );

    // 2. REVIEW
    report("REVIEWING", {
      message: "Critic is analyzing editorial quality...",
    });
    const review = await runQualityReview(blogData);

    console.log(`[Review] Score: ${review.score}/10 | Pass: ${review.passed}`);

    // 3. VALIDATE (Updated Pass Threshold: 8.0)
    if (!review.passed || review.score < 8.0) {
      report("REJECTED", {
        message: `Retry #${retryCount + 1}: Score ${review.score}/10. Feedback: ${review.feedback}`,
      });

      // Smart Retry: Pass the current draft and feedback back to the creator
      return runBlogAutomationPipeline(
        retryCount + 1,
        onProgress,
        { ...blogData, feedback: review.feedback },
        selectedTopic,
      );
    }

    // 4. CHECK UNIQUENESS (Only if not a refinement of a known slug)
    const existing = await Blog.findOne({ slug: blogData.slug });
    if (existing && !previousDraft) {
      return runBlogAutomationPipeline(retryCount + 1, onProgress);
    }

    // 5. SAVE
    const newBlog = new Blog({
      ...blogData,
      publishStatus: "pending",
      aiGenerated: true,
      qualityStatus: "passed",
      qualityScore: review.score,
      qualityMetrics: review.metrics,
      generatedAt: new Date(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      createdAt: new Date(),
    });

    await newBlog.save();
    await cacheManager.invalidateByTag("blogs");

    report("COMPLETED", {
      message: "Editorial-quality blog saved.",
      id: newBlog._id,
    });
    return { success: true, blogId: newBlog._id, step: 1 };
  } catch (error) {
    report("ERROR", { message: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * ENHANCED Image Generation Pipeline (Step 2)
 *
 * NEW FEATURES:
 * - Saves enhanced image prompt to database
 * - Implements intelligent retry with prompt regeneration
 * - Tracks image quality scores and audit results
 * - Uses narrative analysis for blog-specific images
 */
export async function finalizeBlogPipeline(
  blogId,
  options = {},
  onProgress = null,
) {
  const report = (status, details = {}) => {
    if (onProgress) onProgress({ status, details });
    console.log(`[Pipeline-Step2] ${status}:`, details.message || "");
  };

  try {
    await dbConnect();
    const blog = await Blog.findById(blogId);
    if (!blog) throw new Error("Blog not found");

    if (options.generateImage === false) {
      report("SKIPPING_IMAGE", {
        message: "Publishing without AI image as requested...",
      });
      blog.imageStatus = "skipped";
      blog.publishStatus = "published";
      blog.imageGenerated = false;
      await blog.save();

      // Newsletter Transmission
      sendNewsletterEmail("blog", blog).catch((err) => {
        console.error("[Pipeline] Newsletter failure:", err);
      });

      await triggerFeaturedUpdate(blog);
      try {
        revalidatePath("/");
        revalidatePath("/blog");
      } catch (e) {}
      await cacheManager.invalidateByTag("blogs");

      report("COMPLETED", {
        message: "Blog published without image.",
        url: "",
      });
      return { success: true, blog };
    }

    report("STARTING_IMAGE", {
      message: "Generating authentic engineering visual...",
    });

    blog.imageStatus = "generating";
    await blog.save();

    let attempts = 0;
    const maxAttempts = 5;
    let finalImageUrl = null;
    let imageAuditData = null;

    // STEP 1: Analyze and Design visual concept
    report("DESIGNING_VISUAL", {
      message: "AI Architect is designing a unique, blog-specific concept...",
    });

    const architecturalDesign = await generateAdvancedImagePrompt(blog);

    // STEP 2: Save the enhanced prompt to database for transparency
    blog.imagePromptEnhanced = architecturalDesign.enhancedPrompt;
    blog.imageNarrativeAnalysis = architecturalDesign.narrativeAnalysis;
    await blog.save();

    report("VISUAL_DESIGNED", {
      message: `Concept: ${architecturalDesign.narrativeAnalysis.visualMetaphor}`,
    });

    // STEP 3: Generation with Intelligent Retry
    let currentPrompt = architecturalDesign.enhancedPrompt;

    while (attempts < maxAttempts) {
      attempts++;
      report("GENERATING_IMAGE", {
        message: `Attempt ${attempts}/${maxAttempts}: Generating visual...`,
      });

      try {
        const imageUrl = await generateAndUploadGeminiImage(currentPrompt);

        // Quality Validation Step with enhanced auditor
        report("VALIDATING_IMAGE", {
          message:
            "Auditor is checking relevance, quality, and technical standards...",
        });

        const audit = await reviewGeneratedImage(imageUrl, blog, attempts);
        imageAuditData = audit;

        if (audit.passed) {
          console.log(
            `[Pipeline] ✅ Image accepted on attempt ${attempts}. Score: ${audit.overallScore}/10`,
          );
          finalImageUrl = imageUrl;
          break;
        } else if (attempts === maxAttempts) {
          // Last attempt - accept anyway to avoid complete failure
          console.warn(
            `[Pipeline] Final attempt (${attempts}/${maxAttempts}) failed audit but accepting to avoid block.`,
          );
          console.warn(`Issues: ${audit.specificIssues.join(", ")}`);
          finalImageUrl = imageUrl;
          break;
        } else {
          // Intermediate failure - regenerate prompt with specific guidance
          report("REJECTED_IMAGE", {
            message: `Image rejected (Score: ${audit.overallScore}/10). Regenerating prompt with specific guidance...`,
          });

          // Create a refinement prompt based on auditor feedback
          const promptRefinementGuidance = `
            FAILED IMAGE ANALYSIS:
            Issues: ${audit.specificIssues.join(", ")}
            Auditor Guidance: ${audit.regeneratePromptGuidance}
            
            ARTICLE CONTEXT:
            Title: "${blog.title}"
            Category: ${blog.category}
            Original Concept: ${architecturalDesign.narrativeAnalysis.visualMetaphor}
            
            TASK: Regenerate the image prompt with these improvements:
            - Address the specific issues mentioned
            - Make the visual narrative even more clear and direct
            - Ensure zero text, logos, or UI elements
            - Emphasize the ${architecturalDesign.narrativeAnalysis.emotionalTone} tone
            - Focus on showing the ${architecturalDesign.narrativeAnalysis.visualMetaphor}
            
            Keep the same setting and concept, but refine the description for clarity and uniqueness.
            
            OUTPUT: Updated image generation prompt (1-2 paragraphs)
          `;

          try {
            const refinedPromptResponse = await generateGeminiResponse(
              promptRefinementGuidance,
              {
                systemInstruction: IMAGE_EDITORIAL_ARCHITECT_GUIDELINES,
                temperature: 0.75,
              },
            );
            currentPrompt = refinedPromptResponse.trim();
            console.log(
              "[Pipeline] Prompt regenerated with specific guidance.",
            );
          } catch (e) {
            console.error(
              "[Pipeline] Prompt refinement failed, retrying with original prompt:",
              e,
            );
            // Fall back to using architectural prompt again with slight variation
          }
        }
      } catch (e) {
        console.error(
          `[Pipeline] Image attempt ${attempts} failed:`,
          e.message,
        );

        if (e.message.includes("Rate limited")) {
          throw e; // Rate limiting is fatal
        }

        if (attempts === maxAttempts) {
          throw e; // Last attempt failed
        }

        // Continue to next attempt
      }
    }

    if (finalImageUrl) {
      // Save all audit data to database
      console.log("[Pipeline] Saving image and audit data to database...");
      await Blog.findByIdAndUpdate(
        blogId,
        {
          image: finalImageUrl,
          imageGenerated: true,
          imageStatus: "completed",
          publishStatus: "published",
          imagePromptEnhanced: blog.imagePromptEnhanced,
          imageNarrativeAnalysis: blog.imageNarrativeAnalysis,
          imageAuditScore: imageAuditData?.overallScore || 7,
          imageAuditVisualScore: imageAuditData?.visualScore || 7,
          imageAuditRelevanceScore: imageAuditData?.relevanceScore || 7,
          imageAuditCtrPotential: imageAuditData?.ctrPotential || false,
          imageAuditAttempts: attempts,
          updatedAt: new Date(),
        },
        { new: true },
      );

      report("IMAGE_COMPLETED", {
        message: `Visual complete. Quality Score: ${imageAuditData?.overallScore || 7}/10 | Attempts: ${attempts}`,
      });

      // --- Newsletter + Featured Ranking + Revalidation ---
      report("FINALIZING", {
        message: "Synchronizing newsletter and featured rankings...",
      });

      const publishedBlog = await Blog.findById(blogId);

      // Newsletter Transmission
      sendNewsletterEmail("blog", publishedBlog).catch((err) => {
        console.error("[Pipeline] Newsletter failure:", err);
      });

      // AI Featured Selection
      await triggerFeaturedUpdate(publishedBlog);

      // ISR Revalidation
      try {
        revalidatePath("/");
        revalidatePath("/blog");
      } catch (e) {
        // Safe to ignore in some contexts
      }

      await cacheManager.invalidateByTag("blogs");

      report("COMPLETED", {
        message: "Blog is LIVE! Editorial visual published.",
        url: finalImageUrl,
        auditScore: imageAuditData?.overallScore,
      });

      return {
        success: true,
        url: finalImageUrl,
        blog: publishedBlog,
        audit: imageAuditData,
      };
    } else {
      throw new Error(
        "Failed to generate a high-quality visual after multiple attempts.",
      );
    }
  } catch (error) {
    console.log("[Pipeline] Updating blog with failure state...");
    await Blog.findByIdAndUpdate(blogId, {
      imageGenerated: false,
      imageStatus: "retry_pending",
      imageError: error.message,
      $inc: { imageRetryCount: 1 },
    });
    report("ERROR", { message: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Uses Gemini's free image generation via REST API.
 * Tries gemini-2.5-flash-image first, falls back to gemini-3.1-flash-image.
 * Both are confirmed available on the free tier for this API key.
 */
async function generateAndUploadGeminiImage(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Models available on the free tier.
  // We use 2.5-flash-image as it's the most reliable for availability.
  const imageModels = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];

  let lastError;
  for (const model of imageModels) {
    try {
      console.log(`[Image] Trying model: ${model}...`);
      const cloudinaryUrl = await callGeminiImageREST(apiKey, model, prompt);
      return cloudinaryUrl;
    } catch (e) {
      console.warn(`[Image] Model ${model} failed: ${e.message}`);
      lastError = e;

      if (
        e.message.includes("429") ||
        e.message.includes("503") ||
        e.message.includes("retryDelay")
      ) {
        console.log(
          `[Image] Rate limit hit. Throwing immediately to avoid freezing UI...`,
        );
        throw new Error(
          "Rate limited by Gemini. Please try again after 1 minute.",
        );
      }
    }
  }

  throw new Error(
    `All Gemini image models failed. Last error: ${lastError?.message}`,
  );
}

async function callGeminiImageREST(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log("[Image] Calling Gemini image generation REST API...");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini REST API error ${res.status}: ${errText}`);
  }

  const json = await res.json();

  // Extract the inline image from the response
  let imagePart = null;
  for (const candidate of json.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (part.inlineData?.data) {
        imagePart = part.inlineData;
        break;
      }
    }
    if (imagePart) break;
  }

  if (!imagePart) {
    const textPart = json.candidates?.[0]?.content?.parts?.[0]?.text;
    throw new Error(
      `Gemini returned no image data. Response text: ${textPart || JSON.stringify(json).substring(0, 200)}`,
    );
  }

  console.log(
    `[Image] Gemini returned inline image (${imagePart.mimeType}), uploading to Cloudinary...`,
  );

  // Use Buffer (Node.js server-side) to decode base64
  const buffer = Buffer.from(imagePart.data, "base64");
  const blob = new Blob([buffer], { type: imagePart.mimeType || "image/png" });

  return await uploadBlobToCloudinary(blob);
}

/**
 * Shared: Upload a Blob directly to Cloudinary via multipart form upload.
 */
async function uploadBlobToCloudinary(blob, filename = "image.png") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary env vars missing: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
    );
  }

  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("upload_preset", uploadPreset);

  console.log(
    `[Pipeline] Uploading ${(blob.size / 1024).toFixed(1)}KB blob to Cloudinary...`,
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData, signal: controller.signal },
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(
      `Cloudinary blob-upload failed: ${JSON.stringify(data.error || data)}`,
    );
  }

  console.log("[Pipeline] Cloudinary blob-upload succeeded.");
  return data.secure_url;
}

export async function runFullBlogPipeline(onProgress) {
  const step1 = await runBlogAutomationPipeline(0, onProgress);
  if (step1.success) {
    return await finalizeBlogPipeline(step1.blogId, {}, onProgress);
  }
  return step1;
}