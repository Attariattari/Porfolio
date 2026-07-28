import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { generateGeminiResponse } from "@/lib/geminiService";
import { SITE_URL } from "@/lib/config";
import { cacheManager } from "@/lib/cache";

const cleanText = (value = "") => String(value)
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const blogUrl = (blog) => `${SITE_URL}/blog/${blog.slug}`;
const imageUrl = (blog) => blog.featuredImage?.url || blog.image || "";
const hashtags = (blog, limit = 4) => {
  const values = [blog.focusKeyword, ...(blog.tags || []), "MuhyoTech"]
    .map((value) => cleanText(value).replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);
  return [...new Set(values)].slice(0, limit).map((value) => `#${value}`).join(" ");
};

function createFallbackKit(blog) {
  const url = blogUrl(blog);
  const summary = cleanText(blog.summary || blog.seoDescription || blog.content).slice(0, 240);
  const tags = hashtags(blog);
  const linkedin = `${blog.title}\n\n${summary}\n\nThe full Muhyo Tech article explores the idea in context and explains what it means for modern web projects.\n\nRead the article: ${url}\n\n${tags}`.trim();
  const facebook = `${blog.title}\n\n${summary}\n\nExplore the complete article from Muhyo Tech: ${url}\n\n${hashtags(blog, 3)}`.trim();
  const xBase = `${blog.title}\n\n${summary.slice(0, 90)}\n\n${url} ${hashtags(blog, 2)}`;
  const x = xBase.length <= 280 ? xBase : `${cleanText(blog.title).slice(0, 100)}\n\n${url} ${hashtags(blog, 2)}`;
  const whatsapp = `New from Muhyo Tech: ${blog.title}\n\n${summary.slice(0, 150)}\n\nRead here: ${url}`;
  return { linkedin, facebook, x, whatsapp, source: "fallback" };
}

function parseKit(response, blog) {
  const parsed = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  const required = ["linkedin", "facebook", "x", "whatsapp"];
  if (required.some((key) => !cleanText(parsed[key]))) throw new Error("Social response is incomplete.");
  const url = blogUrl(blog);
  const kit = Object.fromEntries(required.map((key) => {
    let value = String(parsed[key]).trim();
    if (!value.includes(url)) value = `${value}\n\n${url}`;
    return [key, value];
  }));
  const unsafeStyle = /\bever wonder\b|\bdid you know\b|\bin today'?s digital world\b|\bkey takeaways\b|\bsearch engines? (?:will )?reward\b|\bboost(?:ing)? (?:your )?(?:rankings?|ctr)\b|\bguaranteed?\b|\b100%\b|\bskyrocket\b|\bgame[- ]changer\b|\blet'?s talk\b|\bclick here\b/i;
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
  return { ...kit, source: "ai" };
}

async function reviewSocialKit(kit, blog) {
  const response = await generateGeminiResponse(`Act as a strict senior social editor for Muhyo Tech. Verify these posts against the source article.

SOURCE TITLE: ${blog.title}
SOURCE SUMMARY: ${cleanText(blog.summary || blog.seoDescription)}
SOURCE EXTRACT: ${cleanText(blog.content).slice(0, 14000)}

POSTS:
${JSON.stringify(kit)}

Reject if any post contains an invented fact, result, statistic, client experience, ranking promise, awkward or embarrassing wording, generic AI hook, unnecessary jargon, clickbait, excessive sales language, misleading simplification, or a claim stronger than the source. Also reject if the post is dull, unclear, repetitive, or fails to give a relevant reason to read the article. Technical terms must be necessary and understandable in context.

Return strict JSON only: {"approved":true,"issues":[],"revisionDirection":""}`, {
    temperature: 0.05,
    responseMimeType: "application/json",
    maxOutputTokens: 700,
    thinkingBudget: 0,
    timeoutMs: Number(process.env.AI_SOCIAL_REVIEW_TIMEOUT_MS || 9000),
  });
  const review = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  return {
    approved: review.approved === true && Array.isArray(review.issues) && review.issues.length === 0,
    direction: cleanText(review.revisionDirection || (review.issues || []).join("; ")).slice(0, 500),
  };
}

