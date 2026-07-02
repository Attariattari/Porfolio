import {
    generateGeminiResponse,
    reviewContentWithGemini,
} from "./geminiService.js";
import { Blog } from "../models/Portfolio.js";
import dbConnect from "./dbConnect.js";
import { cacheManager } from "./cache.js";
import { ensureBlogImage } from "./ai/blog/ensureBlogImage.js";
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

const BRAND_POSITIONING = `
Muhyo Tech is a professional software and web engineering brand focused on modern websites, portfolio/business sites, web apps, digital services, AI-assisted workflows, performance, SEO, deployment, automation, and scalable systems.
Blogs should help visitors trust Muhyo Tech as a practical engineering partner: technical enough for developers, clear enough for founders and business owners, and useful enough to share.
Connect each article to real client value: faster launches, stronger reliability, better UX, improved discoverability, lower maintenance risk, automation, and long-term scalability.
Never invent named clients, fake numbers, awards, or case-study results. When discussing Muhyo Tech work, frame it as our approach, our standards, our lessons, or realistic engineering scenarios.
`;

const PROBLEM_SOLUTION_EDITORIAL_MODE = `
Prefer problem-solution blog angles often, without making every article identical.
Strong Muhyo Tech blogs should usually start from a real pain: slow websites, fragile deployments, poor SEO, messy admin workflows, confusing UX, unreliable forms, scaling bottlenecks, security gaps, manual business processes, or AI workflow confusion.
Then show the engineering response: diagnosis, architecture choice, automation, testing, performance work, UX simplification, monitoring, security hardening, or AI-assisted workflow design.
Finally connect it to business value: faster launch, fewer bugs, better customer trust, easier content updates, lower downtime, stronger SEO, cleaner operations, easier scaling, or less owner stress.
Use "we learned", "we approach", "we design", or "we look for" language. Do not claim fake client results or pretend every story happened exactly as written.
`;

const TOPIC_FAMILIES = [
  {
    id: "frontend-architecture",
    aliases: ["frontend", "front-end", "react", "next.js", "nextjs", "micro-frontends", "microfrontends", "edge computing", "edge", "website", "web app", "digital product", "ux"],
  },
  {
    id: "backend-scaling",
    aliases: ["node.js", "nodejs", "backend", "api", "scaling", "database sharding", "sharding", "mongodb", "aggregation"],
  },
  {
    id: "devops-cloud",
    aliases: ["devops", "deployment", "ci/cd", "pipeline", "cloud", "aws", "vercel", "infrastructure"],
  },
  {
    id: "ai-workflows",
    aliases: ["ai workflow", "ai-assisted", "llm", "ai-augmented", "automation", "gemini", "openai"],
  },
  {
    id: "security-auth",
    aliases: ["security", "cybersecurity", "authentication", "auth", "oauth", "hardening"],
  },
  {
    id: "business-saas",
    aliases: ["saas", "startup", "multi-tenancy", "founders", "technical debt", "laravel"],
  },
  {
    id: "seo-performance",
    aliases: ["seo", "performance", "optimization", "100ms", "traffic", "core web vitals"],
  },
];

function normalizeTopicText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTopicFamily(value = "") {
  const normalized = normalizeTopicText(value);
  return TOPIC_FAMILIES.find((family) =>
    family.aliases.some((alias) => normalized.includes(alias)),
  )?.id || null;
}

function getTopicStem(value = "") {
  return normalizeTopicText(value).split(":")[0].trim();
}

function isTopicTooSimilar(topic, recentBlogMeta = []) {
  const topicStem = getTopicStem(topic);
  const topicFamily = getTopicFamily(topic);

  return recentBlogMeta.some((recent) => {
    const recentText = normalizeTopicText(
      [recent.title, recent.category, ...(recent.tags || [])].filter(Boolean).join(" "),
    );
    const recentStem = getTopicStem(recent.title);
    const recentFamily = getTopicFamily(recentText);

    return (
      (topicStem && recentStem && recentStem.includes(topicStem)) ||
      (topicFamily && recentFamily && topicFamily === recentFamily)
    );
  });
}

function pickFallbackTopic(recentBlogMeta = []) {
  const availableTopics = TOPIC_POOL.filter(
    (topic) => !isTopicTooSimilar(topic, recentBlogMeta),
  );

  return availableTopics.length > 0
    ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
    : TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)];
}

