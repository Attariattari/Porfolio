import dbConnect from "@/lib/dbConnect";
import { cacheManager } from "@/lib/cache";
import { Blog } from "@/models/Portfolio";
import { InternalLinkSuggestion } from "@/models/InternalLinkSuggestion";
import { generateGeminiResponse } from "@/lib/geminiService";

const STOP_WORDS = new Set(["and", "are", "for", "from", "how", "into", "the", "that", "this", "with", "your", "website", "web", "guide"]);
const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
const publishedQuery = { publishStatus: "published" };
const MIN_CONTEXTUAL_CONFIDENCE = 0.78;
const MIN_CLUSTER_CONFIDENCE = 0.82;
const LINK_LIMITS = { supporting: 5, pillar: 10 };
const MAX_AUTOMATIC_AI_PLACEMENTS = 2;
const STRICT_BLOG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeBlogSlug(value = "") {
  let slug = String(value || "").trim().replace(/^\/+|\/+$/g, "");
  try { slug = decodeURIComponent(slug); } catch { return ""; }
  return STRICT_BLOG_SLUG.test(slug) ? slug : "";
}

function blogLinkSlugs(content = "") {
  return [...String(content).matchAll(/href=["']\/blog\/([^"'#?]+)(?:[?#][^"']*)?["']/gi)]
    .map((match) => normalizeBlogSlug(match[1]));
}

async function validateLinkTargetIdentity(suggestion, source, target) {
  const sourceSlug = normalizeBlogSlug(source?.slug);
  const targetSlug = normalizeBlogSlug(target?.slug);
  if (!sourceSlug || !targetSlug) return "Source or target has an invalid canonical slug.";
  if (normalizeBlogSlug(suggestion.sourceSlug) !== sourceSlug) return "Suggestion source slug does not match its source article.";
  if (normalizeBlogSlug(suggestion.targetSlug) !== targetSlug) return "Suggestion target slug does not match its target article. Run a fresh audit.";
  const targetStillExists = await Blog.exists({ _id: suggestion.targetBlogId, slug: targetSlug, ...publishedQuery });
  if (!targetStillExists) return "The exact target slug is no longer published. Run a fresh audit.";
  return null;
}

async function validateFinalBlogLinks(previousContent, nextContent, expectedTargetSlug) {
  const before = blogLinkSlugs(previousContent);
  const after = blogLinkSlugs(nextContent);
  if (after.includes("")) return "The proposed article contains a malformed blog slug.";
  const added = [...new Set(after.filter((slug) => !before.includes(slug)))];
  if (added.length !== 1 || added[0] !== expectedTargetSlug) {
    return "Apply was blocked because the generated link does not point to the exact approved target slug.";
  }
  const uniqueSlugs = [...new Set(after)];
  const published = uniqueSlugs.length
    ? await Blog.find({ slug: { $in: uniqueSlugs }, ...publishedQuery }).select("slug").lean()
    : [];
  const publishedSlugs = new Set(published.map((blog) => normalizeBlogSlug(blog.slug)));
  const missing = uniqueSlugs.filter((slug) => !publishedSlugs.has(slug));
  return missing.length ? `Apply was blocked because these blog slugs are not published: ${missing.join(", ")}.` : null;
}

function tokens(blog = {}) {
  return new Set(
    [blog.title, blog.summary, blog.focusKeyword, blog.category, ...(blog.tags || [])]
      .filter(Boolean).join(" ").toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

const isAuthorityArticle = (articleType) => ["pillar", "standalone_authority", "verified_trend"].includes(articleType);

function candidateScore(source, target) {
  const left = tokens(source);
  const right = tokens(target);
  const overlap = [...left].filter((token) => right.has(token)).length;
  const semantic = overlap / Math.max(1, new Set([...left, ...right]).size);
  const sameCluster = Boolean(source.clusterKey && source.clusterKey === target.clusterKey);
  const parentRelation = String(source.parentPillarBlogId || "") === String(target._id) || String(target.parentPillarBlogId || "") === String(source._id);
  const sameCategory = source.category && String(source.category).toLowerCase() === String(target.category || "").toLowerCase();
  return Math.min(0.99, semantic * 1.8 + Number(sameCategory) * 0.12 + Number(sameCluster) * 0.35 + Number(parentRelation) * 0.45);
}

function relationship(source, target) {
  if (String(source.parentPillarBlogId || "") === String(target._id)) return "supporting_to_pillar";
  if (String(target.parentPillarBlogId || "") === String(source._id)) return "pillar_to_supporting";
  if (source.clusterKey && source.clusterKey === target.clusterKey) return "same_cluster";
  return "contextual";
}

function anchorFor(target) {
  return stripHtml(target.focusKeyword || target.title).slice(0, 90);
}

function anchorCandidates(target) {
  const values = [target.focusKeyword, target.title].map(stripHtml).filter(Boolean);
  const candidates = [];
  for (const value of values) {
    const words = value.split(/\s+/).filter(Boolean);
    candidates.push(value);
    for (let size = Math.min(4, words.length); size >= 2; size -= 1) {
      for (let start = 0; start <= words.length - size; start += 1) {
        const phrase = words.slice(start, start + size).join(" ");
        const meaningful = words.slice(start, start + size).filter((word) => !STOP_WORDS.has(word.toLowerCase()));
        if (meaningful.length >= 2) candidates.push(phrase);
      }
    }
  }
  return [...new Set(candidates)].filter((value) => value.length >= 5).sort((a, b) => b.length - a.length);
}

function hasInternalLink(content, slug) {
  return new RegExp(`href=["']/blog/${escapeRegExp(slug)}(?:["'#?])`, "i").test(String(content || ""));
}

function insertContextualLink(content, target, anchorText, exactExcerpt = null) {
  const href = `/blog/${target.slug}`;
  if (!content || hasInternalLink(content, target.slug)) return { content, changed: false };
  const candidates = [...new Set([anchorText, ...anchorCandidates(target)].map(stripHtml).filter(Boolean))];
  const paragraphs = String(content).split(/(<p\b[^>]*>[\s\S]*?<\/p>)/gi);
  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (!/^<p\b/i.test(paragraph) || /<a\b/i.test(paragraph)) continue;
    if (exactExcerpt && stripHtml(paragraph) !== stripHtml(exactExcerpt)) continue;
    for (const phrase of candidates) {
      const pattern = new RegExp(`(?<![\\w-])(${escapeRegExp(phrase)})(?![\\w-])`, "i");
      if (pattern.test(stripHtml(paragraph))) {
        const replaced = paragraph.replace(pattern, `<a href="${href}">$1</a>`);
        if (replaced !== paragraph) {
          paragraphs[index] = replaced;
          return {
            content: paragraphs.join(""),
            changed: true,
            anchorText: stripHtml((replaced.match(new RegExp(`<a href="${escapeRegExp(href)}">([\\s\\S]*?)<\\/a>`, "i")) || [])[1] || phrase),
            currentExcerpt: stripHtml(paragraph),
            proposedExcerpt: stripHtml(replaced),
            sourceParagraphHtml: paragraph,
          };
        }
      }
    }
  }
  return { content, changed: false, placementStatus: "manual_required" };
}

const escapeHtml = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function normalizedWords(value = "") {
  return stripHtml(value).toLowerCase().match(/[a-z0-9+#.%-]+/g) || [];
}

function longestCommonWordSequence(left, right) {
  const previous = new Array(right.length + 1).fill(0);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = 0;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const saved = previous[rightIndex];
      previous[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? diagonal + 1
        : Math.max(previous[rightIndex], previous[rightIndex - 1]);
      diagonal = saved;
    }
  }
  return previous[right.length];
}

function validateMinimalRewrite(original, updated, anchorText) {
  const originalWords = normalizedWords(original);
  const updatedWords = normalizedWords(updated);
  if (!originalWords.length || !updatedWords.length) return "AI returned an empty or invalid paragraph.";
  if (updatedWords.length < originalWords.length || updatedWords.length - originalWords.length > 8) {
    return "AI may only insert a concise anchor phrase; it cannot delete or broadly expand content.";
  }
  const retainedSequence = longestCommonWordSequence(originalWords, updatedWords);
  if (retainedSequence !== originalWords.length) return "AI changed, removed, or reordered original wording.";
  const remainingOriginal = new Map();
  for (const word of originalWords) remainingOriginal.set(word, (remainingOriginal.get(word) || 0) + 1);
  const insertedWords = [];
  for (const word of updatedWords) {
    const remaining = remainingOriginal.get(word) || 0;
    if (remaining > 0) remainingOriginal.set(word, remaining - 1);
    else insertedWords.push(word);
  }
  const anchorWordSet = new Set(normalizedWords(anchorText));
  if (insertedWords.some((word) => !anchorWordSet.has(word))) return "AI inserted wording outside the approved anchor phrase.";
  const originalSentenceCount = (String(original).match(/[.!?]+(?:\s|$)/g) || []).length;
  const updatedSentenceCount = (String(updated).match(/[.!?]+(?:\s|$)/g) || []).length;
  if (originalSentenceCount !== updatedSentenceCount) return "AI rewrite changed the paragraph sentence structure.";
  const originalPunctuation = String(original).match(/[^\p{L}\p{N}\s]/gu) || [];
  const updatedPunctuation = String(updated).match(/[^\p{L}\p{N}\s]/gu) || [];
  if (originalPunctuation.join("") !== updatedPunctuation.join("")) return "AI changed the original punctuation structure.";
  const protectedTerms = new Set(String(original).match(/\b[A-Z][A-Za-z0-9+#.-]{2,}\b/g) || []);
  if ([...protectedTerms].some((term) => !String(updated).includes(term))) return "AI rewrite changed or removed a named term.";
  const originalFacts = new Set(String(original).match(/(?:\b\d[\d,.:%+-]*\b|https?:\/\/\S+|\b\S+@\S+\.\S+\b)/gi) || []);
  const updatedFacts = new Set(String(updated).match(/(?:\b\d[\d,.:%+-]*\b|https?:\/\/\S+|\b\S+@\S+\.\S+\b)/gi) || []);
  if ([...originalFacts].some((fact) => !updatedFacts.has(fact)) || [...updatedFacts].some((fact) => !originalFacts.has(fact))) {
    return "AI rewrite changed a number, URL, email address, or measurable fact.";
  }
  const anchorWords = normalizedWords(anchorText);
  if (anchorWords.length < 2 || anchorWords.length > 8) return "AI generated an unsafe anchor length.";
  const anchorMatches = stripHtml(updated).match(new RegExp(`(?<![\\w-])${escapeRegExp(stripHtml(anchorText))}(?![\\w-])`, "gi")) || [];
  if (anchorMatches.length !== 1) return "AI anchor must appear exactly once in the proposed paragraph.";
  return null;
}

export async function prepareInternalLinkWithAI(id, preparedBy = "system") {
  await dbConnect();
  const suggestion = await InternalLinkSuggestion.findById(id);
  if (!suggestion || !["pending", "rolled_back", "manual_review"].includes(suggestion.status)) return { success: false, message: "Suggestion is not available for AI preparation." };
  const [source, target] = await Promise.all([Blog.findOne({ _id: suggestion.sourceBlogId, ...publishedQuery }).lean(), Blog.findOne({ _id: suggestion.targetBlogId, ...publishedQuery }).lean()]);
  if (!source || !target) return { success: false, message: "Source or target article is unavailable." };
  const identityError = await validateLinkTargetIdentity(suggestion, source, target);
  if (identityError) {
    suggestion.status = "stale";
    suggestion.error = identityError;
    await suggestion.save();
    return { success: false, message: identityError };
  }
  const paragraphs = [...String(source.content || "").matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)]
    .map((match) => ({ html: match[0], text: stripHtml(match[0]) }))
    .filter((item) => item.text.length >= 45 && !/<a\b/i.test(item.html) && !/<(?!\/?p\b)[^>]+>/i.test(item.html) && !/&(?:[a-z]+|#\d+|#x[a-f0-9]+);/i.test(item.html))
    .slice(0, 80);
  if (!paragraphs.length) return { success: false, message: "No safe article paragraph is available for AI placement." };
  const response = await generateGeminiResponse(`You are a strict senior content editor. Create one natural contextual internal-link placement.

SOURCE ARTICLE: ${source.title}
TARGET ARTICLE: ${target.title}
TARGET SUMMARY: ${stripHtml(target.summary || "")}
TARGET FOCUS: ${stripHtml(target.focusKeyword || "")}

SOURCE PARAGRAPHS:
${paragraphs.map((item, index) => `[${index}] ${item.text}`).join("\n")}

Choose only a paragraph whose subject directly matches the target. You may only INSERT one concise 2-8 word natural anchor phrase at a grammatically correct position. Every original word must remain unchanged and in exactly the same order. Do not delete, replace, reorder, paraphrase, or correct any original word. Preserve punctuation, sentence count, names, numbers, URLs, emails, facts, claims, qualifications and meaning exactly. Do not add any wording outside the anchor phrase, or add a paragraph, sentence, CTA, recommendation, adjective, benefit, comparison, unsupported claim, keyword stuffing, or generic phrase. Read the complete sentence around the insertion and ensure grammar remains professional. If a natural insertion is impossible, return available:false.

Return strict JSON only:
{"available":true,"paragraphIndex":0,"updatedParagraph":"plain text only","anchorText":"exact phrase inside updatedParagraph","reason":"short placement reason"}`, { temperature: 0.15, responseMimeType: "application/json", maxOutputTokens: 900, thinkingBudget: 0, timeoutMs: 18000 });
  const plan = JSON.parse(String(response).replace(/```json/gi, "").replace(/```/g, "").trim());
  const paragraph = paragraphs[Number(plan.paragraphIndex)];
  const updatedText = stripHtml(plan.updatedParagraph || "");
  const anchorText = stripHtml(plan.anchorText || "").slice(0, 90);
  if (plan.available !== true || !paragraph || !updatedText || !anchorText) return { success: false, message: "AI found no genuinely relevant paragraph. Keep this suggestion as manual placement." };
  const anchorPattern = new RegExp(`(?<![\\w-])(${escapeRegExp(anchorText)})(?![\\w-])`, "i");
  if (!anchorPattern.test(updatedText)) return { success: false, message: "AI placement failed anchor validation." };
  const validationError = validateMinimalRewrite(paragraph.text, updatedText, anchorText);
  if (validationError) return { success: false, message: validationError };
  const linkedText = escapeHtml(updatedText).replace(anchorPattern, `<a href="/blog/${target.slug}">$1</a>`);
  const openingTag = paragraph.html.match(/^<p\b[^>]*>/i)?.[0] || "<p>";
  suggestion.currentExcerpt = paragraph.text;
  suggestion.proposedExcerpt = updatedText;
  suggestion.sourceParagraphHtml = paragraph.html;
  suggestion.proposedParagraphHtml = `${openingTag}${linkedText}</p>`;
  suggestion.anchorText = anchorText;
  suggestion.proposedAnchorText = anchorText;
  suggestion.placementStatus = "ready";
  suggestion.aiGeneratedPlacement = true;
  suggestion.manualReviewReason = undefined;
  suggestion.error = undefined;
  if (!Array.isArray(suggestion.history)) suggestion.history = [];
  suggestion.history.push({ action: "ai_placement_prepared", by: preparedBy, details: stripHtml(plan.reason || "AI selected and minimally rewrote a relevant paragraph.").slice(0, 300) });
  if (suggestion.status === "manual_review") suggestion.status = "pending";
  await suggestion.save();
  return { success: true };
}

async function migrateManagedFallbackParagraphs(blogs) {
  const bySlug = new Map(blogs.map((blog) => [blog.slug, blog]));
  const managedPattern = /\s*<p\s+data-internal-link-engine=["']true["']>For deeper context, read our\s+<a\s+href=["']\/blog\/([^"']+)["'][^>]*>[^<]*<\/a>\.<\/p>/gi;
  let migrated = 0;
  for (const summary of blogs) {
    const blog = await Blog.findById(summary._id);
    if (!blog?.content || !managedPattern.test(blog.content)) continue;
    managedPattern.lastIndex = 0;
    const slugs = [...blog.content.matchAll(managedPattern)].map((match) => match[1]);
    let content = blog.content.replace(managedPattern, "");
    let changed = content !== blog.content;
    for (const slug of slugs) {
      const target = bySlug.get(slug);
      if (!target) continue;
      const placement = insertContextualLink(content, target, anchorFor(target));
      if (placement.changed) content = placement.content;
      // Never append generic fallback copy. If a natural phrase is absent, leave the article unchanged.
    }
    if (changed && content !== blog.content) {
      blog.content = content;
      blog.internalLinksUpdatedAt = new Date();
      await blog.save();
      migrated += 1;
    }
  }
  if (migrated) await cacheManager.invalidateByTag("blogs");
  return migrated;
}

async function repairBrokenInternalLinks(blogs) {
  const knownSlugs = new Set(blogs.map((blog) => String(blog.slug || "").replace(/\/$/, "")));
  const linkPattern = /<a\b([^>]*\s)?href=["']\/blog\/([^"'#?]+)(?:[?#][^"']*)?["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let repaired = 0;
  for (const summary of blogs) {
    const content = String(summary.content || "");
    let changed = false;
    const nextContent = content.replace(linkPattern, (link, beforeHref, encodedSlug, afterHref, label) => {
      let targetSlug;
      try { targetSlug = decodeURIComponent(encodedSlug).replace(/\/$/, ""); } catch { targetSlug = encodedSlug.replace(/\/$/, ""); }
      if (knownSlugs.has(targetSlug)) return link;
      changed = true;
      repaired += 1;
      return label;
    });
    if (!changed) continue;
    await Blog.updateOne({ _id: summary._id }, { $set: { content: nextContent, internalLinksUpdatedAt: new Date() } });
    summary.content = nextContent;
  }
  if (repaired) await cacheManager.invalidateByTag("blogs");
  return repaired;
}

export async function applyInternalLinkSuggestion(id, appliedBy = "system", proposedAnchorText = "") {
  await dbConnect();
  const suggestion = await InternalLinkSuggestion.findById(id);
  if (!suggestion || !["pending", "failed", "rolled_back"].includes(suggestion.status)) return { success: false, message: "Suggestion is not available." };
  const [source, target] = await Promise.all([
    Blog.findOne({ _id: suggestion.sourceBlogId, ...publishedQuery }),
    Blog.findOne({ _id: suggestion.targetBlogId, ...publishedQuery }).lean(),
  ]);
  if (!source || !target) {
    suggestion.status = "stale";
    suggestion.error = "Source or target is no longer published.";
    await suggestion.save();
    return { success: false, message: suggestion.error };
  }
  const identityError = await validateLinkTargetIdentity(suggestion, source, target);
  if (identityError) {
    suggestion.status = "stale";
    suggestion.error = identityError;
    await suggestion.save();
    return { success: false, message: identityError };
  }
  if (suggestion.placementStatus !== "ready" || !suggestion.currentExcerpt) {
    return { success: false, message: "Needs manual placement; this suggestion cannot modify the article automatically." };
  }
  const anchorText = stripHtml(proposedAnchorText || suggestion.anchorText).slice(0, 90);
  if (!anchorText) return { success: false, message: "Anchor text is required." };
  const outgoingCount = new Set([...String(source.content || "").matchAll(/href=["']\/blog\/([^"'#?]+)/gi)].map((match) => match[1])).size;
  const linkLimit = isAuthorityArticle(source.articleType) ? LINK_LIMITS.pillar : LINK_LIMITS.supporting;
  if (outgoingCount >= linkLimit) return { success: false, message: `This ${isAuthorityArticle(source.articleType) ? "authority" : "supporting"} article already has the maximum ${linkLimit} contextual blog links.` };
  let result;
  if (suggestion.aiGeneratedPlacement && suggestion.sourceParagraphHtml && suggestion.proposedExcerpt) {
    if (!String(source.content).includes(suggestion.sourceParagraphHtml)) return { success: false, message: "The reviewed source paragraph changed. Prepare a fresh AI preview before applying." };
    const anchorPattern = new RegExp(`(?<![\\w-])(${escapeRegExp(anchorText)})(?![\\w-])`, "i");
    if (!anchorPattern.test(suggestion.proposedExcerpt)) return { success: false, message: "The edited anchor must exist in the proposed paragraph." };
    const openingTag = suggestion.sourceParagraphHtml.match(/^<p\b[^>]*>/i)?.[0] || "<p>";
    const proposedParagraphHtml = `${openingTag}${escapeHtml(suggestion.proposedExcerpt).replace(anchorPattern, `<a href="/blog/${target.slug}">$1</a>`)}</p>`;
    result = {
      content: String(source.content).replace(suggestion.sourceParagraphHtml, proposedParagraphHtml),
      changed: true,
      anchorText,
      currentExcerpt: suggestion.currentExcerpt,
      proposedExcerpt: suggestion.proposedExcerpt,
    };
  } else {
    result = insertContextualLink(source.content, target, anchorText, suggestion.currentExcerpt);
  }
  if (!result.changed) {
    suggestion.status = "failed";
    suggestion.placementStatus = "manual_required";
    suggestion.status = "manual_review";
    suggestion.error = "The approved anchor no longer exists in the exact reviewed paragraph. Manual placement is required.";
    await suggestion.save();
    return { success: false, message: suggestion.error };
  }
  const finalValidationError = await validateFinalBlogLinks(source.content, result.content, normalizeBlogSlug(target.slug));
  if (finalValidationError) {
    suggestion.status = "stale";
    suggestion.error = finalValidationError;
    await suggestion.save();
    return { success: false, message: finalValidationError };
  }
  suggestion.previousContent = source.content;
  source.content = result.content;
  source.internalLinksUpdatedAt = new Date();
  await source.save();
  suggestion.status = "applied";
  suggestion.appliedAt = new Date();
  suggestion.appliedBy = appliedBy;
  suggestion.error = undefined;
  suggestion.anchorText = result.anchorText || suggestion.anchorText;
  suggestion.proposedAnchorText = anchorText;
  suggestion.currentExcerpt = result.currentExcerpt;
  suggestion.proposedExcerpt = result.proposedExcerpt;
  suggestion.placementStatus = "ready";
  await suggestion.save();
  await cacheManager.invalidateByTag("blogs");
  return { success: true, sourceSlug: source.slug, targetSlug: target.slug };
}

export async function rollbackInternalLinkSuggestion(id, appliedBy = "system") {
  await dbConnect();
  const suggestion = await InternalLinkSuggestion.findById(id);
  if (!suggestion || suggestion.status !== "applied" || suggestion.previousContent == null) return { success: false, message: "No rollback snapshot is available." };
  const source = await Blog.findById(suggestion.sourceBlogId);
  if (!source) return { success: false, message: "Source blog no longer exists." };
  const targetHref = `/blog/${suggestion.targetSlug}`;
  const linkPattern = new RegExp(`<a\\b([^>]*\\s)?href=["']${escapeRegExp(targetHref)}(?:[?#][^"']*)?["']([^>]*)>([\\s\\S]*?)<\\/a>`, "i");
  const currentContent = String(source.content || "");
  const rolledBackContent = currentContent.replace(linkPattern, "$3");
  if (rolledBackContent === currentContent) return { success: false, message: "The applied link is no longer present, so no rollback was needed." };
  source.content = rolledBackContent;
  source.internalLinksUpdatedAt = new Date();
  await source.save();
  suggestion.status = "rolled_back";
  suggestion.rolledBackAt = new Date();
  suggestion.appliedBy = appliedBy;
  await suggestion.save();
  await cacheManager.invalidateByTag("blogs");
  return { success: true };
}

export async function auditInternalLinks({ blogId = null, autoApply = false, limit = 100 } = {}) {
  await dbConnect();
  const blogs = await Blog.find(publishedQuery).select("title slug summary content category tags focusKeyword articleType clusterKey parentPillarBlogId publishStatus").lean();
  const brokenRepaired = await repairBrokenInternalLinks(blogs);
  const migrated = blogId ? 0 : await migrateManagedFallbackParagraphs(blogs);
  const refreshedBlogs = migrated || brokenRepaired
    ? await Blog.find(publishedQuery).select("title slug summary content category tags focusKeyword articleType clusterKey parentPillarBlogId publishStatus").lean()
    : blogs;
  const focusBlog = blogId ? refreshedBlogs.find((blog) => String(blog._id) === String(blogId)) : null;
  if (blogId && !focusBlog) return { success: true, scanned: 0, created: 0, migrated, brokenRepaired, autoApplied: 0 };
  // A focused audit checks both directions: new/updated article -> existing articles,
  // and every existing article -> the new/updated article.
  const selected = refreshedBlogs;
  let created = 0;
  const automaticCandidates = [];
  const publishedIds = refreshedBlogs.map((blog) => blog._id);
  await InternalLinkSuggestion.updateMany(
    { status: { $in: ["pending", "applied", "rolled_back", "manual_review", "failed"] }, $or: [{ sourceBlogId: { $nin: publishedIds } }, { targetBlogId: { $nin: publishedIds } }] },
    { $set: { status: "stale", error: "Source or target is no longer published." } },
  );
  await InternalLinkSuggestion.updateMany(
    { status: "pending", $or: [
      { relationship: "contextual", confidence: { $lt: MIN_CONTEXTUAL_CONFIDENCE } },
      { relationship: { $ne: "contextual" }, confidence: { $lt: MIN_CLUSTER_CONFIDENCE } },
    ] },
    { $set: { status: "stale", error: "Retired by stronger professional relevance rules." } },
  );
  for (const source of selected) {
    const candidateTargets = blogId
      ? (String(source._id) === String(blogId) ? refreshedBlogs : [focusBlog])
      : refreshedBlogs;
    const existingOutgoing = new Set([...String(source.content || "").matchAll(/href=["']\/blog\/([^"'#?]+)/gi)].map((match) => match[1])).size;
    const availableSlots = Math.max(0, (isAuthorityArticle(source.articleType) ? LINK_LIMITS.pillar : LINK_LIMITS.supporting) - existingOutgoing);
    const ranked = candidateTargets.filter((target) => String(target._id) !== String(source._id) && !hasInternalLink(source.content, target.slug))
      .map((target) => {
        const relation = relationship(source, target);
        const score = candidateScore(source, target);
        const placement = insertContextualLink(source.content, target, anchorFor(target));
        return { target, score, relation, placement };
      })
      .filter((item) => item.score >= (item.relation === "contextual" ? MIN_CONTEXTUAL_CONFIDENCE : MIN_CLUSTER_CONFIDENCE))
      .sort((a, b) => b.score - a.score).slice(0, availableSlots);
    for (const item of ranked) {
      // Every suggestion that survives the strict relevance floor is eligible
      // for deterministic placement or guarded AI preparation.
      const automatic = true;
      const existing = await InternalLinkSuggestion.findOne({ sourceBlogId: source._id, targetBlogId: item.target._id }).select("status aiPlacementAttempts").lean();
      const restoreMissingAppliedLink = existing?.status === "applied" && !hasInternalLink(source.content, item.target.slug);
      const restoreNowPlaceableSuggestion = ["failed", "manual_review", "stale"].includes(existing?.status) && item.placement.changed;
      const suggestion = await InternalLinkSuggestion.findOneAndUpdate(
        { sourceBlogId: source._id, targetBlogId: item.target._id },
        { $set: {
          sourceSlug: source.slug, targetSlug: item.target.slug, anchorText: anchorFor(item.target),
          reason: item.relation === "contextual" ? "Strong topic and keyword overlap." : "Verified pillar/supporting cluster relationship.",
          relationship: item.relation, confidence: item.score, automatic,
          placementStatus: item.placement.changed ? "ready" : "manual_required", currentExcerpt: item.placement.currentExcerpt,
          proposedExcerpt: item.placement.proposedExcerpt, sourceParagraphHtml: item.placement.sourceParagraphHtml,
          ...(restoreMissingAppliedLink ? { status: "pending", error: "Previously applied link was removed and has been queued for recovery." } : {}),
          ...(restoreNowPlaceableSuggestion ? { status: "pending", error: "Suggestion became safely placeable during the latest audit." } : {}),
        }, ...(!restoreMissingAppliedLink && !restoreNowPlaceableSuggestion ? { $setOnInsert: { status: "pending" } } : {}) },
        { upsert: true, returnDocument: "after" },
      );
      if (!existing) created += 1;
      if (autoApply && automatic && suggestion.status === "pending" && Number(suggestion.aiPlacementAttempts || 0) < 3) {
        automaticCandidates.push({ id: suggestion._id, needsAI: suggestion.placementStatus !== "ready" });
      }
      if (created >= limit) break;
    }
    if (created >= limit) break;
  }
  const applied = [];
  let automaticAIAttempts = 0;
  let automaticAIPrepared = 0;
  for (const candidate of automaticCandidates) {
    if (candidate.needsAI) {
      if (automaticAIAttempts >= MAX_AUTOMATIC_AI_PLACEMENTS) continue;
      automaticAIAttempts += 1;
      try {
        const preparation = await prepareInternalLinkWithAI(candidate.id, "internal-link-engine");
        if (!preparation.success) {
          await InternalLinkSuggestion.updateOne({ _id: candidate.id }, { $inc: { aiPlacementAttempts: 1 }, $set: { lastAIAttemptAt: new Date(), error: preparation.message || "Guarded AI placement was rejected." } });
          continue;
        }
        automaticAIPrepared += 1;
      } catch (error) {
        console.error("[InternalLinks] Guarded AI placement rejected:", error.message);
        await InternalLinkSuggestion.updateOne({ _id: candidate.id }, { $inc: { aiPlacementAttempts: 1 }, $set: { lastAIAttemptAt: new Date(), error: error.message } });
        continue;
      }
    }
    applied.push(await applyInternalLinkSuggestion(candidate.id, "internal-link-engine"));
  }
  return {
    success: true,
    scanned: selected.length,
    created,
    migrated,
    brokenRepaired,
    automaticAIAttempts,
    automaticAIPrepared,
    autoApplied: applied.filter((item) => item.success).length,
  };
}

export async function getInternalLinkingDashboard() {
  await dbConnect();
  const [blogs, suggestions] = await Promise.all([
    Blog.find(publishedQuery).select("title slug content clusterKey articleType").lean(),
    InternalLinkSuggestion.find().sort({ createdAt: -1 }).limit(300).populate("sourceBlogId", "title slug").populate("targetBlogId", "title slug").lean(),
  ]);
  const incoming = new Map();
  const knownSlugs = new Set(blogs.map((blog) => blog.slug));
  const broken = [];
  const hrefPattern = /href=["']\/blog\/([^"'#?]+)[^"']*["']/gi;
  for (const source of blogs) {
    let match;
    while ((match = hrefPattern.exec(String(source.content || "")))) {
      const targetSlug = decodeURIComponent(match[1]).replace(/\/$/, "");
      if (!knownSlugs.has(targetSlug)) broken.push({ sourceBlogId: source._id, sourceTitle: source.title, sourceSlug: source.slug, targetSlug });
    }
  }
  for (const target of blogs) incoming.set(target.slug, blogs.filter((source) => hasInternalLink(source.content, target.slug)).length);
  const health = blogs.map((blog) => ({
    _id: blog._id, title: blog.title, slug: blog.slug, articleType: blog.articleType,
    incoming: incoming.get(blog.slug) || 0,
    outgoing: blogs.filter((target) => target.slug !== blog.slug && hasInternalLink(blog.content, target.slug)).length,
    status: (incoming.get(blog.slug) || 0) === 0 ? "orphan" : "healthy",
  }));
  return {
    health, suggestions, broken,
    counts: {
      published: blogs.length,
      orphan: health.filter((item) => item.status === "orphan").length,
      pending: suggestions.filter((item) => ["pending", "rolled_back"].includes(item.status)).length,
      applied: suggestions.filter((item) => item.status === "applied").length,
      broken: broken.length,
    },
  };
}

export async function cleanupWeakPendingSuggestions(appliedBy = "system") {
  await dbConnect();
  const result = await InternalLinkSuggestion.updateMany(
    { status: "pending", $or: [
      { confidence: { $lt: MIN_CONTEXTUAL_CONFIDENCE } },
      { relationship: { $in: ["same_cluster", "pillar_to_supporting", "supporting_to_pillar"] }, confidence: { $lt: MIN_CLUSTER_CONFIDENCE } },
    ] },
    { $set: { status: "stale", error: "Retired by stricter relevance rules.", appliedBy } },
  );
  return { success: true, cleaned: result.modifiedCount || 0 };
}

export async function scheduleInternalLinkAudit(blogId) {
  try {
    return await auditInternalLinks({ blogId, autoApply: true, limit: 40 });
  } catch (error) {
    console.error("[InternalLinks] Publish-time audit failed:", error.message);
    return { success: false, message: error.message };
  }
}
