/**
 * Topic Intelligence Master Coordinator (Phase 4)
 * 
 * Synthesizes Audience Profile, Industry Taxonomy, Business Problem Taxonomy, 
 * Solution Type, Service Intent, and Geo Context into unified, validated topic metadata.
 */

import { normalizeIndustry, detectIndustry } from "./industryTaxonomy.js";
import { normalizeBusinessProblem, detectBusinessProblem } from "./businessProblemTaxonomy.js";
import { matchServiceForTopic } from "./serviceMatcher.js";
import { validateTopicIntelligence } from "./topicIntelligenceValidation.js";

export function enrichTopicWithIntelligence(rawTopic = {}) {
  // Extract or derive Audience Profile
  let audienceProfile = null;
  if (rawTopic.audienceProfile && typeof rawTopic.audienceProfile === "object") {
    audienceProfile = rawTopic.audienceProfile;
  } else if (rawTopic.audience && typeof rawTopic.audience === "string") {
    const audStr = rawTopic.audience.trim();
    audienceProfile = {
      type: audStr.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      label: audStr,
    };
  }

  // Extract or derive Industry
  let industry = normalizeIndustry(rawTopic.industry);
  if (!industry && rawTopic.industry !== null) {
    const detectedKey = detectIndustry(rawTopic);
    if (detectedKey && detectedKey !== "general_technology") {
      industry = normalizeIndustry(detectedKey);
    }
  }

  // Extract or derive Business Problem
  let businessProblem = normalizeBusinessProblem(rawTopic.businessProblem);
  if (!businessProblem && rawTopic.businessProblem !== null) {
    const detectedProb = detectBusinessProblem(rawTopic);
    if (detectedProb) {
      businessProblem = detectedProb;
    }
  }

  // Extract or derive Solution Type
  let solutionType = rawTopic.solutionType || rawTopic.format || null;
  if (typeof solutionType === "string") {
    solutionType = solutionType.trim();
  }

  // Derive Service Intent using Service Matcher
  let serviceIntent = null;
  if (rawTopic.serviceIntent && typeof rawTopic.serviceIntent === "object") {
    serviceIntent = matchServiceForTopic(rawTopic);
  } else {
    serviceIntent = matchServiceForTopic(rawTopic);
  }

  // Geo Context
  let geoContext = rawTopic.geoContext || { type: "global" };

  const rawMetadata = {
    audienceProfile,
    industry,
    businessProblem,
    solutionType,
    serviceIntent,
    geoContext,
  };

  // Run through strict validation & fallback layer
  const cleaned = validateTopicIntelligence(rawMetadata, rawTopic.title || "Untitled Topic");

  return {
    ...rawTopic,
    audienceProfile: cleaned.audienceProfile,
    industry: cleaned.industry,
    businessProblem: cleaned.businessProblem,
    solutionType: cleaned.solutionType,
    serviceIntent: cleaned.serviceIntent,
    geoContext: cleaned.geoContext,
  };
}
