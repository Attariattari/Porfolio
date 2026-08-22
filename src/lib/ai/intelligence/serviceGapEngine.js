/**
 * Service Gap & Opportunity Intelligence Engine (Phase 4)
 * 
 * Production-grade intelligence layer that detects commercially valuable missing service capabilities 
 * from the Topic Intelligence ecosystem without auto-publishing services or overwriting live code.
 */

import { ServiceOpportunity } from "../../../models/ServiceOpportunity.js";
import { matchTopicToServicesSync } from "./services/serviceTopicMatcherEngine.js";
import { classifyConversionIntent } from "./conversionLinkingEngine.js";
import { getServiceIntelligenceSnapshotSync } from "./services/serviceIntelligenceSnapshot.js";

const STOP_WORDS = new Set([
  "how", "what", "which", "where", "why", "when", "does", "much", "many", "best", "top", "tips",
  "build", "building", "scalable", "to", "for", "with", "the", "and", "guide", "tutorial", "overview", "cost",
  "price", "pricing", "rate", "rates", "agency", "company", "companies", "services", "system", "setup",
  "management", "hiring", "hire", "2024", "2025", "2026", "application", "architecture", "platform", "platforms",
  "mvp", "development", "service", "in", "at", "on", "of", "is", "an", "as", "it", "by", "if", "or", "so",
  "no", "my", "us", "up", "go", "do", "be", "me", "he", "we"
]);

/**
 * Normalizes a topic title into a core commercial service concept name.
 */
export function normalizeServiceConcept(text = "") {
  const tokens = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  if (tokens.length === 0) return "Custom Web Development";
  return tokens.map((t) => (t === "ai" || t === "ui" || t === "ux" ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1))).join(" ") + " Development";
}

/**
 * Maps relevance score (0-100) to Coverage Level.
 */
export function classifyCoverageLevel(score = 0) {
  if (score >= 90) return "DIRECT";
  if (score >= 75) return "STRONG";
  if (score >= 55) return "PARTIAL";
  if (score >= 30) return "WEAK";
  return "NONE";
}

/**
 * Maps relevance score and slug overlap to Overlap Level.
 */
export function classifyOverlapLevel(serviceMatch) {
  const score = serviceMatch?.overallServiceRelevance || 0;
  if (score >= 90) return "DUPLICATE";
  if (score >= 75) return "HIGH_OVERLAP";
  if (score >= 55) return "MODERATE_OVERLAP";
  if (score >= 30) return "LOW_OVERLAP";
  return "NO_OVERLAP";
}

/**
 * Classifies Opportunity Score (0-100) into Opportunity Levels.
 */
export function classifyOpportunityLevel(score = 0) {
  if (score >= 75) return "HIGH_PRIORITY";
  if (score >= 60) return "PROMISING";
  if (score >= 40) return "WATCH";
  return "IGNORE";
}

/**
 * Core Multi-Signal Service Gap Evaluation.
 * 
 * @param {Object} topicCandidate - Candidate topic payload
 * @param {Object} [options={}] - Custom options / snapshot override
 * @returns {Object} Structured Gap Intelligence Analysis
 */
