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
  const values = [blog.focusKeyword, blog.category, ...(blog.tags || []), "WebDevelopment", "WebEngineering", "MuhyoTech"]
    .map((value) => cleanText(value).replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);
  return [...new Set(values)].slice(0, limit).map((value) => `#${value}`).join(" ");
};

const firstLine = (value = "") => String(value).split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "";
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
  const unsafeStyle = /\bever wonder\b|\bdid you know\b|\bin today'?s digital world\b|\bkey takeaways\b|\bsearch engines? (?:will )?reward\b|\bboost(?:ing)? (?:your )?(?:rankings?|ctr)\b|\bguaranteed?\b|\b100%\b|\bskyrocket\b|\bgame[- ]changer\b|\blet'?s talk\b|\bclick here\b|\bunlock(?:ing)? the power\b|\brevolutioni[sz]e\b|\bdelve\b/i;
  const hardWording = /\b(?:utili[sz]e|leverage|facilitate|synergy|paradigm|multifaceted|holistic|cutting[- ]edge|state[- ]of[- ]the[- ]art|seamless(?:ly)?|robust|transformative|groundbreaking|unprecedented|intricacies|aforementioned|in order to|it is important to note|navigate the complexities|ever[- ]evolving landscape)\b/i;
  const limits = { linkedin: [650, 1800], facebook: [500, 1400], x: [45, 280], whatsapp: [220, 650], reddit: [650, 2000], instagram: [550, 1600] };
  const wordLimits = { linkedin: [100, 260], facebook: [80, 210], x: [7, 45], whatsapp: [35, 110], reddit: [100, 300], instagram: [90, 240] };
  const hashtagLimits = { linkedin: [3, 5], facebook: [0, 3], x: [0, 2], whatsapp: [0, 0], reddit: [0, 0], instagram: [3, 8] };
  const hooks = [];

  for (const [platform, value] of Object.entries(kit)) {
    if (!limits[platform]) continue;
    const text = String(value || "").trim();
    const hook = firstLine(text);
    const hookWords = cleanText(hook).split(/\s+/).filter(Boolean).length;
    const editorialText = text.replace(url, " ");
    const normalizedHook = cleanText(hook).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const [minimum, maximum] = limits[platform];
    const [minimumWords, maximumWords] = wordLimits[platform];
    const [minimumTags, maximumTags] = hashtagLimits[platform];
    if (text.length < minimum || text.length > maximum) throw new Error(`${platform} post length is outside the professional platform limit.`);
    if (hook.length < 24 || hook.length > 170 || hookWords < 6 || hookWords > 22 || /https?:\/\/|#|\?/.test(hook)) throw new Error(`${platform} needs a concise standalone first-line hook.`);
    if (normalizedHook === titleFingerprint || unsafeStyle.test(editorialText)) throw new Error(`${platform} uses a weak, generic, or unsupported social formula.`);
    if (hardWording.test(editorialText)) throw new Error(`${platform} uses difficult corporate or AI-style wording instead of plain language.`);
    if (/!!!|\?\?\?|\.{4,}|<[^>]+>|\[link\]|\{\{/.test(text) || /\p{Extended_Pictographic}/u.test(text)) throw new Error(`${platform} contains embarrassing formatting, emoji, or unresolved markup.`);
    if (urlCount(text, url) !== 1) throw new Error(`${platform} must contain the canonical article URL exactly once.`);
    const tags = hashtagCount(text);
    if (tags < minimumTags || tags > maximumTags) throw new Error(`${platform} has an unprofessional hashtag count.`);
    const unsupportedNumbers = (editorialText.match(/\b\d+(?:\.\d+)?%?\b/g) || []).filter((number) => !source.includes(number));
    if (unsupportedNumbers.length) throw new Error(`${platform} contains a numeric claim not found in the article.`);
    const prose = editorialText.replace(/#[a-z0-9_]+/gi, " ");
    const proseWordCount = cleanText(prose).split(/\s+/).filter(Boolean).length;
    if (proseWordCount < minimumWords || proseWordCount > maximumWords) throw new Error(`${platform} must explain the article clearly without being too short or too long.`);
    const longSentence = prose.split(/[.!?\n]+/).some((sentence) => cleanText(sentence).split(/\s+/).filter(Boolean).length > 30);
    if (longSentence) throw new Error(`${platform} contains a sentence that is too long for easy social reading.`);
    hooks.push(normalizedHook);
  }

  if (new Set(hooks).size !== hooks.length) throw new Error("Platform posts repeat the same opening hook.");
  return kit;
}

export function validateShareReadySocialKit(kit, blog) {
  return validateShareReadyKit(kit, blog);
}

function createFallbackKit(blog) {
  const url = blogUrl(blog);
  const title = plainFallbackText(blog.title);
  const topic = plainFallbackText(blog.focusKeyword || blog.category || "professional web development").slice(0, 70);
  const sourceSummary = plainFallbackText(blog.summary || blog.seoDescription || blog.content).slice(0, 430);
  const linkedinHook = `${topic} works better when the build choices are clear from the start.`;
  const facebookHook = `Clear ${topic} choices can make a web project easier to use and maintain.`;
  const xHook = `Good ${topic} work keeps every build choice tied to the real goal.`;
  const whatsappHook = `A new practical guide explains the key choices behind ${topic}.`;
  const redditHook = `${topic} raises a useful question about how web projects are planned and built.`;
  const instagramHook = `Better ${topic} starts with clear choices people can understand.`;
  const tags = hashtags(blog);
  const linkedin = `${linkedinHook}\n\n${sourceSummary}\n\nThe article, “${title},” connects this lesson to the choices teams make while planning and building a web project. It explains the practical value without hiding the tradeoffs or filling the post with hard technical language.\n\nThe full guide gives the remaining context, examples, and steps.\n\nRead the practical guide: ${url}\n\n${tags}`.trim();
  const facebook = `${facebookHook}\n\n${sourceSummary}\n\nMuhyo Tech's article, “${title},” explains why this issue deserves attention and how clearer build choices can help. The post gives the main lesson, while the full article provides the context and practical details needed to use it well.\n\nRead the complete article: ${url}\n\n${hashtags(blog, 3)}`.trim();
  const xBase = `${xHook}\n\n${url} ${hashtags(blog, 2)}`;
  const x = xBase.length <= 280 ? xBase : `${cleanText(xHook).slice(0, 120)}\n\n${url} #MuhyoTech`;
  const whatsapp = `${whatsappHook}\n\n${sourceSummary.slice(0, 230)}\n\nThe article explains what matters, why it matters, and how the idea fits a real web project.\n\n${title}\n${url}`;
  const reddit = `${redditHook}\n\n${sourceSummary}\n\nMuhyo Tech's article, “${title},” looks at the problem, the choices behind it, and the practical effect those choices can have on a web project. This summary shares the central lesson without making sales claims or pretending there is one answer for every project.\n\nThe full article includes the context and details that cannot fit into one post.\n\nRead it here: ${url}`;
  const instagram = `${instagramHook}\n\n${sourceSummary}\n\nThe Muhyo Tech guide, “${title},” explains the central lesson in simple terms. It shows why the topic matters and which practical choices need attention, without turning the caption into the full article.\n\nRead the guide for the complete context and steps: ${url}\n\n${hashtags(blog, 6)}`;
  const kit = { linkedin, facebook, x, whatsapp, reddit, instagram };
  validateShareReadyKit(kit, blog);
  return { ...kit, source: "fallback" };
}

function parseKit(response, blog) {
  const parsed = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  const required = ["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram"];
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

Reject if any post contains an invented fact, result, statistic, client experience, ranking promise, awkward or embarrassing wording, generic AI hook, unnecessary jargon, clickbait, excessive sales language, misleading simplification, or a claim stronger than the source. Also reject if the post is dull, unclear, repetitive, too short to explain the article's useful lesson, or so long that it replaces the article. The first non-empty line of every post must be an article-specific hook that creates immediate interest without clickbait, and all opening hooks must be distinct. Reject corporate words or AI-style language when a common short word would work. Technical terms must be necessary, limited, and explained in plain language. Sentences should be short enough to understand on the first read.

Return strict JSON only: {"approved":true,"issues":[],"revisionDirection":""}`, {
    temperature: 0.05,
    responseMimeType: "application/json",
    maxOutputTokens: 700,
    thinkingBudget: 0,
    timeoutMs: Math.max(20000, Number(process.env.AI_SOCIAL_REVIEW_TIMEOUT_MS) || 30000),
  });
  const review = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  return {
    approved: review.approved === true && Array.isArray(review.issues) && review.issues.length === 0,
    direction: cleanText(review.revisionDirection || (review.issues || []).join("; ")).slice(0, 500),
  };
}

export async function buildSocialKit(blog, { useAI = true, feedback = "" } = {}) {
  const fallback = createFallbackKit(blog);
  if (!useAI || !hasConfiguredGeminiKey()) return fallback;

  const prompt = `Create a professional, human social sharing kit for this Muhyo Tech web-development article.
Title: ${blog.title}
Summary: ${cleanText(blog.summary)}
Article type: ${blog.articleType || "supporting"}
Category: ${blog.category || "Web Development"}
Focus keyword: ${blog.focusKeyword || ""}
Article extract: ${cleanText(blog.content).slice(0, blog.articleType === "pillar" ? 10000 : 6500)}
Canonical URL: ${blogUrl(blog)}
${feedback ? `Editor direction: ${cleanText(feedback).slice(0, 300)}` : ""}

Write six distinct posts:
- linkedin: 110-220 words and at least 650 characters. Write like an experienced web developer sharing one useful lesson from the article. Use 4-6 short paragraphs and explain the problem, practical idea, tradeoff, and reader benefit without retelling everything. End with a simple invitation to read, URL, and 3-5 relevant hashtags.
- facebook: 90-170 words and at least 500 characters. Conversational and accessible. Explain the article's main problem, core lesson, and practical value with enough context to stand on its own, then include a simple read-more CTA, URL, and no more than 3 hashtags.
- x: maximum 280 characters including URL, one clear insight, no more than 2 hashtags.
- whatsapp: 40-90 words and at least 220 characters, natural, no hashtags. Explain the useful takeaway briefly, then give the title and URL.
- reddit: 110-220 words and at least 650 characters, useful and community-minded, no hashtags and no sales pitch. Explain the problem, the article's approach, an important tradeoff, and what readers can learn before including the URL.
- instagram: 100-190 words and at least 550 characters, easy to scan, with a strong first line and short paragraphs. Explain the central lesson, practical value, and one useful detail, then include the URL and 3-8 relevant hashtags. Do not depend on the link being clickable.

EDITORIAL RULES:
- The FIRST non-empty line is the hook. It must be 8-18 words, article-specific, immediately interesting, understandable without context, and must not simply repeat the title.
- Give each platform a different opening hook. Prefer a sharp observation, consequence, contrast, overlooked mistake, or practical tension supported by the article.
- The hook must not contain a URL, hashtag, greeting, emoji, exaggerated promise, or empty question.
- Do not start with "Ever wonder", "Did you know", "In today's digital world", or another generic AI hook.
- Do not force "At Muhyo Tech" into every post. Mention Muhyo Tech naturally at most once when it adds context.
- Do not repeat the article as a numbered summary by default. Select one strong lesson and make the reader curious about the full explanation.
- Technical names such as Schema.org, JSON-LD, APIs, frameworks, or standards may appear only when essential to the article's central lesson, and should be explained in plain language. Do not stack jargon or put unnecessary tool names in parentheses.
- Avoid claims such as "Google will reward this", "boost rankings", "improve CTR", "fully understood", or "guaranteed discovery" unless the article contains verified evidence. Prefer accurate language such as "helps search engines interpret the page" or "can make eligible content available for enhanced search features".
- Do not use a sales-call CTA such as "let's talk" unless the article is explicitly commercial. Default CTA: invite the reader to read the full practical guide.
- Keep paragraphs short, remove filler, avoid emojis unless specifically requested, and make each platform version feel independently written.
- Use everyday English that a business owner can understand on the first read. Prefer "use" over "utilize", "help" over "facilitate", "use" or "build on" over "leverage", and direct verbs over corporate phrases.
- Keep each sentence under 30 words. Use only one necessary technical idea at a time and explain it with familiar words.
- Never invent clients, rankings, traffic, revenue, percentages, results, awards, partnerships, or personal experience not stated in the article.
- Avoid clickbait, motivational filler, repetitive formulas, and generic AI phrases.

Return strict JSON only: {"linkedin":"","facebook":"","x":"","whatsapp":"","reddit":"","instagram":""}`;

  const generateCandidate = async () => {
    const response = await generateGeminiResponse(prompt, {
      temperature: 0.65,
      responseMimeType: "application/json",
      maxOutputTokens: 1800,
      thinkingBudget: 0,
      timeoutMs: Math.max(30000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 45000),
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
        timeoutMs: Math.max(30000, Number(process.env.AI_SOCIAL_TIMEOUT_MS) || 45000),
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
      reddit: kit.reddit,
      instagram: kit.instagram,
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