export async function buildSocialKit(blog, { useAI = true, feedback = "" } = {}) {
  const fallback = createFallbackKit(blog);
  if (!useAI || !process.env.GEMINI_API_KEY) return fallback;

  const prompt = `Create a professional, human social sharing kit for this Muhyo Tech web-development article.
Title: ${blog.title}
Summary: ${cleanText(blog.summary)}
Article type: ${blog.articleType || "supporting"}
Category: ${blog.category || "Web Development"}
Focus keyword: ${blog.focusKeyword || ""}
Article extract: ${cleanText(blog.content).slice(0, blog.articleType === "pillar" ? 10000 : 6500)}
Canonical URL: ${blogUrl(blog)}
${feedback ? `Editor direction: ${cleanText(feedback).slice(0, 300)}` : ""}

Write four distinct posts:
- linkedin: write like an experienced web developer sharing one useful lesson. Use a natural observation or direct statement, 2-4 short paragraphs, and bullets only when they genuinely improve clarity. End with a simple invitation to read the article, URL, and 3-5 relevant hashtags.
- facebook: conversational and accessible, explain the practical value without turning it into a technical checklist, then include a simple read-more CTA, URL, and no more than 3 hashtags.
- x: maximum 280 characters including URL, one clear insight, no more than 2 hashtags.
- whatsapp: short, natural, no hashtags, title/benefit and URL.

EDITORIAL RULES:
- Do not start with "Ever wonder", "Did you know", "In today's digital world", or another generic AI hook.
- Do not force "At Muhyo Tech" into every post. Mention Muhyo Tech naturally at most once when it adds context.
- Do not repeat the article as a numbered summary by default. Select one strong lesson and make the reader curious about the full explanation.
- Technical names such as Schema.org, JSON-LD, APIs, frameworks, or standards may appear only when essential to the article's central lesson, and should be explained in plain language. Do not stack jargon or put unnecessary tool names in parentheses.
- Avoid claims such as "Google will reward this", "boost rankings", "improve CTR", "fully understood", or "guaranteed discovery" unless the article contains verified evidence. Prefer accurate language such as "helps search engines interpret the page" or "can make eligible content available for enhanced search features".
- Do not use a sales-call CTA such as "let's talk" unless the article is explicitly commercial. Default CTA: invite the reader to read the full practical guide.
- Keep paragraphs short, remove filler, avoid emojis unless specifically requested, and make each platform version feel independently written.
- Never invent clients, rankings, traffic, revenue, percentages, results, awards, partnerships, or personal experience not stated in the article.
- Avoid clickbait, motivational filler, repetitive formulas, and generic AI phrases.

Return strict JSON only: {"linkedin":"","facebook":"","x":"","whatsapp":""}`;

  const generateCandidate = async () => {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.65,
      responseMimeType: "application/json",
      maxOutputTokens: 1800,
      thinkingBudget: 0,
      timeoutMs: Number(process.env.AI_SOCIAL_TIMEOUT_MS || 9000),
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
        timeoutMs: Number(process.env.AI_SOCIAL_TIMEOUT_MS || 9000),
      });
      candidate = parseKit(correctedResponse, blog);
      review = await reviewSocialKit(candidate, blog);
    }

    if (!review.approved) throw new Error(`Editorial review rejected the social kit: ${review.direction || "quality standard not met"}`);
    return candidate;
  } catch (error) {
    console.warn("[SocialKit] AI generation unavailable; using safe fallback.", error.message);
    return { ...fallback, error: error.message };
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
    blog.socialKit = {
      status: "ready",
      linkedin: kit.linkedin,
      facebook: kit.facebook,
      x: kit.x,
      whatsapp: kit.whatsapp,
      imageUrl: imageUrl(blog),
      source: kit.source,
      generatedAt: new Date(),
      updatedAt: new Date(),
      error: kit.error || "",
    };
    await blog.save();
    await cacheManager.invalidateByTag("blogs");
    return blog.socialKit;
  } catch (error) {
    blog.socialKit.status = "failed";
    blog.socialKit.error = String(error.message || error).slice(0, 500);
    blog.socialKit.updatedAt = new Date();
    await blog.save().catch(() => {});
    throw error;
  }
}