export function evaluateCandidateServiceGap(topicCandidate = {}, options = {}) {
  try {
    const candidate = topicCandidate || {};
    const title = String(candidate.title || candidate.topic || "").trim();
    const problem = String(candidate.problem || candidate.businessProblem || "").trim();
    const searchIntent = String(candidate.searchIntent || candidate.intent || "informational").toLowerCase();

    // 1. Service Matching & Coverage Analysis via Phase 3 Engine
    const matched = matchTopicToServicesSync(candidate, options);
    const coverageScore = matched.overallServiceRelevance || 0;
    const coverageLevel = classifyCoverageLevel(coverageScore);
    const overlapLevel = classifyOverlapLevel(matched);

    // 2. Commercial Intent Analysis
    let commercialIntent = "INFORMATIONAL";
    if (searchIntent === "transactional" || /hire|pricing|cost|quote|rates|hourly rate/i.test(title)) {
      commercialIntent = "TRANSACTIONAL";
    } else if (searchIntent === "service_evaluation" || /best.*companies|best.*agency|vendor|vs|review/i.test(title)) {
      commercialIntent = "SERVICE_EVALUATION";
    } else if (searchIntent === "solution_evaluation" || /architecture|platform|system|stack/i.test(title)) {
      commercialIntent = "SOLUTION_EVALUATION";
    } else if (searchIntent === "commercial" || searchIntent === "commercial_investigation" || /best|framework|solution/i.test(title)) {
      commercialIntent = "COMMERCIAL_RESEARCH";
    }

    // Pure informational check
    const isPureInformational = commercialIntent === "INFORMATIONAL" && !/problem|solution|saas|app|system|engine/i.test(title);

    // 3. Normalized Service Concept
    const normalizedConcept = candidate.suggestedService || normalizeServiceConcept(title);
    const suggestedSlug = normalizedConcept.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // 4. Multi-Dimensional Opportunity Scoring (0-100)
    let intentWeight = 40;
    if (commercialIntent === "TRANSACTIONAL") intentWeight = 95;
    else if (commercialIntent === "SERVICE_EVALUATION") intentWeight = 90;
    else if (commercialIntent === "SOLUTION_EVALUATION") intentWeight = 75;
    else if (commercialIntent === "COMMERCIAL_RESEARCH") intentWeight = 60;

    const gapScore = Math.max(0, 100 - coverageScore);
    const demandScore = candidate.opportunityScore || candidate.searchOpportunity || 70;
    const businessRelevanceScore = problem ? 85 : 60;
    const overlapPenalty = coverageScore >= 80 ? 40 : coverageScore >= 55 ? 20 : 0;

    let rawOppScore = Math.round(
      intentWeight * 0.25 +
      gapScore * 0.30 +
      demandScore * 0.20 +
      businessRelevanceScore * 0.15 +
      (100 - overlapPenalty) * 0.10
    );

    if (isPureInformational) {
      rawOppScore = Math.min(35, rawOppScore);
    }

    const finalOpportunityScore = Math.min(100, Math.max(0, rawOppScore));
    const opportunityLevel = classifyOpportunityLevel(finalOpportunityScore);

    // 5. Evidence & Reason Generation
    const evidence = [];
    if (coverageLevel === "NONE" || coverageLevel === "WEAK") {
      evidence.push(`Existing service catalog coverage is ${coverageLevel.toLowerCase()} (${coverageScore}% match).`);
    } else {
      evidence.push(`Existing service '${matched.primaryService?.title}' covers ${coverageScore}% of this topic.`);
    }

    if (commercialIntent === "TRANSACTIONAL" || commercialIntent === "SERVICE_EVALUATION") {
      evidence.push(`Strong commercial intent detected (${commercialIntent}).`);
    } else {
      evidence.push(`Topic intent classified as ${commercialIntent}.`);
    }

    if (problem) {
      evidence.push(`Addresses specific business friction: "${problem}".`);
    }

    // 6. Action Recommendation Logic
    let recommendedAction = "CREATE_NEW_SERVICE";
    if (coverageLevel === "DIRECT" || overlapLevel === "DUPLICATE") {
      recommendedAction = "LINK_TO_EXISTING_SERVICE";
    } else if (coverageLevel === "STRONG" || overlapLevel === "HIGH_OVERLAP") {
      recommendedAction = "EXPAND_EXISTING_SERVICE";
    } else if (coverageLevel === "PARTIAL") {
      recommendedAction = "IMPROVE_SERVICE_POSITIONING";
    } else if (isPureInformational || finalOpportunityScore < 40) {
      recommendedAction = "CREATE_SUPPORTING_CONTENT";
    } else if (commercialIntent === "TRANSACTIONAL" || commercialIntent === "SERVICE_EVALUATION") {
      recommendedAction = "CREATE_NEW_SERVICE";
    } else {
      recommendedAction = "CREATE_SUPPORTING_CONTENT";
    }

    return {
      success: true,
      topicTitle: title,
      normalizedConcept,
      suggestedServiceSlug: suggestedSlug,
      coverageLevel,
      coverageScore,
      overlapLevel,
      overlapScore: coverageScore,
      commercialIntent,
      opportunityScore: finalOpportunityScore,
      opportunityLevel,
      recommendedAction,
      evidence,
      matchedServiceSlugs: matched.primaryService ? [matched.primaryService.slug] : [],
      primaryServiceMatch: matched.primaryService,
    };
  } catch (err) {
    console.warn("[serviceGapEngine] Evaluation error:", err.message);
    return {
      success: false,
      topicTitle: topicCandidate?.title || "",
      normalizedConcept: "Custom Service",
      coverageLevel: "NONE",
      coverageScore: 0,
      overlapLevel: "NO_OVERLAP",
      commercialIntent: "INFORMATIONAL",
      opportunityScore: 0,
      opportunityLevel: "IGNORE",
      recommendedAction: "IGNORE",
      evidence: ["Evaluation failed due to system error."],
      matchedServiceSlugs: [],
      error: err.message,
    };
  }
}

