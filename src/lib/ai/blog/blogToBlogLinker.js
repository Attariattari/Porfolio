/**
 * Contextual Blog-to-Blog Internal Linking Engine (Phase 7)
 * 
 * Discovers and inserts contextual internal links between candidate blog and published blogs:
 * - Parent Pillar link (/blog/parent-slug) for supporting topics
 * - Child Supporting links for parent pillars
 * - Relevant sibling & cluster links with natural, descriptive anchor text
 * 
 * LINK SAFETY:
 * - Every target URL MUST be validated against published Blog database records (publishStatus: "published").
 * - Zero broken, draft, or unpublished links created.
 */

import { stripBlogHtml } from "../../blogSeo.js";

const escapeRegExp = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const STOP_WORDS = new Set(["and", "are", "for", "from", "how", "into", "the", "that", "this", "with", "your", "website", "web", "guide"]);

function hasInternalLink(content, slug) {
  return new RegExp(`href=["']/blog/${escapeRegExp(slug)}(?:["'#?])`, "i").test(String(content || ""));
}

function insertContextualLink(content, target, anchorText) {
  const href = `/blog/${target.slug}`;
  if (!content || hasInternalLink(content, target.slug)) return { content, changed: false };
  const candidates = [...new Set([anchorText, target.focusKeyword, target.title].map(stripBlogHtml).filter(Boolean))];
  const paragraphs = String(content).split(/(<p\b[^>]*>[\s\S]*?<\/p>)/gi);
  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (!/^<p\b/i.test(paragraph) || /<a\b/i.test(paragraph)) continue;
    for (const phrase of candidates) {
      const pattern = new RegExp(`(?<![\\w-])(${escapeRegExp(phrase)})(?![\\w-])`, "i");
      if (pattern.test(stripBlogHtml(paragraph))) {
        const replaced = paragraph.replace(pattern, `<a href="${href}">$1</a>`);
        if (replaced !== paragraph) {
          paragraphs[index] = replaced;
          return {
            content: paragraphs.join(""),
            changed: true,
            anchorText: phrase,
          };
        }
      }
    }
  }
  return { content, changed: false };
}

function extractTokens(blog = {}) {
  return new Set(
    [blog.title, blog.summary, blog.focusKeyword, blog.category, ...(blog.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function calculateSemanticSimilarity(source = {}, target = {}) {
  const left = extractTokens(source);
  const right = extractTokens(target);
  if (!left.size || !right.size) return 0;
  const overlap = [...left].filter((token) => right.has(token)).length;
  return overlap / Math.max(1, new Set([...left, ...right]).size);
}

/**
 * Generates and applies contextual blog-to-blog internal links for a candidate article.
 * 
 * @param {Object} blogData - Candidate blog data object ({ title, content, slug, clusterKey, articleType, parentPillarBlogId })
 * @param {Array<Object>} publishedBlogs - Pool of published blog metadata objects
 * @param {Object} [options={}] - Options ({ maxLinks })
 * @returns {Object} { content, appliedLinks, recommendedLinks }
 */
export function generateBlogToBlogLinks(blogData = {}, publishedBlogs = [], options = {}) {
  let content = String(blogData.content || "");
  if (!content || !Array.isArray(publishedBlogs) || publishedBlogs.length === 0) {
    return { content, appliedLinks: [], recommendedLinks: [] };
  }

  const candidateSlug = blogData.slug;
  const candidateCluster = blogData.clusterKey || "";
  const candidateType = blogData.articleType || "supporting";
  const parentId = blogData.parentPillarBlogId?.toString?.() || null;

  const validTargetBlogs = publishedBlogs.filter(
    (b) => b && b.slug && b.slug !== candidateSlug && (b.publishStatus === "published" || b.status === "published" || !b.publishStatus)
  );

  const recommendedLinks = [];
  const appliedLinks = [];
  const maxLinks = Number(options.maxLinks || 3);

  // 1. Check Parent Pillar Link Opportunity (Supporting Topic ➔ Parent Pillar)
  let parentPillarBlog = null;
  if (parentId) {
    parentPillarBlog = validTargetBlogs.find((b) => b._id?.toString?.() === parentId);
  }
  if (!parentPillarBlog && candidateCluster) {
    parentPillarBlog = validTargetBlogs.find(
      (b) => b.clusterKey === candidateCluster && (b.articleType === "pillar" || b.type === "pillar")
    );
  }

  if (parentPillarBlog) {
    const anchorText = parentPillarBlog.focusKeyword || parentPillarBlog.title;
    recommendedLinks.push({
      targetBlogId: parentPillarBlog._id?.toString?.() || parentPillarBlog.slug,
      targetSlug: parentPillarBlog.slug,
      targetTitle: parentPillarBlog.title,
      href: `/blog/${parentPillarBlog.slug}`,
      anchorText,
      relationship: "supporting_to_parent_pillar",
      confidence: 0.95,
    });
  }

  // 2. Discover Sibling / Related Cluster Links
  const scoredBlogs = validTargetBlogs
    .filter((b) => !parentPillarBlog || b.slug !== parentPillarBlog.slug)
    .map((target) => {
      const sim = calculateSemanticSimilarity(blogData, target);
      const sameCluster = Boolean(candidateCluster && target.clusterKey && candidateCluster === target.clusterKey);
      const score = sim * 0.6 + (sameCluster ? 0.4 : 0.0);
      return { target, score, sameCluster };
    })
    .filter((item) => item.score >= 0.25)
    .sort((a, b) => b.score - a.score);

  for (const item of scoredBlogs) {
    if (recommendedLinks.length >= maxLinks) break;
    const target = item.target;
    recommendedLinks.push({
      targetBlogId: target._id?.toString?.() || target.slug,
      targetSlug: target.slug,
      targetTitle: target.title,
      href: `/blog/${target.slug}`,
      anchorText: target.focusKeyword || target.title,
      relationship: item.sameCluster ? "same_cluster_sibling" : "related_contextual",
      confidence: Math.round(item.score * 100) / 100,
    });
  }

  // 3. Apply Links Contextually into Content HTML
  for (const rec of recommendedLinks) {
    const targetBlog = validTargetBlogs.find((b) => b.slug === rec.targetSlug);
    if (!targetBlog) continue;

    const result = insertContextualLink(content, targetBlog, rec.anchorText);
    if (result.changed) {
      content = result.content;
      appliedLinks.push({
        targetSlug: rec.targetSlug,
        targetTitle: rec.targetTitle,
        href: `/blog/${rec.targetSlug}`,
        anchorText: result.anchorText || rec.anchorText,
        relationship: rec.relationship,
      });
    }
  }

  return {
    content,
    appliedLinks,
    recommendedLinks,
  };
}