async function generateStrategicTopic(recentBlogMeta = [], attempt = 0) {
  const recentContext = recentBlogMeta
    .map((blog) =>
      [blog.title, blog.category, ...(blog.tags || [])].filter(Boolean).join(" | "),
    )
    .join("\n");

  const prompt = `
    TASK: Create one fresh blog topic for Muhyo Tech.

    BRAND POSITIONING:
    ${BRAND_POSITIONING}

    PROBLEM-SOLUTION EDITORIAL MODE:
    ${PROBLEM_SOLUTION_EDITORIAL_MODE}

    TOPIC REQUIREMENTS:
    - Must be related to web development, software engineering, AI workflows, DevOps, SEO, performance, security, SaaS, startup systems, cloud deployment, automation, or digital product delivery.
    - Must naturally represent Muhyo Tech's work and professional standards.
    - Must attract readers with a practical, specific, high-curiosity angle.
    - Prefer topics framed around a painful real-world problem and the engineering fix that creates business value.
    - Must avoid clickbait, hype, generic beginner topics, and broad textbook titles.
    - Must not repeat or closely resemble recent blog topics.
    - Prefer concrete pain points business owners and developers care about.

    RECENT BLOGS TO AVOID:
    ${recentContext || "No recent blogs found."}

    OUTPUT STRICT JSON:
    {
      "topic": "Specific engineering topic with a clear angle",
      "problem": "The real-world pain this topic starts from",
      "solutionAngle": "The engineering approach Muhyo Tech can discuss",
      "businessValue": "The client or business benefit this article should connect to",
      "whyItWorks": "One sentence explaining why this topic helps Muhyo Tech attract the right readers",
      "category": "Engineering | Design | Backend | SEO | Technology | Architecture | Culture | Security | Infrastructure",
      "tags": ["tag1", "tag2", "tag3"]
    }
  `;

  try {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.85,
      responseMimeType: "application/json",
    });
    const parsed = JSON.parse(
      response.replace(/```json/gi, "").replace(/```/g, "").trim(),
    );
    const topic = String(parsed.topic || "").trim();

    if (topic.length < 25 || isTopicTooSimilar(topic, recentBlogMeta)) {
      if (attempt < 2) return generateStrategicTopic(recentBlogMeta, attempt + 1);
      return null;
    }

    return topic;
  } catch (error) {
    console.warn("[TopicStrategist] Falling back to static topic pool.");
    return null;
  }
}

const EDITORIAL_GUIDELINES = `
Act as a Senior AI Editorial Enhancement Engineer and Founder at Muhyo Tech. 
Your goal is to produce blogs that feel human-written, conversational, and emotionally engaging.

BRAND POSITIONING:
${BRAND_POSITIONING}

PROBLEM-SOLUTION EDITORIAL MODE:
${PROBLEM_SOLUTION_EDITORIAL_MODE}

MUHYO TECH VOICE:
- You are a Senior Lead or Founder with real-world production experience.
- Use a practical, "lessons learned" tone. Discuss tradeoffs, not just benefits.
- Naturally use "we", "our team", or "At Muhyo Tech" but skip forced branding.
- Avoid sounding like a marketing brochure; sound like an engineering post-mortem or deep dive.
- Every article should quietly strengthen Muhyo Tech's professional image by showing how good engineering improves websites, web apps, AI workflows, SEO, performance, deployment, or reliability.
- Make the article attractive and shareable through specificity, useful lessons, strong hooks, and founder-level clarity. Do not use clickbait.
- Frequently use a "pain -> diagnosis -> engineering fix -> tradeoff -> business outcome" arc, but vary the structure so the blog archive does not feel templated.

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

const IMAGE_REALISTIC_TECH_VISUAL_GUIDELINES = `
Act as a Senior AI Creative Director and Technical Visual Architect for Muhyo Tech.
Create premium blog-cover prompts that feel detailed, believable, and useful instead of obviously AI-generated.

CORE DIRECTION:
1. Start from the article's real lesson: what problem is being solved, what changes, and what business value appears?
2. Use realistic technical storytelling: architecture diagrams, dashboard cards, pipeline stages, server racks, product screens, data-flow paths, monitoring panels, deployment consoles, or before/after workflow states when relevant.
3. Short, crisp interface labels or status cards are allowed only when they clarify the scene. Avoid paragraphs, fake brand names, watermarks, gibberish, and random text.
4. Avoid generic AI art: no neon cyberpunk, no floating code clouds, no glowing brains, no fantasy holograms, no over-polished plastic look.
5. For transformation stories, prefer a left-to-right transition: messy/manual/risky state on one side, clean/automated/scalable outcome on the other.
6. Keep the scene grounded: believable workspaces, infrastructure, product interfaces, engineering artifacts, hands-on human gestures, and real operational details.
7. Make the cover attractive for founders and developers: clear focal point, strong contrast, professional color palette, clean negative space, and social-preview readability.