/**
 * Clusters a pool of topics and evaluates distinct service opportunities.
 * 
 * @param {Array<Object>} topicsPool - Array of topic candidates
 * @param {Object} [options={}] - Custom options
 * @returns {Array<Object>} Aggregated Service Opportunities
 */
export function clusterAndEvaluateServiceOpportunities(topicsPool = [], options = {}) {
  if (!Array.isArray(topicsPool) || topicsPool.length === 0) return [];

  const clusters = new Map();

  for (const topic of topicsPool) {
    const concept = normalizeServiceConcept(topic.title || topic.topic || "");
    if (!clusters.has(concept)) {
      clusters.set(concept, {
        normalizedConcept: concept,
        topics: [],
        highestOpportunity: 0,
        commercialTopicCount: 0,
      });
    }
    const cluster = clusters.get(concept);
    cluster.topics.push(topic);

    const evalResult = evaluateCandidateServiceGap(topic, options);
    if (evalResult.opportunityScore > cluster.highestOpportunity) {
      cluster.highestOpportunity = evalResult.opportunityScore;
    }
    if (evalResult.commercialIntent === "TRANSACTIONAL" || evalResult.commercialIntent === "SERVICE_EVALUATION") {
      cluster.commercialTopicCount++;
    }
  }

  const results = [];
  for (const [concept, cluster] of clusters.entries()) {
    const representativeTopic = cluster.topics[0];
    const evalResult = evaluateCandidateServiceGap(representativeTopic, options);

    // Boost score if supported by multiple topics in cluster
    const clusterBoost = Math.min(15, (cluster.topics.length - 1) * 5);
    const aggregatedScore = Math.min(100, evalResult.opportunityScore + clusterBoost);

    results.push({
      ...evalResult,
      normalizedConcept: concept,
      clusterTopicCount: cluster.topics.length,
      commercialTopicCount: cluster.commercialTopicCount,
      opportunityScore: aggregatedScore,
      opportunityLevel: classifyOpportunityLevel(aggregatedScore),
      sourceTopicSlugs: cluster.topics.map((t) => t.slug || t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
      evidence: [
        ...evalResult.evidence,
        `Supported by a cluster of ${cluster.topics.length} related topics (${cluster.commercialTopicCount} commercial intent).`,
      ],
    });
  }

  results.sort((a, b) => b.opportunityScore - a.opportunityScore);
  return results;
}

/**
 * Persists evaluated Service Opportunity into MongoDB ServiceOpportunity collection.
 * Checks for existing candidates to prevent duplicates.
 * 
 * @param {Object} topicCandidate - Topic candidate object
 * @param {Object} [options={}] - Custom options
 * @returns {Promise<Object>} Persistence result payload
 */
export async function detectAndLogServiceOpportunity(topicCandidate = {}, options = {}) {
  const gapAnalysis = evaluateCandidateServiceGap(topicCandidate, options);

  // If action is IGNORE or score is low, do not persist
  if (gapAnalysis.recommendedAction === "IGNORE" || gapAnalysis.opportunityScore < 40) {
    return { logged: false, reason: "Insufficient opportunity score or action ignored.", gapAnalysis };
  }

  const opportunityData = {
    topicTitle: gapAnalysis.topicTitle || "Commercial Topic Candidate",
    detectedNeed: topicCandidate.problem || topicCandidate.businessProblem || `Commercial need for ${gapAnalysis.normalizedConcept}`,
    suggestedService: gapAnalysis.normalizedConcept,
    suggestedServiceSlug: gapAnalysis.suggestedServiceSlug,
    targetAudience: topicCandidate.audience || "business_owner",
    targetIndustry: (typeof topicCandidate.industry === "string" ? topicCandidate.industry : topicCandidate.industry?.key) || "general_technology",
    opportunityScore: gapAnalysis.opportunityScore,
    reason: gapAnalysis.evidence.join(" | "),
    normalizedConcept: gapAnalysis.normalizedConcept,
    sourceTopicSlugs: gapAnalysis.suggestedServiceSlug ? [gapAnalysis.suggestedServiceSlug] : [],
    clusterTopicCount: 1,
    coverageLevel: gapAnalysis.coverageLevel,
    coverageScore: gapAnalysis.coverageScore,
    overlapLevel: gapAnalysis.overlapLevel,
    overlapScore: gapAnalysis.overlapScore,
    opportunityLevel: gapAnalysis.opportunityLevel,
    evidence: gapAnalysis.evidence,
    recommendedAction: gapAnalysis.recommendedAction,
    matchedServiceSlugs: gapAnalysis.matchedServiceSlugs,
    status: "candidate",
  };

  try {
    // Duplicate Prevention Check
    const existing = await ServiceOpportunity.findOne({
      $or: [
        { normalizedConcept: gapAnalysis.normalizedConcept },
        { suggestedServiceSlug: gapAnalysis.suggestedServiceSlug },
      ],
    });

    if (existing) {
      // Update existing opportunity with increased topic count and fresh score
      existing.clusterTopicCount = (existing.clusterTopicCount || 1) + 1;
      existing.opportunityScore = Math.max(existing.opportunityScore, gapAnalysis.opportunityScore);
      await existing.save();
      return { logged: true, updatedExisting: true, opportunityId: existing._id, data: opportunityData };
    }

    const created = await ServiceOpportunity.create(opportunityData);
    return { logged: true, createdNew: true, opportunityId: created._id, data: opportunityData };
  } catch (err) {
    console.warn("[serviceGapEngine] Database persistence catch:", err.message);
    return { logged: false, data: opportunityData, error: err.message };
  }
}

/**
 * Preserved Phase 1 function for generating service page improvement patch plans.
 */
export function generateServicePagePatchPlan(service = {}, relatedBlogs = []) {
  const recommendations = [];

  if (!service.faqs || service.faqs.length < 3) {
    recommendations.push({
      type: "missing_section",
      section: "Frequently Asked Questions",
      reason: "Service page has fewer than 3 FAQs. Adding pricing & timeline FAQs improves conversions.",
    });
  }

  if (!service.processSteps || service.processSteps.length === 0) {
    recommendations.push({
      type: "missing_section",
      section: "Delivery Process",
      reason: "Missing step-by-step engagement process section.",
    });
  }

  if (Array.isArray(relatedBlogs) && relatedBlogs.length > 0) {
    recommendations.push({
      type: "internal_link_addition",
      targetBlogsCount: Math.min(5, relatedBlogs.length),
      targetBlogSlugs: relatedBlogs.map((b) => b.slug),
      reason: "Attach educational supporting articles to bolster topical authority.",
    });
  }

  return {
    serviceSlug: service.slug,
    recommendationsCount: recommendations.length,
    recommendations,
    status: "draft_plan",
    generatedAt: new Date().toISOString(),
  };
}
