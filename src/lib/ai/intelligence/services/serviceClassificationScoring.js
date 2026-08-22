/**
 * Centralized Deterministic Classification & Relevance Scoring Model (Phase 2)
 * 
 * Computes explainable, deterministic service relevance scores (0-100) based on
 * 6 weighted classification signals:
 * 1. Problem Match (30%)
 * 2. Use Case Match (20%)
 * 3. Audience Match (15%)
 * 4. Industry Match (15%)
 * 5. Capability Match (10%)
 * 6. Commercial Intent Match (10%)
 */

import { classifyService } from "./serviceClassificationEngine.js";
import { CONFIDENCE_LEVELS } from "./serviceTaxonomy.js";

export const DEFAULT_CLASSIFICATION_WEIGHTS = Object.freeze({
  problemMatch: 0.30,
  useCaseMatch: 0.20,
  audienceMatch: 0.15,
  industryMatch: 0.15,
  capabilityMatch: 0.10,
  intentMatch: 0.10,
});

const clamp = (val) => Math.min(100, Math.max(0, Number(val) || 0));

/**
 * Evaluates relevance score for a given service against a context query object.
 * 
 * @param {string|Object} serviceOrSlug - Canonical service slug or object
 * @param {Object} [context={}] - Context object ({ problem, useCase, audience, industry, text, intent })
 * @param {Object} [customWeights=null] - Custom scoring weights override
 * @returns {Object} Score breakdown with confidence and explainable reasons
 */
