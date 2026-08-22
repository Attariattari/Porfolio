/**
 * Configurable Dynamic Topic Opportunity Scoring Engine (Phase 7 - Think10X Architecture)
 * 
 * Computes a multi-dimensional normalized score (0-100) for candidate topics based on 9 weighted dimensions:
 * Search Opportunity (15%), Business Value (15%), Authority Value (15%), Conversion Potential (15%), 
 * Search Intent (10%), Freshness (5%), Service Relevance (10%), Performance Opportunity (10%),
 * minus Cannibalization Risk (5%) and Content Saturation (5%).
 * 
 * Includes Data Confidence Calculation (1.0 = GSC API, 0.7 = DB Search Evidence, 0.5 = Heuristic Fallback),
 * Transparent Reasons Array, Action Threshold Classification, and Hard Safety Rejections.
 */

import { matchTopicToServicesSync } from "./services/serviceTopicMatcherEngine.js";

export const DEFAULT_SCORING_WEIGHTS = Object.freeze({
  searchOpportunity: 0.20,
  businessValue: 0.15,
  authorityValue: 0.15,
  conversionPotential: 0.15,
  searchIntentStrength: 0.10,
  freshness: 0.05,
  serviceRelevance: 0.10,
  performanceOpportunity: 0.10,
  cannibalizationRisk: 0.05,
  contentSaturation: 0.05,
});

const clamp = (val) => Math.min(100, Math.max(0, Number(val) || 0));

export function classifyActionThreshold(score = 50) {
  if (score >= 90) return "CRITICAL";
  if (score >= 80) return "HIGH";
  if (score >= 70) return "NORMAL";
  if (score >= 60) return "HOLD";
  return "LOW";
}

export function evaluateHardTopicRejection(candidate = {}, existingPool = []) {
  if (!candidate.title || !candidate.focusKeyword) {
    return { eligible: false, decision: "reject", reason: "missing_required_fields" };
  }

  const normTitle = String(candidate.title).toLowerCase().trim();
  const normKw = String(candidate.focusKeyword).toLowerCase().trim();

  for (const existing of existingPool) {
    const exTitle = String(existing.title || "").toLowerCase().trim();
    const exKw = String(existing.focusKeyword || "").toLowerCase().trim();

    if (normTitle === exTitle) {
      return { eligible: false, decision: "reject", reason: "exact_duplicate_title", matchedId: existing._id };
    }
    if (normKw && normKw === exKw && existing.articleType === candidate.articleType) {
      return { eligible: false, decision: "reject", reason: "duplicate_focus_keyword", matchedId: existing._id };
    }
  }

  if (candidate.articleType === "supporting" && !candidate.parentTopicId && !candidate.pillar && !candidate.parentPillarBlog && !candidate.parentPillarTopic) {
    return { eligible: false, decision: "reject", reason: "unlinked_supporting_topic" };
  }

  return { eligible: true, decision: "accept", reason: "passed_safety_checks" };
}

