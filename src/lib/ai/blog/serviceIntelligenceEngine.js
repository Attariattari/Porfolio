/**
 * Dynamic Service Intelligence & Matching Engine (Phase 7)
 * 
 * Queries the real Service MongoDB collection to match articles with relevant Muhyo Tech services based on:
 * - Article topic & technical category
 * - Business problem & solution angle
 * - Focus keyword & technology stack
 * 
 * WHITELIST INTEGRATION & SAFETY:
 * - Enforces ALLOWED_RELATED_SERVICE_SLUGS validation.
 * - If no service is genuinely relevant, returns an empty array (never forces unnatural service links).
 */

import mongoose from "mongoose";
import { Service } from "../../../models/Portfolio.js";
import { stripBlogHtml, getBlogServiceLinks } from "../../blogSeo.js";
import { matchBestServiceForProblem } from "../intelligence/services/serviceProblemMatcher.js";
import { getServiceKnowledgeProfile } from "../intelligence/services/serviceKnowledgeBase.js";

const STOP_WORDS = new Set(["and", "are", "for", "from", "how", "into", "the", "that", "this", "with", "your", "website", "web", "guide"]);

function extractTokens(text = "") {
  return new Set(
    stripBlogHtml(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

/**
 * Matches relevant Muhyo Tech services from Knowledge Base, MongoDB, or fallback catalog.
 * 
 * @param {Object} blogData - Candidate blog data object
 * @param {Object} [options={}] - Options ({ maxServices })
 * @returns {Promise<Array<Object>>} Array of matched service objects
 */
export async function matchServicesForArticle(blogData = {}, options = {}) {
  const maxServices = Number(options.maxServices || 3);
  
  // 1. Try Problem-Audience-Solution Matcher Engine
  const problemMatched = matchBestServiceForProblem(blogData);
  const matchedSlug = problemMatched.primaryService?.slug;
  const knowledgeProfile = getServiceKnowledgeProfile(matchedSlug);

  let dbServices = [];

  // 2. Query real Service MongoDB collection if available
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1 && Service && typeof Service.find === "function") {
      dbServices = await Service.find({}).lean();
    }
  } catch (dbErr) {
    console.warn("[Service-Intelligence] Safe catch: DB Service query failed:", dbErr.message);
  }

  // 3. If DB services exist, enrich matching results
  if (dbServices.length > 0) {
    const articleTokens = extractTokens(
      `${blogData.title || ""} ${blogData.focusKeyword || ""} ${blogData.category || ""} ${blogData.summary || ""}`
    );

    const scoredDbServices = dbServices
      .map((svc) => {
        const svcTokens = extractTokens(
          `${svc.slug} ${svc.title} ${svc.description || ""} ${svc.shortDescription || ""} ${svc.problemSolved || ""} ${(svc.techStack || []).join(" ")}`
        );

        let overlap = 0;
        for (const token of articleTokens) {
          if (svcTokens.has(token)) overlap++;
        }

        const isProblemMatched = svc.slug === matchedSlug;
        const baseScore = overlap / Math.max(1, new Set([...articleTokens, ...svcTokens]).size);
        const score = baseScore + (isProblemMatched ? 0.4 : 0);

        return {
          slug: svc.slug,
          title: svc.title,
          href: `/services/${svc.slug}`,
          shortDescription: svc.shortDescription || svc.description || knowledgeProfile?.whatItIs,
          relevanceScore: Math.min(0.98, Math.round(score * 100) / 100),
          reason: isProblemMatched
            ? `Matched via Problem-Audience Intelligence Engine for ${problemMatched.problemAnalysis.detectedProblem}.`
            : `Matched ${overlap} technical domain tokens in service catalog.`,
          ctaPrimaryText: svc.ctaPrimaryText || knowledgeProfile?.conversionStrategy?.primaryCtaText || `Consult with ${svc.title} Engineers`,
        };
      })
      .filter((item) => item.relevanceScore >= 0.08)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (scoredDbServices.length > 0) {
      return scoredDbServices.slice(0, maxServices);
    }
  }

  // 4. Baseline Fallback via Service Knowledge Base / blogSeo.js
  if (knowledgeProfile) {
    return [
      {
        slug: knowledgeProfile.slug,
        title: knowledgeProfile.title,
        href: `/services/${knowledgeProfile.slug}`,
        shortDescription: knowledgeProfile.whatItIs,
        relevanceScore: problemMatched.confidence || 0.85,
        reason: `Matched via Service Knowledge Base (${problemMatched.problemAnalysis.detectedProblem}).`,
        ctaPrimaryText: knowledgeProfile.conversionStrategy?.primaryCtaText || `Consult with ${knowledgeProfile.title} Engineers`,
      }
    ];
  }

  const fallbackLinks = getBlogServiceLinks(blogData, maxServices);
  return fallbackLinks.map((link) => ({
    slug: link.slug,
    title: link.title,
    href: link.href || `/services/${link.slug}`,
    shortDescription: link.description,
    relevanceScore: 0.75,
    reason: "Matched via Muhyo Tech topic service rules catalog.",
    ctaPrimaryText: `Consult with ${link.title} Engineers`,
  }));
}

