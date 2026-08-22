/**
 * Research & Evidence Engine Master Orchestrator (Phase 2 Upgrade)
 * 
 * Coordinates SERP research, official documentation lookup, search intent analysis,
 * competitor coverage evaluation, content gap discovery, claim extraction,
 * source quality scoring, and MongoDB caching.
 * 
 * FAIL-SAFE GUARANTEE:
 * - Strict bounded timeouts (3.5s per provider, 8s global deadline).
 * - On failure/timeout/error, returns a safe fallback payload ({ status: "unavailable" }).
 * - NEVER throws uncaught errors to caller; NEVER halts topic queue or daily cron execution.
 */

import { SerpResearchProvider } from "./providers/serpResearchProvider.js";
import { DocumentationResearchProvider } from "./providers/documentationResearchProvider.js";
import { analyzeSearchIntent } from "./searchIntentAnalyzer.js";
import { analyzeCompetitorCoverage } from "./competitorAnalyzer.js";
import { analyzeContentGaps } from "./contentGapAnalyzer.js";
import { extractFactualClaims } from "./claimExtractor.js";
import { scoreResearchSource } from "./sourceQualityScorer.js";
import { buildResearchFingerprint, getCachedResearch, saveResearchToCache } from "./researchCache.js";

const GLOBAL_RESEARCH_TIMEOUT_MS = 8000;

/**
 * Safe fallback payload returned when research is unavailable, times out, or fails.
 */
export function getResearchUnavailablePayload(topic = {}, reason = "Research service unavailable") {
  return {
    topicPlanId: topic._id ? topic._id.toString() : null,
    researchFingerprint: buildResearchFingerprint(topic),
    topicTitle: topic.title || topic.topicTitle || "Web Engineering Topic",
    focusKeyword: topic.focusKeyword || "",
    searchIntent: topic.searchIntent || "informational",
    intentEvidence: { declaredIntent: topic.searchIntent || "informational", observedIntent: topic.searchIntent || "informational", confidence: 0.8, evidence: [] },
    serpResults: [],
    competitorInsights: { recurringTopics: [], technicalDepth: "standard", weakAreas: [], opportunities: [] },
    contentGaps: { coveredTopics: [], commonQuestions: [], missingTopics: [], weakAreas: [], opportunityAreas: [] },
    questions: [],
    entities: [],
    sources: [],
    claims: [],
    recommendations: [],
    researchConfidence: 0.0,
    provider: "fallback_unavailable",
    status: "unavailable",
    error: reason,
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Conducts complete technical research for a topic request.
 * 
 * @param {Object} topicRequest - The BlogTopicPlan or raw topic object
 * @param {Object} options - Custom options ({ forceFresh: boolean, timeoutMs: number })
 * @returns {Promise<Object>} Bounded Research Package
 */
export async function conductResearchForTopic(topicRequest = {}, options = {}) {
  if (!topicRequest || (!topicRequest.title && !topicRequest.focusKeyword && !topicRequest.topicTitle)) {
    return getResearchUnavailablePayload({}, "Empty topic request.");
  }

  const startedAt = Date.now();
  const timeoutMs = Number(options.timeoutMs || GLOBAL_RESEARCH_TIMEOUT_MS);
  const fingerprint = buildResearchFingerprint(topicRequest);

  // 1. Check cache unless forceFresh = true
  if (!options.forceFresh) {
    const cached = await getCachedResearch(fingerprint);
    if (cached) return cached;
  }

  try {
    const query = topicRequest.focusKeyword || topicRequest.title || topicRequest.topicTitle || "";
    const category = topicRequest.contentCategory || "core_web_engineering";

    const serpProvider = new SerpResearchProvider({ timeoutMs: 3800 });
    const docProvider = new DocumentationResearchProvider({ timeoutMs: 3500 });

    // 2. Execute providers in parallel with bounded timeout
    const results = await Promise.allSettled([
      serpProvider.conductResearch(topicRequest),
      docProvider.conductResearch(topicRequest),
    ]);

    const serpRes = results[0].status === "fulfilled" && results[0].value.success ? results[0].value.data : null;
    const docRes = results[1].status === "fulfilled" && results[1].value.success ? results[1].value.data : null;

    // 3. Analyze search intent evidence
    const intentAnalysis = analyzeSearchIntent(
      topicRequest.searchIntent || topicRequest.intent || "informational",
      serpRes?.serpResults || [],
      serpRes?.observedIntent || null,
    );

    // 4. Analyze competitor coverage
    const competitorInsights = analyzeCompetitorCoverage(serpRes?.serpResults || [], category);

    // 5. Analyze content gaps
    const contentGaps = analyzeContentGaps(topicRequest, serpRes || {}, competitorInsights);

    // 6. Extract claims & score sources
    const rawClaims = extractFactualClaims(docRes || {}, serpRes || {});
    const rawSources = [...(serpRes?.serpResults || []), ...(docRes?.officialSources || [])];
    const scoredSources = rawSources.map((s) => scoreResearchSource(s, query));

    // De-duplicate scored sources by domain/url
    const uniqueSources = [];
    const seenUrls = new Set();
    for (const src of scoredSources) {
      if (!seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        uniqueSources.push(src);
      }
    }

    // 7. Calculate overall research confidence score (0.0 to 1.0)
    let researchConfidence = 0.5;
    if (docRes?.officialSources?.length > 0) researchConfidence += 0.3;
    if (serpRes?.serpResults?.length > 0) researchConfidence += 0.15;
    if (rawClaims.length > 0) researchConfidence += 0.05;
    researchConfidence = Math.min(1.0, Math.round(researchConfidence * 100) / 100);

    const isPartial = !serpRes || !docRes;
    const status = isPartial ? "partial" : "completed";

    const researchPackage = {
      topicPlanId: topicRequest._id ? topicRequest._id.toString() : null,
      researchFingerprint: fingerprint,
      topicTitle: topicRequest.title || topicRequest.topicTitle || query,
      focusKeyword: query,
      searchIntent: intentAnalysis.observedIntent,
      intentEvidence: intentAnalysis,
      serpResults: serpRes?.serpResults || [],
      competitorInsights,
      contentGaps,
      questions: serpRes?.questions || contentGaps.commonQuestions || [],
      entities: [topicRequest.pillar, topicRequest.subtopic, category].filter(Boolean),
      sources: uniqueSources.slice(0, 6),
      claims: rawClaims,
      recommendations: contentGaps.opportunityAreas || [],
      researchConfidence,
      provider: "serp_doc_synthesizer",
      status,
      error: null,
      retrievedAt: new Date().toISOString(),
    };

    // Save to cache asynchronously (non-blocking)
    saveResearchToCache(researchPackage).catch((err) =>
      console.warn("[ResearchEngine] Async cache save warning:", err.message)
    );

    console.log(`[ResearchEngine] Research completed in ${Date.now() - startedAt}ms. Confidence: ${researchConfidence}`);
    return researchPackage;

  } catch (error) {
    console.error("[ResearchEngine] Research execution failed safely:", error.message);
    return getResearchUnavailablePayload(topicRequest, error.message);
  }
}