export function scoreTopicOpportunity(candidate = {}, signals = { isEstimated: true }, customWeights = null) {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...(customWeights || {}) };
  const isEstimated = signals?.isEstimated !== false;
  const sources = ["BlogTopicPlan"];
  const reasons = [];

  if (signals?.source) sources.push(signals.source);

  // Evaluate Service Match Sync via Phase 3 Engine
  let matchedResult = null;
  try {
    matchedResult = matchTopicToServicesSync(candidate);
  } catch (err) {
    // Graceful fallback
  }

  if (candidate.serviceSlug || candidate.serviceIntent?.relevant || matchedResult?.primaryService) {
    sources.push("ServiceMatcher");
  }

  // 1. Search Opportunity
  let searchOpportunity = 70;
  if (signals?.data?.gscImpressions) {
    searchOpportunity = Math.min(100, signals.data.gscImpressions / 10);
    reasons.push(`Real search impressions (${signals.data.gscImpressions}) detected.`);
  } else if (candidate.searchOpportunity) {
    searchOpportunity = candidate.searchOpportunity;
  }
  searchOpportunity = clamp(searchOpportunity);

  // 2. Business Value
  const hasBusinessProblem = Boolean(
    candidate.problem || candidate.businessValue || candidate.businessProblem || /cost|price|pricing|agency|hire|problem|solution|friction/i.test(candidate.title || "")
  );
  const businessValue = clamp(candidate.businessValueScore ?? (hasBusinessProblem ? 85 : 60));
  if (hasBusinessProblem) reasons.push("Addresses concrete business/operational friction.");

  // 3. Authority Value
  const isPillar = candidate.articleType === "pillar" || candidate.topicType?.includes("pillar");
  const isAuthority = candidate.articleType === "standalone_authority" || isPillar;
  const authorityValue = clamp(candidate.authorityValueScore ?? (isAuthority ? 90 : 70));
  if (isAuthority) reasons.push("Strengthens core technical or industry topical graph.");

  // 4. Conversion Potential
  const conversionPotential = clamp(
    candidate.conversionPotential ?? (candidate.serviceSlug || matchedResult?.primaryService || candidate.serviceRelevance > 0.5 ? 90 : 45)
  );
  if (candidate.serviceSlug || matchedResult?.primaryService) {
    reasons.push(`Direct commercial link to service '${candidate.serviceSlug || matchedResult?.primaryService?.slug}'.`);
  }

  // 5. Search Intent Strength
  const highIntentKeys = ["problem_solving", "commercial_investigation", "pricing", "transactional", "commercial"];
  const searchIntentStrength = clamp(
    candidate.intentQualityScore ?? (highIntentKeys.includes(candidate.intent || candidate.searchIntent) ? 90 : 70)
  );

  // 6. Freshness
  const freshness = clamp(
    candidate.freshnessScore ?? (candidate.isTrend || candidate.articleType === "verified_trend" ? 95 : 60)
  );
  if (candidate.isTrend) reasons.push("Fresh ecosystem trend signal detected.");

  // 7. Service Relevance (Phase 3 Multi-Signal Evidence)
  let serviceRelRaw = 40;
  if (typeof candidate.serviceRelevance === "number") {
    serviceRelRaw = candidate.serviceRelevance > 1 ? candidate.serviceRelevance : candidate.serviceRelevance * 100;
  } else if (candidate.serviceSlug) {
    serviceRelRaw = 85;
  } else {
    serviceRelRaw = matchedResult?.overallServiceRelevance || 40;
  }
  const serviceRelevanceScore = clamp(serviceRelRaw);

  // Elevate conversion potential if primary service matched
  if (!candidate.conversionPotential && (matchedResult?.primaryService || candidate.serviceSlug)) {
    reasons.push(`High conversion potential via matched primary service.`);
  }

  // 8. Performance Feedback Opportunity
  const performanceOpportunity = clamp(
    candidate.performanceOpportunity ?? (signals?.data?.gscClicks ? Math.min(100, signals.data.gscClicks * 2) : 50)
  );

  // 9. Penalties
  const cannibalizationRisk = clamp(candidate.cannibalizationRisk ?? 10);
  const contentSaturation = clamp(candidate.contentSaturation ?? 15);

  // Calculate Weighted Sum
  const weightedScore =
    searchOpportunity * weights.searchOpportunity +
    businessValue * weights.businessValue +
    authorityValue * weights.authorityValue +
    conversionPotential * weights.conversionPotential +
    searchIntentStrength * weights.searchIntentStrength +
    freshness * weights.freshness +
    serviceRelevanceScore * weights.serviceRelevance +
    performanceOpportunity * weights.performanceOpportunity -
    cannibalizationRisk * weights.cannibalizationRisk -
    contentSaturation * weights.contentSaturation;

  const score = Math.min(100, Math.max(0, Math.round(weightedScore)));
  const dataConfidence = isEstimated ? (signals?.source === "search_opportunity_db" ? 0.7 : 0.5) : 1.0;
  const actionCategory = classifyActionThreshold(score);

  const breakdown = {
    searchOpportunity,
    businessValue,
    authorityValue,
    conversionPotential,
    searchIntentStrength,
    freshness,
    serviceRelevance: serviceRelevanceScore,
    performanceOpportunity,
    cannibalizationRisk,
    contentSaturation,
    isEstimated,
    weights,
  };

  return {
    score,
    dataConfidence,
    scoringVersion: "1.0.0",
    actionCategory,
    breakdown,
    scoreSources: sources,
    scoreReasons: reasons,
    scoringUpdatedAt: new Date().toISOString(),
  };
}