OUTPUT:
Write 1-2 detailed paragraphs for an image generator.
Include setting, technical artifacts, foreground/background, focal point, lighting, mood, composition, and quality.
The result should look like a premium engineering/product publication cover, not a stock photo and not generic AI art.
`;

const IMAGE_REVIEW_GUIDELINES = `
Act as a Strict Editorial Visual Quality Auditor for Muhyo Tech.
Your job is to ensure images are EDITORIAL QUALITY and ARTICLE-RELEVANT.

CRITICAL REJECTION CRITERIA (ANY of these = FAIL):
IMPORTANT OVERRIDE:
- Do NOT fail useful short interface labels, status cards, charts, pipeline cards, or architecture/dashboard elements when they are readable and relevant.
- Fail long text blocks, fake logos, fake brand names, gibberish, watermarks, unreadable labels, and cluttered UI.

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

    BRAND AND WEBSITE REPRESENTATION:
    ${BRAND_POSITIONING}

    PROBLEM-SOLUTION BLOG DIRECTION:
    ${PROBLEM_SOLUTION_EDITORIAL_MODE}
    
    ${retryFeedback ? `CRITICAL FEEDBACK FROM CRITIC: "${retryFeedback}"` : ""}
    ${previousDraft ? `PREVIOUS DRAFT TO IMPROVE: \nTitle: ${previousDraft.title}\nContent: ${previousDraft.content}` : ""}
    
    CRITIC ALIGNMENT (Follow these to pass first attempt):
    - Tone must be Senior Engineering/Founder level.
    - Content must be a complete article, not a teaser. Target 900-1400 words.
    - Include at least 5 meaningful <h2> sections and multiple <p> blocks.
    - Paragraphs MUST be 2-3 sentences max. No exceptions.
    - Voice should be Muhyo Tech centric (using "we", "our team").
    - If the topic supports it, use a practical problem-solving arc: real pain, root cause, engineering decision, implementation approach, tradeoffs, business result.
    - Connect the technical lesson to Muhyo Tech's practical work: websites, web apps, AI workflows, performance, SEO, deployment, automation, or scalable digital systems.
    - Make the blog useful and attractive for both founders and developers so it can bring qualified attention to the website.
    - Include 1-2 natural lines showing how this thinking shapes Muhyo Tech's work or standards, without sounding like an ad.
    - Mention client/business outcomes naturally: faster launches, fewer bugs, better UX, less downtime, cleaner operations, stronger SEO, or easier scaling.
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
      "content": "Full HTML article body with <p>, <h2>, <ul>/<li> where useful. 900-1400 words. 2-3 sentences per paragraph ONLY.",
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
    const parsed = JSON.parse(cleaned);
    const content = typeof parsed.content === "string" ? parsed.content.trim() : "";
    const hasHtmlBlocks = /<(p|h2|h3|ul|ol|blockquote)\b/i.test(content);
    const sectionCount = (content.match(/<h2\b/gi) || []).length;

    if (content.length < 2500 || !hasHtmlBlocks || sectionCount < 3) {
      if (retryCount < 2) {
        return generateEditorialContent(
          topic,
          "The previous output did not include a complete Full Narrative Content body. Regenerate a full 900-1400 word HTML article with multiple <h2> sections and rich <p> paragraphs.",
          retryCount + 1,
          null,
          recentTopics,
        );
      }
      throw new Error("Generated blog content was incomplete or not valid HTML.");
    }

    return parsed;
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
    6. LIGHT & MOOD (Natural, warm, cool, professional, product-lit, server-room, etc.)
    7. TECHNICAL ARTIFACTS (What concrete visual details should appear: dashboards, pipeline cards, servers, charts, data flow, product screens, hands, devices?)
    
    OUTPUT FORMAT (JSON):
    {
      "keyLesson": "One sentence core insight",
      "emotionalTone": "The article's emotional/professional tone",
      "visualMetaphor": "The core visual concept that represents this lesson",
      "settingType": "Specific, realistic setting description",
      "humanElements": "Description of human activity/presence",
      "lightingMood": "Realistic lighting and mood description",
      "technicalArtifacts": "Concrete technical details that should appear"
    }
  `;

  let narrativeAnalysis = null;
  try {
    const response = await generateGeminiResponse(narrativeAnalysisPrompt, {
      systemInstruction: IMAGE_REALISTIC_TECH_VISUAL_GUIDELINES,
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
      lightingMood: "Professional, realistic, natural light",
      technicalArtifacts: "Architecture cards, monitoring panels, server or product details, and clear workflow elements",
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
    Technical Artifacts: ${narrativeAnalysis.technicalArtifacts || "Relevant dashboards, architecture cards, data flow, product screens, or infrastructure details"}
    
    ARTICLE:
    Title: "${blogData.title}"
    Category: ${blogData.category}
    
    TASK: Generate a SPECIFIC, UNIQUE image concept that visually tells this article's story.
    
    CRITICAL REQUIREMENTS:
    IMPORTANT OVERRIDE:
    - Do not make this a plain cinematic stock scene. Make it a realistic, detailed technical/product publication cover.
    - Clean UI/dashboard/pipeline/architecture elements are allowed when they explain the article.
    - Short readable labels or status cards are allowed only when useful; avoid long text, fake logos, gibberish, and watermarks.
    - For transformation stories, show contrast: messy/manual/risky state transitioning into clean/automated/scalable outcome.
    - Avoid obvious AI-art cliches, fantasy holograms, excessive glow, floating code clouds, and plastic-looking scenes.

    - Authentic, realistic technical scene with concrete engineering/product details
    - Visually represents the article's KEY LESSON, emotional tone, and business benefit
    - Unique composition, different from generic tech imagery
    - Professional depth, lighting, and social-preview readability
    - No neon, cyberpunk, floating code clouds, or obvious AI-art cliches
    
    COMPOSITION GUIDANCE:
    - Setting: ${narrativeAnalysis.settingType}
    - Focus: Show the ${narrativeAnalysis.visualMetaphor}
    - Humans: ${narrativeAnalysis.humanElements}
    - Technical Details: ${narrativeAnalysis.technicalArtifacts || "specific product, infrastructure, workflow, or dashboard details"}
    - Mood: ${narrativeAnalysis.lightingMood}
    - Style: Realistic premium technical/product publication cover
    
    OUTPUT: A detailed, specific image generation prompt (1-2 paragraphs).
    Make it vivid, detailed, and grounded. It should feel attractive and professional, not obviously AI-generated.
  `;

  try {
    const response = await generateGeminiResponse(refinedImagePrompt, {
      systemInstruction: IMAGE_REALISTIC_TECH_VISUAL_GUIDELINES,
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
    const fallbackPrompt = `A realistic premium technical editorial scene in a ${narrativeAnalysis.settingType}. ${narrativeAnalysis.humanElements}. Include concrete engineering details such as architecture cards, monitoring panels, server or product details, and clear workflow elements when relevant. Lighting: ${narrativeAnalysis.lightingMood}. Avoid fake logos, gibberish text, watermarks, and obvious AI-art cliches.`;

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
    IMPORTANT OVERRIDE:
    - Short readable UI labels, status cards, charts, pipeline cards, and dashboard/architecture elements are acceptable when they clarify the article.
    - Reject only long text blocks, fake logos, fake brand names, gibberish, watermarks, unreadable labels, cluttered UI, or irrelevant screenshots.

    - Long text blocks, fake logos, watermarks, fake brand names, gibberish, or unreadable labels
    - Cluttered or irrelevant UI that does not explain the article
    - AI artifacts (weird proportions, distorted objects, unnatural blending)
    - Generic/overused patterns (neon cyberpunk, floating code, stock photo feel)
    - Unrelated to article topic
    
    QUALITY CHECKS:
    - Is it realistic, detailed, and professional technical editorial quality?
    - Does it visually represent the article's topic/lesson?
    - Is the composition unique and interesting?
    - Does the mood/tone match a ${blogData.category || "technology"} article?
    - Would this image increase click-through rate?
    
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
    - Brand Representation: Shows how Muhyo Tech thinks about professional websites, web apps, AI workflows, SEO, performance, deployment, automation, or scalable systems.
    - Reader Magnet: Offers a practical, specific angle that founders or developers would want to read and share.
    - Problem-Solution Value: When appropriate, connects a real technical/business pain to a practical engineering fix and a clear business outcome.
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
         "storytelling": 0-10,
         "brandFit": 0-10,
         "businessValue": 0-10
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
    let recentBlogMeta = [];

    if (!selectedTopic) {
      report("SELECTING_TOPIC", {
        message: "AI strategist is selecting a fresh Muhyo Tech topic...",
      });
      const recentBlogs = await Blog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("title category tags");
      recentBlogMeta = recentBlogs.map((blog) => ({
        title: blog.title || "",
        category: blog.category || "",
        tags: Array.isArray(blog.tags) ? blog.tags : [],
      }));
      recentTitles = recentBlogs.map((b) => b.title);

      selectedTopic =
        (await generateStrategicTopic(recentBlogMeta)) ||
        pickFallbackTopic(recentBlogMeta);
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

    report("CONTENT_READY", {
      message: "Full narrative content generated and passed quality review.",
      title: blogData.title,
      summary: blogData.summary,
    });

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

    report("CONTENT_SAVED", {
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
        message: "AI image generation is off. Preparing secure upload email...",
      });
      const ensured = await ensureBlogImage(blogId, {
        skipGeneration: true,
        baseUrl: options.baseUrl,
      });

      report("MANUAL_IMAGE_REQUIRED", {
        message: ensured.emailSent
          ? "Secure upload email sent to Super Admin."
          : "Manual upload is required, but email could not be sent.",
        emailSent: !!ensured.emailSent,
        uploadLinkId: ensured.uploadLinkId,
      });

      return ensured;
    }

    const ensured = await ensureBlogImage(blogId, {
      maxImageRetries: 1,
      providerTimeoutMs: 12000,
      baseUrl: options.baseUrl,
    });
    report(
      ensured.status === "generated" ? "IMAGE_COMPLETED" : "MANUAL_IMAGE_REQUIRED",
      {
        message:
          ensured.status === "generated"
            ? "AI image generated and attached to the blog."
            : ensured.emailSent
              ? "AI image failed. Secure upload email sent to Super Admin."
              : "AI image failed. Manual upload is required, but email could not be sent.",
        emailSent: !!ensured.emailSent,
        uploadLinkId: ensured.uploadLinkId,
      },
    );

    return ensured;

  } catch (error) {
    console.error("[Pipeline] Pipeline error:", error.message);
    console.log("[Pipeline] Updating blog with failure state...");

    try {
      await Blog.findByIdAndUpdate(blogId, {
        imageGenerated: false,
        imageStatus: "failed",
        imageError: error.message,
        $inc: { imageRetryCount: 1 },
      });
    } catch (dbError) {
      console.error("[Pipeline] Failed to update blog error state:", dbError);
    }

    report("ERROR", { message: error.message });
    return { success: false, error: error.message };
  }
}

async function generateAndUploadGeminiImage(prompt) {
  try {
    console.log(
      "[Image] Attempting professional AI generation via Pollinations...",
    );

    // Clean prompt - Very simple to avoid 402
    const cleanPrompt = encodeURIComponent(
      prompt.split(".")[0].substring(0, 80).trim(),
    );
    const seed = Math.floor(Math.random() * 10000);

    // Attempt 1: Simple Pollinations (No complex models to avoid 402)
    const aiUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?nologo=true&seed=${seed}`;

    let response = await fetch(aiUrl);

    // Fallback to LoremFlicker (Professional Stock Search) if Pollinations fails
    if (!response.ok) {
      console.log(
        "[Image] AI Model restricted (402). Switching to Professional Stock Library...",
      );
      const searchTags = "technology,coding,minimalist,engineering,startup";
      const stockUrl = `https://loremflickr.com/g/1200/800/${searchTags}/all`;
      response = await fetch(stockUrl);
    }

    if (!response.ok) throw new Error("All image sources failed.");

    const imageBlob = await response.blob();
    return await uploadBlobToCloudinary(imageBlob, "blog_header.png");
  } catch (e) {
    console.error("[Image] Visual sourcing failed:", e.message);
    // Absolute safety fallback
    return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80";
  }
}

/**
 * Placeholder for legacy compatibility - now handled by generateAndUploadGeminiImage
 */
async function callGeminiImageREST(apiKey, model, prompt) {
  return await generateAndUploadGeminiImage(prompt);
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