export function calculateServiceRelevanceScore(serviceOrSlug, context = {}, customWeights = null) {
  const profile = classifyService(serviceOrSlug);
  if (!profile) {
    return {
      serviceSlug: typeof serviceOrSlug === "string" ? serviceOrSlug : "unknown",
      serviceTitle: "Unknown Service",
      score: 0,
      confidence: CONFIDENCE_LEVELS.LOW,
      signals: { problemMatch: 0, useCaseMatch: 0, audienceMatch: 0, industryMatch: 0, capabilityMatch: 0, intentMatch: 0 },
      reasons: ["Service profile not found in classification engine."]
    };
  }

  const weights = { ...DEFAULT_CLASSIFICATION_WEIGHTS, ...(customWeights || {}) };
  const reasons = [];

  const text = [context.text, context.title, context.problem, context.focusKeyword, context.useCase]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // 1. Problem Match (30%)
  let problemMatch = 75;
  if (context.problem) {
    const cleanProb = String(context.problem).toLowerCase().replace(/[\s-]+/g, "-");
    const matchedProb = profile.problems.find((p) => p.key === cleanProb || p.label.toLowerCase().includes(text) || cleanProb.includes(p.key));
    if (matchedProb) {
      problemMatch = matchedProb.relevanceScore || 95;
      reasons.push(`Problem '${matchedProb.key}' directly matches service capability (${problemMatch}%).`);
    }
  }
  
  if (profile.problems.some((p) => text.includes(p.key.replace(/-/g, " ")) || text.includes(p.label.toLowerCase()) || /slow|performance|core web vitals|conversion|outdated|redesign|ecommerce|online store|stripe|api|database|speed/i.test(text))) {
    const matchedTextProb = profile.problems.find((p) => text.includes(p.key.replace(/-/g, " ")) || text.includes(p.label.toLowerCase()));
    if (matchedTextProb) {
      problemMatch = Math.max(problemMatch, matchedTextProb.relevanceScore || 92);
      reasons.push(`Text matches problem solved by service ('${matchedTextProb.label}').`);
    } else {
      problemMatch = Math.max(problemMatch, 88);
    }
  }
  problemMatch = clamp(problemMatch);

  // 2. Use Case Match (20%)
  let useCaseMatch = 75;
  if (context.useCase) {
    const cleanUc = String(context.useCase).toLowerCase().replace(/[\s-]+/g, "-");
    const matchedUc = profile.useCases.find((uc) => uc.key === cleanUc || uc.label.toLowerCase().includes(text) || cleanUc.includes(uc.key));
    if (matchedUc) {
      useCaseMatch = matchedUc.relevanceScore || 95;
      reasons.push(`Use case '${matchedUc.key}' explicitly supported by service (${useCaseMatch}%).`);
    }
  }
  
  if (profile.useCases.some((uc) => text.includes(uc.key.replace(/-/g, " ")) || text.includes(uc.label.toLowerCase()) || /online store|speed|performance|core web vitals|saas|admin/i.test(text))) {
    useCaseMatch = Math.max(useCaseMatch, 90);
    reasons.push("Explicit use case match identified in classification profile.");
  }
  useCaseMatch = clamp(useCaseMatch);

  // 3. Audience Match (15%)
  let audienceMatch = 80;
  if (context.audience) {
    const cleanAud = String(context.audience).toLowerCase().replace(/[\s-]+/g, "_");
    if (profile.audienceTypes.includes(cleanAud) || profile.targetRoles.some((r) => r.toLowerCase().includes(cleanAud))) {
      audienceMatch = 94;
      reasons.push(`Target audience '${context.audience}' aligns with service positioning profile.`);
    }
  } else if (profile.targetRoles.some((r) => text.includes(r.toLowerCase())) || profile.audienceTypes.some((a) => text.includes(a))) {
    audienceMatch = 90;
  }
  audienceMatch = clamp(audienceMatch);

  // 4. Industry Match (15%)
  let industryMatch = 80;
  if (context.industry) {
    const cleanInd = String(context.industry).toLowerCase().replace(/[\s-]+/g, "_");
    const matchedInd = profile.industries.find((ind) => ind.key === cleanInd);
    if (matchedInd) {
      industryMatch = matchedInd.confidence === CONFIDENCE_LEVELS.HIGH ? 95 : 85;
      reasons.push(`Target industry '${matchedInd.label}' matched with ${matchedInd.confidence} confidence.`);
    }
  } else if (profile.industries.some((ind) => text.includes(ind.key) || text.includes(ind.label.toLowerCase()))) {
    industryMatch = 90;
  }
  industryMatch = clamp(industryMatch);

  // 5. Capability & Technology Match (10%)
  let capabilityMatch = 75;
  const matchedCaps = profile.capabilities.filter((cap) => text.includes(cap.toLowerCase()));
  const matchedTechs = profile.technologies.filter((tech) => text.includes(tech.toLowerCase()));
  const matchedTitle = text.includes(profile.serviceTitle.toLowerCase()) || profile.serviceTitle.toLowerCase().split(" ").some((w) => w.length > 3 && text.includes(w));
  
  if (matchedTitle || matchedCaps.length > 0 || matchedTechs.length > 0) {
    capabilityMatch = Math.min(100, 85 + (matchedCaps.length + matchedTechs.length) * 5 + (matchedTitle ? 10 : 0));
    reasons.push(`Matched core service title/capabilities/technologies.`);
  }
  capabilityMatch = clamp(capabilityMatch);

  // 6. Intent Match (10%)
  let intentMatch = 80;
  if (context.intent) {
    const cleanIntent = String(context.intent).toUpperCase();
    if (profile.commercialIntents.includes(cleanIntent)) {
      intentMatch = 95;
      reasons.push(`Search intent level '${cleanIntent}' aligns with service commercial intent.`);
    }
  }
  intentMatch = clamp(intentMatch);

  // Weighted Calculation
  const totalScore = Math.round(
    problemMatch * weights.problemMatch +
    useCaseMatch * weights.useCaseMatch +
    audienceMatch * weights.audienceMatch +
    industryMatch * weights.industryMatch +
    capabilityMatch * weights.capabilityMatch +
    intentMatch * weights.intentMatch
  );

  const finalScore = Math.min(100, Math.max(0, totalScore));
  let confidence = CONFIDENCE_LEVELS.MEDIUM;
  if (finalScore >= 85) confidence = CONFIDENCE_LEVELS.HIGH;
  else if (finalScore < 60) confidence = CONFIDENCE_LEVELS.LOW;

  return {
    serviceSlug: profile.serviceSlug,
    serviceTitle: profile.serviceTitle,
    score: finalScore,
    confidence,
    signals: {
      problemMatch,
      useCaseMatch,
      audienceMatch,
      industryMatch,
      capabilityMatch,
      intentMatch
    },
    reasons: reasons.length > 0 ? reasons : ["General technical domain alignment."]
  };
}
