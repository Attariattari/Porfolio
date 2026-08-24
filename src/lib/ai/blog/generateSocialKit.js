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
  const limits = { linkedin: [350, 2500], facebook: [250, 1800], x: [100, 280], whatsapp: [120, 900], reddit: [350, 2600], instagram: [300, 2000], devto: [350, 2800] };
  const wordLimits = { linkedin: [50, 350], facebook: [35, 250], x: [12, 70], whatsapp: [15, 140], reddit: [50, 380], instagram: [40, 300], devto: [50, 420] };
  const hashtagLimits = { linkedin: [2, 6], facebook: [0, 4], x: [0, 3], whatsapp: [0, 0], reddit: [0, 0], instagram: [2, 10], devto: [1, 6] };
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
    if (hook.length < 10 || hook.length > 200 || hookWords < 2 || hookWords > 30 || /https?:\/\/|#/.test(hook)) throw new Error(`${platform} needs a concise standalone first-line hook.`);
    if (firstAlphabet && firstAlphabet !== firstAlphabet.toUpperCase()) throw new Error(`${platform} must start with a capital letter.`);
    if (normalizedHook === titleFingerprint || unsafeStyle.test(editorialText)) throw new Error(`${platform} uses a weak, generic, or unsupported social formula.`);
    if (hardWording.test(editorialText)) throw new Error(`${platform} uses difficult corporate or AI-style wording instead of plain language.`);
    if (/!!!|\?\?\?|\.{4,}|<[^>]+>|\[link\]|\{\{/.test(text)) throw new Error(`${platform} contains invalid markup or unresolved placeholders.`);
    if (urlCount(text, url) !== 1) throw new Error(`${platform} must contain the canonical article URL exactly once.`);
    const tags = hashtagCount(text);
    if (tags < minimumTags || tags > maximumTags) throw new Error(`${platform} has an unprofessional hashtag count (${tags}).`);
    const prose = editorialText.replace(/#[a-z0-9_]+/gi, " ");
    const proseWordCount = cleanText(prose).split(/\s+/).filter(Boolean).length;
    if (proseWordCount < minimumWords || proseWordCount > maximumWords) throw new Error(`${platform} word count (${proseWordCount}) is outside limit [${minimumWords}, ${maximumWords}].`);
    hooks.push(normalizedHook);
  }

  return kit;
}

export function validateShareReadySocialKit(kit, blog) {
  return validateShareReadyKit(kit, blog);
}

function createFallbackKit(blog) {
  const url = blogUrl(blog);
  const title = plainFallbackText(blog.title);
  const topic = plainFallbackText(blog.focusKeyword || blog.category || "Professional Web Development").slice(0, 70);
  const sourceSummary = easyExcerpt(blog.summary || blog.seoDescription || blog.content, 260);
  const tags = hashtags(blog);

  const linkedin = `🎯 ${topic}: Scaling Architecture & Production Best Practices

${sourceSummary}

⚡ Key Engineering Takeaways:
• 🔹 Architectural Clarity: Plan data flow and system boundaries before writing code.
• 🔹 Production Reliability: Mitigate performance bottlenecks and edge cases early.
• 🔹 Measurable Impact: Connect build decisions directly to system stability and speed.

🛠️ The Recommended Approach:
• Follow clean separation of concerns and robust error boundaries.
• Implement automated end-to-end and performance regression tests.

💡 Pro Tip:
Simplicity and maintainability always outperform over-engineering in high-scale systems.

---
📖 Read the full in-depth engineering blueprint here:
👉 ${url}

${tags}`;

  const facebook = `🚀 ${topic}: Production Guide for Modern Web Systems

${sourceSummary}

⚡ What You'll Learn:
• 🔹 Core architecture decisions and engineering tradeoffs
• 🔹 Step-by-step implementation guide for high performance
• 🔹 Key pitfalls to avoid in production deployments

---
📖 Read the full article here:
👉 ${url}

${hashtags(blog, 3)}`;

  const x = `🎯 ${topic}: Why Architecture Choices Matter

⚡ Key Lessons:
• 🔹 Plan data flow & system design early
• 🔹 Prioritize production stability & speed

📖 Full Guide: ${url}
${hashtags(blog, 2)}`.slice(0, 280);

  const whatsapp = `*🎯 ${topic}: Production Engineering Guide*

${sourceSummary}

*⚡ Key Highlights:*
• 🔹 Core architecture and performance solutions
• 🔹 Production-tested implementation steps
• 🔹 Measurable stability and speed gains

*📖 Read the Complete Guide:*
👉 ${title}
${url}`;

  const reddit = `**${topic}: Architectural Tradeoffs and Production Lessons**

${sourceSummary}

**Key Technical Discussion Points:**
* Architectural boundaries and database query optimization
* Avoiding common performance pitfalls in production
* Maintainable design patterns for scaling teams

What strategies have you found most effective when tackling this in production?

---
📖 Full technical write-up & architecture diagrams:
${url}`;

  const instagram = `🎯 ${topic} Explained Simply

${sourceSummary}

⚡ Key Takeaways:
• 🔹 1. Plan structure and data flow before coding
• 🔹 2. Focus on speed, scalability and maintainability
• 🔹 3. Profile memory and test edge cases early

---
📖 Read the complete master guide (Link in Bio):
👉 ${url}

${hashtags(blog, 6)}`;

  const devto = `## 🎯 ${topic}: Deep Dive into Production Architecture

${sourceSummary}

### ⚡ TL;DR & Key Takeaways
- **Architecture Strategy:** Define clean boundaries and data flow before scaling.
- **Performance:** Optimize database queries and caching layers.
- **Production Readiness:** Implement automated health checks and monitoring.

---
📖 Check out the full comprehensive guide with code snippets:
👉 ${url}

${hashtags(blog, 4)}`;

  const kit = { linkedin, facebook, x, whatsapp, reddit, instagram, devto };
  return { ...kit, source: "fallback" };
}

function createSafeFallbackKit(blog) {
  try {
    return createFallbackKit(blog);
  } catch (error) {
    console.warn("[SocialKit] Fallback generation note:", error.message);
    return createFallbackKit(blog);
  }
}

function parseKit(response, blog) {
  const parsed = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  const required = SOCIAL_PLATFORMS;
  if (required.some((key) => !String(parsed[key] || "").trim())) throw new Error("Social response is incomplete.");
  const url = blogUrl(blog);
  const kit = Object.fromEntries(required.map((key) => {
    let value = String(parsed[key] || "").trim();
    if (!value.includes(url)) value = `${value}\n\n${url}`;
    return [key, value];
  }));
  validateShareReadyKit(kit, blog);
  return { ...kit, source: "ai" };
}

async function reviewSocialKit(kit, blog) {
  try {
    const response = await generateGeminiResponse(`Act as a senior social editor for Muhyo Tech. Verify these posts against the source article.

SOURCE TITLE: ${blog.title}
SOURCE SUMMARY: ${cleanText(blog.summary || blog.seoDescription)}
SOURCE EXTRACT: ${cleanText(blog.content).slice(0, 10000)}

POSTS:
${JSON.stringify(kit)}

Check that posts are well-formatted with clean bullet points and line breaks. Verify factual claims without rejecting minor stylistic phrasing.

Return strict JSON only: {"approved":true,"issues":[],"revisionDirection":""}`, {
      temperature: 0.1,
      responseMimeType: "application/json",
      maxOutputTokens: 600,
      thinkingBudget: 0,
      timeoutMs: 10000,
    });
    const review = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
    return {
      approved: review.approved === true || !Array.isArray(review.issues) || review.issues.length === 0,
      direction: cleanText(review.revisionDirection || (review.issues || []).join("; ")).slice(0, 500),
    };
  } catch {
    return { approved: true, direction: "" };
  }
}

export async function buildSocialKit(blog, { useAI = true, feedback = "" } = {}) {
  if (!useAI || !hasConfiguredGeminiKey()) return createSafeFallbackKit(blog);

  const prompt = `Create a professional, modern, scannable point-wise social sharing kit for this Muhyo Tech web-development article.

Title: ${blog.title}
Summary: ${cleanText(blog.summary)}
Article type: ${blog.articleType || "supporting"}
Category: ${blog.category || "Web Development"}
Focus keyword: ${blog.focusKeyword || ""}
Article extract: ${cleanText(blog.content).slice(0, 6000)}
Canonical URL: ${blogUrl(blog)}
${feedback ? `Editor direction: ${cleanText(feedback).slice(0, 300)}` : ""}

FORMATTING RULE: Use structured point-wise bullet points (• 🔹) and line breaks. Do NOT merge text into one dense block.

Write seven distinct posts:
- linkedin: Format with:
  🎯 [Hook Title]
  
  [1-2 sentences core context]
  
  ⚡ Key Engineering Takeaways:
  • 🔹 [Bullet 1: Specific architectural insight]
  • 🔹 [Bullet 2: Production implementation solution]
  • 🔹 [Bullet 3: Measurable outcome or stability benefit]
  
  🛠️ The Recommended Approach:
  • [Bullet 1: Framework / Tech stack choice]
  • [Bullet 2: Key best practice]
  
  💡 Pro Tip:
  [1-sentence actionable tip]
  
  ---
  📖 Read the full in-depth engineering blueprint here:
  👉 ${blogUrl(blog)}
  
  [3-5 relevant hashtags]

- facebook: Format with:
  🚀 [Catchy Hook Title]
  
  [Short context]
  
  ⚡ What You'll Learn:
  • 🔹 [Point 1]
  • 🔹 [Point 2]
  • 🔹 [Point 3]
  
  ---
  📖 Read the complete article:
  👉 ${blogUrl(blog)}
  
  [1-3 hashtags]

- x: Strictly 160-280 characters. Format with:
  🎯 [Hook Line]
  
  ⚡ Key Takeaways:
  • 🔹 [Point 1]
  • 🔹 [Point 2]
  
  📖 Full Guide: ${blogUrl(blog)} [1-2 hashtags]

- whatsapp: Formatted with clean bold headings (*Topic:*, *Key Highlights:*, *Read Guide:*), 2-3 bullet points, and canonical URL.

- reddit: Formatted in Markdown for developer subreddits with **bold headings**, bullet points (*), and canonical URL.

- instagram: Carousel-style caption with hook, 3-4 bullet takeaways (• 🔹), Link in Bio CTA, and 3-8 hashtags.

- devto: Technical Markdown write-up with ## Heading, ⚡ TL;DR Bullets, and full canonical URL.

Return strict JSON only: {"linkedin":"","facebook":"","x":"","whatsapp":"","reddit":"","instagram":"","devto":""}`;

  const generateCandidate = async () => {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.6,
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
      thinkingBudget: 0,
      timeoutMs: Math.min(25000, Math.max(10000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 25000)),
    });
    return parseKit(response, blog);
  };

  try {
    let candidate = await generateCandidate();
    let review = await reviewSocialKit(candidate, blog);

    if (!review.approved) {
      const correctedPrompt = `${prompt}\n\nMANDATORY REVIEW CORRECTIONS: ${review.direction || "Ensure clear bullet points and line breaks."}`;
      const correctedResponse = await generateGeminiResponse(correctedPrompt, {
        temperature: 0.4,
        responseMimeType: "application/json",
        maxOutputTokens: 2000,
        thinkingBudget: 0,
        timeoutMs: Math.min(25000, Math.max(10000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 25000)),
      });
      candidate = parseKit(correctedResponse, blog);
    }

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

    // Ensure every single platform is populated with line breaks preserved (NO cleanText stripping)
    const completeKit = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const generatedPost = typeof kit[platform] === "string" ? kit[platform].trim() : "";
      const existingPost = typeof existingKit[platform] === "string" ? existingKit[platform].trim() : "";
      const fallbackPost = typeof fallbackKit[platform] === "string" ? fallbackKit[platform].trim() : "";

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
    
    const completeKit = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const existingPost = typeof existingKit[platform] === "string" ? existingKit[platform].trim() : "";
      const fallbackPost = typeof fallbackKit[platform] === "string" ? fallbackKit[platform].trim() : "";
      completeKit[platform] = existingPost || fallbackPost;
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
