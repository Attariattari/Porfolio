/**
 * Master Phase 7 Media + Internal Linking + Conversion Intelligence Orchestrator
 * 
 * Aggregates:
 * - Media Intelligence (In-body visual planning)
 * - Contextual Blog-to-Blog Internal Linking
 * - Dynamic Service Matching (Queries real Service MongoDB collection)
 * - Intent-Aware Conversion Strategy & Dynamic CTAs
 * 
 * NON-BLOCKING & FAIL-SAFE GUARANTEE:
 * - Controlled by feature flags (PHASE7_MEDIA_ENABLED, PHASE7_INTERNAL_LINKING_ENABLED, etc.).
 * - Wrapped in try/catch per module. On error/timeout, logs a warning and defaults safely.
 * - NEVER fails article generation or published blog pipeline execution.
 */

import { generateMediaPlan } from "./mediaIntelligenceEngine.js";
import { generateBlogToBlogLinks } from "./blogToBlogLinker.js";
import { matchServicesForArticle } from "./serviceIntelligenceEngine.js";
import { generateConversionStrategy } from "./conversionIntelligenceEngine.js";

/**
 * Executes Phase 7 Intelligence Layer on a generated blog draft.
 * 
 * @param {Object} blogData - Generated blog data object
 * @param {Object} [options={}] - Custom options ({ publishedBlogs, topicPlan })
 * @returns {Promise<Object>} Updated blogData object with Phase 7 metadata
 */
export async function executePhase7Intelligence(blogData = {}, options = {}) {
  const startedAt = Date.now();

  if (!blogData || (!blogData.title && !blogData.content)) {
    return blogData;
  }

  const isMediaEnabled = process.env.PHASE7_MEDIA_ENABLED === "true" || options.enableMedia === true;
  const isLinkingEnabled = process.env.PHASE7_INTERNAL_LINKING_ENABLED === "true" || options.enableLinking === true;
  const isServiceEnabled = process.env.PHASE7_SERVICE_MATCHING_ENABLED === "true" || options.enableServices === true;
  const isCtaEnabled = process.env.PHASE7_DYNAMIC_CTA_ENABLED === "true" || options.enableCta === true;

  const publishedBlogs = Array.isArray(options.publishedBlogs) ? options.publishedBlogs : [];

  // 1. In-Body Media Planning
  let mediaPlan = blogData.mediaPlan || [];
  if (isMediaEnabled) {
    try {
      mediaPlan = generateMediaPlan(blogData, options);
    } catch (mediaErr) {
      console.warn("[Phase7-Intelligence] Safe catch: Media planning error:", mediaErr.message);
    }
  }

  // 2. Dynamic Service Matching
  let serviceMatches = blogData.serviceMatches || [];
  if (isServiceEnabled) {
    try {
      serviceMatches = await matchServicesForArticle(blogData, options);
      if (serviceMatches.length > 0) {
        const matchedSlugs = serviceMatches.map((s) => s.slug);
        blogData.relatedServiceSlugs = [...new Set([...(blogData.relatedServiceSlugs || []), ...matchedSlugs])];
      }
    } catch (svcErr) {
      console.warn("[Phase7-Intelligence] Safe catch: Service matching error:", svcErr.message);
    }
  }

  // 3. Contextual Blog-to-Blog Linking
  let content = blogData.content || "";
  let internalLinkAudit = blogData.internalLinkAudit || null;
  if (isLinkingEnabled && publishedBlogs.length > 0) {
    try {
      const linkResult = generateBlogToBlogLinks(blogData, publishedBlogs, options);
      content = linkResult.content;
      internalLinkAudit = {
        appliedLinksCount: linkResult.appliedLinks.length,
        recommendedLinksCount: linkResult.recommendedLinks.length,
        appliedLinks: linkResult.appliedLinks,
        recommendedLinks: linkResult.recommendedLinks,
      };
    } catch (linkErr) {
      console.warn("[Phase7-Intelligence] Safe catch: Internal linking error:", linkErr.message);
    }
  }

  // 4. Conversion Strategy & Dynamic CTA
  let conversionStrategy = blogData.conversionStrategy || null;
  if (isCtaEnabled) {
    try {
      conversionStrategy = generateConversionStrategy(blogData, serviceMatches, options);
    } catch (ctaErr) {
      console.warn("[Phase7-Intelligence] Safe catch: Conversion strategy error:", ctaErr.message);
    }
  }

  const durationMs = Date.now() - startedAt;
  console.log(`[Phase7-Intelligence] Processed Phase 7 in ${durationMs}ms. Media: ${mediaPlan.length} | Services: ${serviceMatches.length} | Links Applied: ${internalLinkAudit?.appliedLinksCount || 0}`);

  return {
    ...blogData,
    content,
    mediaPlan,
    serviceMatches,
    conversionStrategy,
    internalLinkAudit,
  };
}
