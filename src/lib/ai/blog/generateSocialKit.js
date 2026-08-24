import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { SITE_URL } from "@/lib/config";
import { cacheManager } from "@/lib/cache";

const SOCIAL_PLATFORMS = ["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram", "devto"];

const cleanText = (value = "") => String(value)
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const blogUrl = (blog) => `${SITE_URL}/blog/${blog.slug}`;
const imageUrl = (blog) => blog.featuredImage?.url || blog.image || "";
const hashtags = (blog, limit = 4) => {
  const values = [blog.focusKeyword, blog.category, ...(blog.tags || []), "WebDevelopment", "WebEngineering", "MuhyoTech"]
    .map((value) => cleanText(value).replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);
  return [...new Set(values)].slice(0, limit).map((value) => `#${value}`).join(" ");
};

const firstLine = (value = "") => String(value).split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
const capitalizeFirstLetter = (value = "") => {
  const text = String(value || "").trim();
  const index = text.search(/[a-z]/i);
  return index < 0 ? text : `${text.slice(0, index)}${text[index].toUpperCase()}${text.slice(index + 1)}`;
};
const hashtagCount = (value = "") => (String(value).match(/#[a-z0-9_]+/gi) || []).length;
const urlCount = (value = "", url = "") => url ? String(value).split(url).length - 1 : 0;
const plainFallbackText = (value = "") => cleanText(value)
  .replace(/\butili[sz]e\b/gi, "use")
  .replace(/\bleverage\b/gi, "use")
  .replace(/\bfacilitate\b/gi, "help")
  .replace(/\brobust\b/gi, "reliable")
  .replace(/\bseamless(?:ly)?\b/gi, "smooth")
  .replace(/\bcutting[- ]edge\b/gi, "modern")
  .replace(/\bmultifaceted\b/gi, "complex")
  .replace(/\bsynergy\b/gi, "teamwork")
  .replace(/\bparadigm\b/gi, "approach")
  .replace(/\bholistic\b/gi, "complete")
  .replace(/\bstate[- ]of[- ]the[- ]art\b/gi, "modern")
  .replace(/\btransformative\b/gi, "useful")
  .replace(/\bgroundbreaking\b/gi, "new")
  .replace(/\bunprecedented\b/gi, "unusual")
  .replace(/\bintricacies\b/gi, "details")
  .replace(/\baforementioned\b/gi, "this");

const easyExcerpt = (value = "", maxCharacters = 430) => {
  const words = plainFallbackText(value).split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let index = 0; index < words.length && chunks.join(" ").length < maxCharacters; index += 22) {
    chunks.push(`${words.slice(index, index + 22).join(" ").replace(/[,:;]+$/, "")}.`);
  }
  return chunks.join(" ").slice(0, maxCharacters).replace(/\s+\S*$/, "").replace(/[,:;]+$/, "").trim();
};
const hasConfiguredGeminiKey = () => [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
].some((key) => String(key || "").trim());

function validateShareReadyKit(kit, blog) {
  const url = blogUrl(blog);
  const source = cleanText([blog.title, blog.summary, blog.seoDescription, blog.content].filter(Boolean).join(" "));
  const titleFingerprint = cleanText(blog.title).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const unsafeStyle = /\bever wonder\b|\bdid you know\b|\bin today'?s digital world\b|\bsearch engines? (?:will )?reward\b|\bboost(?:ing)? (?:your )?(?:rankings?|ctr)\b|\bguaranteed?\b|\b100%\b|\bskyrocket\b|\bgame[- ]changer\b|\blet'?s talk\b|\bclick here\b|\bunlock(?:ing)? the power\b|\brevolutioni[sz]e\b|\bdelve\b/i;
  const hardWording = /\b(?:utili[sz]e|leverage|facilitate|synergy|paradigm|multifaceted|holistic|cutting[- ]edge|state[- ]of[- ]the[- ]art|seamless(?:ly)?|robust|transformative|groundbreaking|unprecedented|intricacies|aforementioned|in order to|it is important to note|navigate the complexities|ever[- ]evolving landscape)\b/i;
  const limits = { linkedin: [500, 2200], facebook: [350, 1600], x: [120, 280], whatsapp: [150, 800], reddit: [500, 2400], instagram: [400, 1800], devto: [500, 2500] };
  const wordLimits = { linkedin: [70, 300], facebook: [50, 230], x: [15, 65], whatsapp: [20, 130], reddit: [70, 340], instagram: [60, 260], devto: [70, 380] };
  const hashtagLimits = { linkedin: [3, 5], facebook: [0, 3], x: [0, 2], whatsapp: [0, 0], reddit: [0, 0], instagram: [3, 8], devto: [2, 5] };
  const hooks = [];

  for (const [platform, value] of Object.entries(kit)) {
    if (!limits[platform]) continue;
    const text = String(value || "").trim();
    const hook = firstLine(text);
    const hookWords = cleanText(hook).split(/\s+/).filter(Boolean).length;
    const firstAlphabet = hook.match(/[a-z]/i)?.[0] || "";
    const editorialText = text.replace(url, " ");
    const normalizedHook = cleanText(hook).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const [minimum, maximum] = limits[platform];
    const [minimumWords, maximumWords] = wordLimits[platform];
    const [minimumTags, maximumTags] = hashtagLimits[platform];
    if (text.length < minimum || text.length > maximum) throw new Error(`${platform} post length (${text.length} chars) is outside the professional platform limit [${minimum}, ${maximum}].`);
    if (hook.length < 15 || hook.length > 180 || hookWords < 3 || hookWords > 25 || /https?:\/\/|#|\?/.test(hook)) throw new Error(`${platform} needs a concise standalone first-line hook.`);
    if (firstAlphabet && firstAlphabet !== firstAlphabet.toUpperCase()) throw new Error(`${platform} must start with a capital letter.`);
    if (normalizedHook === titleFingerprint || unsafeStyle.test(editorialText)) throw new Error(`${platform} uses a weak, generic, or unsupported social formula.`);
    if (hardWording.test(editorialText)) throw new Error(`${platform} uses difficult corporate or AI-style wording instead of plain language.`);
    if (/!!!|\?\?\?|\.{4,}|<[^>]+>|\[link\]|\{\{/.test(text)) throw new Error(`${platform} contains invalid markup or unresolved placeholders.`);
    if (urlCount(text, url) !== 1) throw new Error(`${platform} must contain the canonical article URL exactly once.`);
    const tags = hashtagCount(text);
    if (tags < minimumTags || tags > maximumTags) throw new Error(`${platform} has an unprofessional hashtag count.`);
    const unsupportedNumbers = (editorialText.match(/\b\d+(?:\.\d+)?%?\b/g) || []).filter((number) => !source.includes(number));
    if (unsupportedNumbers.length) throw new Error(`${platform} contains a numeric claim not found in the article.`);
    const prose = editorialText.replace(/#[a-z0-9_]+/gi, " ");
    const proseWordCount = cleanText(prose).split(/\s+/).filter(Boolean).length;
    if (proseWordCount < minimumWords || proseWordCount > maximumWords) throw new Error(`${platform} must explain the article clearly without being too short or too long.`);
    hooks.push(normalizedHook);
  }

  if (new Set(hooks).size !== hooks.length) throw new Error("Platform posts repeat the same opening hook.");
  return kit;
}

export function validateShareReadySocialKit(kit, blog) {
  return validateShareReadyKit(kit, blog);
}

function createFallbackKit(blog, { validate = true } = {}) {
  const url = blogUrl(blog);
  const title = plainFallbackText(blog.title);
  const topic = plainFallbackText(blog.focusKeyword || blog.category || "professional web development").slice(0, 70);
  const sourceSummary = easyExcerpt(blog.summary || blog.seoDescription || blog.content, 300);
  
  const linkedinHook = capitalizeFirstLetter(`${topic} works best when engineering choices are planned from the start.`);
  const facebookHook = capitalizeFirstLetter(`Clear architectural choices behind ${topic} make web systems reliable.`);
  
  const xHooksPool = [
    `Mastering ${topic} requires focusing on real-world engineering, not just syntax.`,
    `Clean ${topic} architecture saves hours of debugging in production environments.`,
    `Effective ${topic} starts by aligning system design directly with user impact.`,
    `Building scalable solutions with ${topic} comes down to key structural decisions.`,
    `When implementing ${topic}, simplicity and maintainability beat over-engineering.`,
  ];
  const xHash = Math.abs(String(blog.title || topic).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const xHook = capitalizeFirstLetter(xHooksPool[xHash % xHooksPool.length]);

  const whatsappHook = capitalizeFirstLetter(`Practical engineering guide covering ${topic}.`);
  const redditHook = capitalizeFirstLetter(`${topic} raises practical questions about how modern web systems are built.`);
  const instagramHook = capitalizeFirstLetter(`Building better ${topic} starts with clear structural choices.`);
  const devtoHook = capitalizeFirstLetter(`Deep architectural patterns and practical lessons for ${topic}.`);

  const tags = hashtags(blog);

  const linkedin = `${linkedinHook}\n\n${sourceSummary}\n\nKey Engineering Takeaways:\n• Architectural clarity: plan data flow before writing code.\n• Production reliability: address edge cases and performance early.\n• Measurable outcomes: connect build choices to real system stability.\n\nIn our practical guide, “${title},” we break down the full framework, implementation trade-offs, and step-by-step guidance.\n\nRead the full guide: ${url}\n\n${tags}`.trim();

  const facebook = `${facebookHook}\n\n${sourceSummary}\n\nWhat this guide covers:\n• Core challenges and practical solutions\n• Step-by-step build decisions\n• Best practices for maintainable web projects\n\nRead the complete article: ${url}\n\n${hashtags(blog, 3)}`.trim();

  const xSuffix = `\n\n${url} ${hashtags(blog, 2)}`;
  const xDetail = `• Plan data flow and architecture early\n• Focus on real production stability`.slice(0, 110);
  const x = `${xHook}\n\n${xDetail}${xSuffix}`.slice(0, 280);

  const whatsapp = `${whatsappHook}\n\n*Key Highlights:*\n• ${sourceSummary.slice(0, 180)}\n• Practical solutions and architecture blueprints\n\n*Read Guide:* ${title}\n${url}`;

  const reddit = `${redditHook}\n\n${sourceSummary}\n\nKey Discussion Points:\n• Architecture and performance tradeoffs\n• Avoiding common implementation pitfalls\n• Practical patterns for production environments\n\nThe full article includes detailed code patterns and context:\n\nRead it here: ${url}`;

  const instagram = `${instagramHook}\n\n${sourceSummary}\n\nKey Points:\n• 1. Plan structure before coding\n• 2. Focus on speed and maintainability\n• 3. Test edge cases early\n\nRead the full guide for complete steps: ${url}\n\n${hashtags(blog, 6)}`;

  const devto = `${devtoHook}\n\n${sourceSummary}\n\nTL;DR & Architecture Lessons:\n- Core architectural trade-offs\n- Concrete code and database patterns\n- Performance optimization benchmarks\n\nCheck out the full write-up: ${url}\n\n${hashtags(blog, 4)}`;

  const kit = { linkedin, facebook, x, whatsapp, reddit, instagram, devto };
  if (validate) validateShareReadyKit(kit, blog);
  return { ...kit, source: "fallback" };
}

function createSafeFallbackKit(blog) {
  try {
    return createFallbackKit(blog);
  } catch (error) {
    console.warn("[SocialKit] Strict fallback check needed a relaxed emergency draft:", error.message);
    return { ...createFallbackKit(blog, { validate: false }), error: `AI copy was unavailable; a safe editable draft was prepared. ${error.message}` };
  }
}

function parseKit(response, blog) {
  const parsed = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  const required = SOCIAL_PLATFORMS;
  if (required.some((key) => !cleanText(parsed[key]))) throw new Error("Social response is incomplete.");
  const url = blogUrl(blog);
  const kit = Object.fromEntries(required.map((key) => {
    let value = capitalizeFirstLetter(parsed[key]);
    if (!value.includes(url)) value = `${value}\n\n${url}`;
    return [key, value];
  }));
  const unsafeStyle = /\bever wonder\b|\bdid you know\b|\bin today'?s digital world\b|\bsearch engines? (?:will )?reward\b|\bboost(?:ing)? (?:your )?(?:rankings?|ctr)\b|\bguaranteed?\b|\b100%\b|\bskyrocket\b|\bgame[- ]changer\b|\blet'?s talk\b|\bclick here\b/i;
  if (Object.values(kit).some((value) => unsafeStyle.test(value))) {
    throw new Error("Social response used an unprofessional or unsupported formula.");
  }
  if (Object.values(kit).some((value) => /<[^>]+>|\[link\]|\{\{/.test(value))) {
    throw new Error("Social response contains markup or unresolved placeholders.");
  }
  if (kit.linkedin.length < 80 || kit.facebook.length < 60 || kit.whatsapp.length < 35) {
    throw new Error("Social response is too thin to be useful.");
  }
  if (kit.x.length > 280) throw new Error("X post exceeds 280 characters.");
  validateShareReadyKit(kit, blog);
  return { ...kit, source: "ai" };
}

async function reviewSocialKit(kit, blog) {
  const response = await generateGeminiResponse(`Act as a strict senior social editor for Muhyo Tech. Verify these posts against the source article.

SOURCE TITLE: ${blog.title}
SOURCE SUMMARY: ${cleanText(blog.summary || blog.seoDescription)}
SOURCE EXTRACT: ${cleanText(blog.content).slice(0, 14000)}

POSTS:
${JSON.stringify(kit)}

Reject if any post contains an invented fact, result, statistic, client experience, ranking promise, awkward or embarrassing wording, generic AI hook, unnecessary jargon, clickbait, excessive sales language, misleading simplification, or a claim stronger than the source. Reject if a post is dense wall-of-text without clean bullet points or line breaks. The first non-empty line of every post must be an article-specific hook that creates immediate interest without clickbait, and all opening hooks must be distinct. Reject corporate words or AI-style language when a common short word would work. Technical terms must be necessary, limited, and explained in plain language. Sentences should be short enough to understand on the first read.

Return strict JSON only: {"approved":true,"issues":[],"revisionDirection":""}`, {
    temperature: 0.05,
    responseMimeType: "application/json",
    maxOutputTokens: 700,
    thinkingBudget: 0,
    timeoutMs: Math.min(8000, Math.max(4000, Number(process.env.AI_SOCIAL_REVIEW_TIMEOUT_MS) || 8000)),
  });
  const review = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  return {
    approved: review.approved === true && Array.isArray(review.issues) && review.issues.length === 0,
    direction: cleanText(review.revisionDirection || (review.issues || []).join("; ")).slice(0, 500),
  };
}

export async function buildSocialKit(blog, { useAI = true, feedback = "" } = {}) {
  if (!useAI || !hasConfiguredGeminiKey()) return createSafeFallbackKit(blog);

  const prompt = `Create a professional, modern, scannable point-wise social sharing kit for this Muhyo Tech web-development article.

Title: ${blog.title}
Summary: ${cleanText(blog.summary)}
Article type: ${blog.articleType || "supporting"}
Category: ${blog.category || "Web Development"}
Focus keyword: ${blog.focusKeyword || ""}
Article extract: ${cleanText(blog.content).slice(0, ["pillar", "standalone_authority", "verified_trend"].includes(blog.articleType) ? 10000 : 6500)}
Canonical URL: ${blogUrl(blog)}
${feedback ? `Editor direction: ${cleanText(feedback).slice(0, 300)}` : ""}

FORMATTING RULE: Do NOT write long, dense paragraphs. Format posts with structured point-wise bullet points (•) and clean spacing so readers can scan key lessons in 5 seconds.

Write seven distinct posts:
- linkedin: 100-240 words and 600-1800 characters. Start with a sharp hook line. Follow with 1-2 sentences of core context, then a point-wise breakdown of 3-4 key engineering takeaways using bullet points (•), an actionable summary sentence, canonical URL, and 3-5 relevant hashtags.
- facebook: 80-180 words and 450-1400 characters. Conversational, scannable format with a strong opening hook, 2-3 bullet highlights of what readers will learn, a read-more invitation, canonical URL, and 1-3 hashtags.
- x: 160-280 characters strictly including canonical URL, a sharp hook line, 1-2 punchy bullet takeaways (•), and 1-2 hashtags.
- whatsapp: 35-100 words and 180-600 characters. Formatted with clean bold headings (*Topic:*, *Key Highlights:*, *Read Guide:*), 2 concise bullet points, and canonical URL.
- reddit: 100-240 words and 600-2000 characters. Useful, community-focused Markdown discussion with structured technical bullet points, tradeoffs, and canonical URL (no hashtags).
- instagram: 90-200 words and 500-1500 characters. Carousel-style caption with strong first line, 3-4 clear bullet takeaways (•), canonical URL, and 3-8 relevant hashtags.
- devto: 100-240 words and 600-2000 characters. Developer-oriented Markdown write-up with TL;DR bullets, architecture trade-offs, and canonical URL (2-5 hashtags).

EDITORIAL RULES:
- The FIRST non-empty line is the hook. It must be 8-18 words, article-specific, immediately interesting, understandable without context, and must not simply repeat the title.
- Give each platform a different opening hook. Prefer a sharp observation, consequence, contrast, overlooked mistake, or practical tension supported by the article.
- The hook must not contain a URL, hashtag, greeting, emoji, exaggerated promise, or empty question.
- Do not start with "Ever wonder", "Did you know", "In today's digital world", or another generic AI hook.
- Do not force "At Muhyo Tech" into every post. Mention Muhyo Tech naturally at most once when it adds context.
- Use bullet points (• or -) for key takeaways to ensure clean point-wise readability across all platforms.
- Technical names such as Schema.org, JSON-LD, APIs, frameworks, or standards may appear only when essential to the article's central lesson, and should be explained in plain language.
- Avoid claims such as "Google will reward this", "boost rankings", "improve CTR", "fully understood", or "guaranteed discovery" unless the article contains verified evidence.
- Do not use a sales-call CTA such as "let's talk" unless the article is explicitly commercial. Default CTA: invite the reader to read the full practical guide.
- Use everyday English that a business owner or developer can understand on the first read.
- Keep each sentence under 30 words.
- Never invent clients, rankings, traffic, revenue, percentages, results, awards, partnerships, or personal experience not stated in the article.
- Avoid clickbait, motivational filler, repetitive formulas, and generic AI phrases.

Return strict JSON only: {"linkedin":"","facebook":"","x":"","whatsapp":"","reddit":"","instagram":"","devto":""}`;

  const generateCandidate = async () => {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.65,
      responseMimeType: "application/json",
      maxOutputTokens: 1800,
      thinkingBudget: 0,
      timeoutMs: Math.min(18000, Math.max(8000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 18000)),
    });
    return parseKit(response, blog);
  };

  try {
    let candidate = await generateCandidate();
    let review = await reviewSocialKit(candidate, blog);

    if (!review.approved) {
      const correctedPrompt = `${prompt}\n\nMANDATORY REVIEW CORRECTIONS: ${review.direction || "Rewrite with stricter factual accuracy, natural language, and a stronger article-specific reader benefit."}`;
      const correctedResponse = await generateGeminiResponse(correctedPrompt, {
        temperature: 0.45,
        responseMimeType: "application/json",
        maxOutputTokens: 1800,
        thinkingBudget: 0,
        timeoutMs: Math.min(18000, Math.max(8000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 18000)),
      });
      candidate = parseKit(correctedResponse, blog);
      review = await reviewSocialKit(candidate, blog);
    }

    if (!review.approved) throw new Error(`Editorial review rejected the social kit: ${review.direction || "quality standard not met"}`);
    return candidate;
  } catch (error) {
    console.warn("[SocialKit] AI generation unavailable; using safe fallback.", error.message);
    const fallback = createSafeFallbackKit(blog);
    return { ...fallback, error: fallback.error || error.message };
  }
}

export async function generateAndSaveSocialKit(blogId, options = {}) {
  await dbConnect();
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error("Blog not found.");

  blog.socialKit = { ...(blog.socialKit?.toObject?.() || blog.socialKit || {}), status: "generating", error: "" };
  await blog.save();

  try {
    const kit = await buildSocialKit(blog, options);
    const fallbackKit = createSafeFallbackKit(blog);
    const existingKit = blog.socialKit?.toObject?.() || blog.socialKit || {};

    // Intelligent Per-Platform Merge & Auto-Backfill:
    // Ensure EVERY single platform in SOCIAL_PLATFORMS is populated and non-empty.
    const completeKit = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const generatedPost = cleanText(kit[platform]);
      const existingPost = cleanText(existingKit[platform]);
      const fallbackPost = cleanText(fallbackKit[platform]);

      // Prefer generated AI post, then existing non-empty post, then fallback post
      completeKit[platform] = generatedPost || existingPost || fallbackPost;
    }

    blog.socialKit = {
      ...existingKit,
      ...kit,
      ...completeKit,
      status: "ready",
      imageUrl: imageUrl(blog),
      source: kit.source || "ai",
      generatedAt: new Date(),
      updatedAt: new Date(),
      error: kit.error || "",
    };
    await blog.save();
    await cacheManager.invalidateByTag("blogs");
    return blog.socialKit;
  } catch (error) {
    const fallbackKit = createSafeFallbackKit(blog);
    const existingKit = blog.socialKit?.toObject?.() || blog.socialKit || {};
    
    // Emergency Backfill: Ensure NO platform is left missing on error
    const completeKit = {};
    for (const platform of SOCIAL_PLATFORMS) {
      completeKit[platform] = cleanText(existingKit[platform]) || cleanText(fallbackKit[platform]);
    }

    blog.socialKit = {
      ...existingKit,
      ...completeKit,
      status: "ready",
      source: "fallback",
      error: String(error.message || error).slice(0, 500),
      updatedAt: new Date(),
    };
    await blog.save().catch(() => {});
    return blog.socialKit;
  }
}
