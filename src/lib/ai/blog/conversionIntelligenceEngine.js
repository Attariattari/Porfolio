/**
 * Conversion Intelligence & Dynamic CTA Engine (Phase 7)
 * 
 * Generates intent-aware, contextually relevant conversion strategies and CTAs:
 * - INFORMATIONAL: Soft next-step guide CTA
 * - COMMERCIAL: Service-focused evaluation CTA
 * - TRANSACTIONAL: Direct consultation CTA
 * - TECHNICAL: Engineering architecture review CTA
 * 
 * CTA LIMITS:
 * 1-2 CTAs max per article, contextually derived from real Service DB context.
 * Never inserts unnatural sales spam into purely informational technical deep-dives.
 */

import { generateContextualServiceCTA } from "../intelligence/services/serviceCommercialIntentEngine.js";

/**
 * Generates conversion strategy and CTA payload for a candidate blog draft.
 * 
 * @param {Object} blogData - Candidate blog data object
 * @param {Array<Object>} [matchedServices=[]] - Matched service objects from Service Intelligence
 * @param {Object} [options={}] - Options ({ searchIntent, articleType })
 * @returns {Object} Structured Conversion Strategy payload
 */
export function generateConversionStrategy(blogData = {}, matchedServices = [], options = {}) {
  const primaryService = Array.isArray(matchedServices) && matchedServices.length > 0 ? matchedServices[0] : null;

  return generateContextualServiceCTA({
    blogData: { ...blogData, searchIntent: options.searchIntent || blogData.searchIntent },
    matchedService: primaryService?.slug || primaryService,
  });
}

