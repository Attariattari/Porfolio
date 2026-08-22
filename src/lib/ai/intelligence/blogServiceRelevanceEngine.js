/**
 * Blog ↔ Service Relevance Engine (Phase 8)
 * 
 * Computes a normalized multi-signal relevance score (0-100) between a blog/topic 
 * and existing Muhyo Tech digital services. Supports explicit relatedServiceSlugs priority,
 * primary vs secondary service classification, and internal link recommendations.
 * 
 * Relevance Classifications:
 * - 0-19: none (Pure educational technical articles)
 * - 20-39: weak
 * - 40-59: moderate
 * - 60-79: strong
 * - 80-100: highly_relevant (Commercial/problem-solution topics)
 */

import { matchTopicToServicesSync } from "./services/serviceTopicMatcherEngine.js";
import { getServiceIntelligenceSnapshotSync } from "./services/serviceIntelligenceSnapshot.js";

/**
 * Evaluates the relevance between a blog/topic payload and Muhyo Tech services.
 * 
 * @param {Object} item - Blog or Topic object
 * @returns {Object} Relevance Analysis & Internal Link Recommendations
 */
export function evaluateBlogServiceRelevance(item = {}) {
  const blog = item.blog || item.topic || item || {};
  const explicitSlugs = Array.isArray(blog.relatedServiceSlugs) ? blog.relatedServiceSlugs : [];
  const catalog = getServiceIntelligenceSnapshotSync();

  try {
    // 1. Explicit Related Service Slugs Priority
    if (explicitSlugs.length > 0) {
      const explicitPrimarySlug = explicitSlugs[0];
      const matchedPrimary = catalog.find((s) => s.slug === explicitPrimarySlug);

      if (matchedPrimary) {
        const secondarySlugs = explicitSlugs.slice(1);
        const secondaryServices = catalog.filter((s) => secondarySlugs.includes(s.slug));

        return {
          relevanceScore: 95,
          category: "highly_relevant",
          primaryService: {
            slug: matchedPrimary.slug,
            title: matchedPrimary.title,
            relevanceScore: 95,
          },
          secondaryServices: secondaryServices.map((s) => ({ slug: s.slug, title: s.title, relevanceScore: 80 })),
          internalLinkRecommendations: {
            primaryServiceLink: `/services/${matchedPrimary.slug}`,
            recommendedAnchor: `Professional ${matchedPrimary.title} Services`,
            secondaryLinks: secondaryServices.map((s) => ({
              url: `/services/${s.slug}`,
              anchor: s.title,
            })),
          },
          signals: [`Explicitly configured relationship for '${matchedPrimary.slug}'.`],
        };
      }
    }

    // 2. Multi-Signal Automatic Matcher Execution
    const matched = matchTopicToServicesSync(blog);
    const score = matched.overallServiceRelevance || 0;
    const classification = matched.matchClassification || "none";

    const primary = matched.primaryService
      ? { slug: matched.primaryService.slug, title: matched.primaryService.title, relevanceScore: score }
      : null;

    const secondary = (matched.rankedMatches || [])
      .slice(1, 4)
      .map((m) => ({ slug: m.serviceSlug, title: m.serviceTitle, relevanceScore: m.score }));

    return {
      relevanceScore: score,
      category: classification,
      primaryService: primary,
      matchedService: primary,
      secondaryServices: secondary,
      internalLinkRecommendations: primary
        ? {
            primaryServiceLink: `/services/${primary.slug}`,
            recommendedAnchor: `Custom ${primary.title} Solutions`,
            secondaryLinks: secondary.map((s) => ({
              url: `/services/${s.slug}`,
              anchor: s.title,
            })),
          }
        : null,
      signals: matched.primaryService?.reasons || ["Evaluated via Multi-Signal Topic Intelligence Engine."],
    };
  } catch (err) {
    console.warn("[blogServiceRelevanceEngine] Evaluation fallback:", err.message);
  }

  // Baseline Safety Fallback
  const fallbackPrimary = { slug: "custom-website-development", title: "Custom Website Development", relevanceScore: 50 };
  return {
    relevanceScore: 50,
    category: "moderate",
    primaryService: fallbackPrimary,
    matchedService: fallbackPrimary,
    secondaryServices: [],
    internalLinkRecommendations: {
      primaryServiceLink: "/services/custom-website-development",
      recommendedAnchor: "Custom Website Development",
      secondaryLinks: [],
    },
    signals: ["Baseline fallback match."],
  };
}
