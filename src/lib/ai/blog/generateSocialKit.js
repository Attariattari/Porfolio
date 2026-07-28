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
  const linkedin = `${blog.title}\n\n${summary}\n\nIn this Muhyo Tech article, we break the topic down into practical decisions, common mistakes, and useful next steps for modern web projects.\n\nRead the full article: ${url}\n\n${tags}`.trim();
  const facebook = `${blog.title}\n\n${summary}\n\nRead the full practical guide from Muhyo Tech: ${url}\n\n${hashtags(blog, 3)}`.trim();
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
  if (kit.x.length > 280) kit.x = createFallbackKit(blog).x;
  return { ...kit, source: "ai" };
}

export async function buildSocialKit(blog, { useAI = true, feedback = "" } = {}) {
  const fallback = createFallbackKit(blog);
  if (!useAI || !process.env.GEMINI_API_KEY) return fallback;

  const prompt = `Create a professional social sharing kit for this Muhyo Tech web-development article.
Title: ${blog.title}
Summary: ${cleanText(blog.summary)}
Article type: ${blog.articleType || "supporting"}
Category: ${blog.category || "Web Development"}
Focus keyword: ${blog.focusKeyword || ""}
Article extract: ${cleanText(blog.content).slice(0, 4500)}
Canonical URL: ${blogUrl(blog)}
${feedback ? `Editor direction: ${cleanText(feedback).slice(0, 300)}` : ""}

Write four distinct posts:
- linkedin: thoughtful professional hook, useful insight, 3-5 concise takeaways where natural, Muhyo Tech perspective, CTA, URL, 3-5 relevant hashtags.
- facebook: conversational, useful summary, CTA, URL, no more than 3 hashtags.
- x: maximum 280 characters including URL, one clear insight, no more than 2 hashtags.
- whatsapp: short, natural, no hashtags, title/benefit and URL.

Never invent clients, rankings, traffic, revenue, percentages, results, awards, partnerships, or personal experience not stated in the article. Avoid clickbait and generic AI phrases. Return strict JSON only: {"linkedin":"","facebook":"","x":"","whatsapp":""}`;

  try {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.65,
      responseMimeType: "application/json",
      maxOutputTokens: 1800,
      thinkingBudget: 0,
      timeoutMs: Number(process.env.AI_SOCIAL_TIMEOUT_MS || 9000),
    });
    return parseKit(response, blog);
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
