/**
 * Topic Intelligence Engine Facade (Think10X Architecture)
 * 
 * Master coordinator for Phase 2 Dynamic Topic Intelligence.
 * Orchestrates AI generation -> deterministic validation -> intent/audience classification 
 * -> industry taxonomy -> service relevance -> cannibalization checks -> 9-dimension scoring.
 * 
 * Includes 100% fail-safe fallback to legacy topic creation.
 */

import { generateGeminiResponse } from "../../geminiService.js";
import { getSearchSignals } from "./searchSignalsProvider.js";
import { detectIndustry, evaluateServiceRelevance } from "./industryTaxonomy.js";
import { classifyIntentAndAudience } from "./intentClassifier.js";
import { scoreTopicOpportunity } from "./opportunityEngine.js";
import { analyzeCannibalization } from "./cannibalizationAnalyzer.js";
import { calculateDynamicClusterDepth } from "./clusterPlanner.js";

import { enrichTopicWithIntelligence } from "./topicIntelligence.js";
import { evaluateClusterPotential } from "./clusterDepthEvaluator.js";
import { filterAndValidateClusterPack } from "./clusterValidator.js";
import { evaluateTopicKillCritic } from "./topicKillCritic.js";
import { evaluateBlogServiceRelevance } from "./blogServiceRelevanceEngine.js";
import { classifyConversionIntent, generateBlogToServiceLinkRecommendation } from "./conversionLinkingEngine.js";

export function getEngineMode() {
  const mode = String(process.env.THINK10X_ENGINE_MODE || "OFF").toUpperCase();
  return ["OFF", "SHADOW", "ASSIST", "ACTIVE"].includes(mode) ? mode : "OFF";
}

export function logTopicDecision(event, data) {
  console.log(`[TOPIC_DECISION] [${event}]`, JSON.stringify({
    timestamp: new Date().toISOString(),
    mode: getEngineMode(),
    ...data,
  }));
}

/**
 * Normalizes a legacy topic plan or candidate into unified Think10X format.
 */
export function normalizeLegacyTopic(plan = {}) {
  const intentInfo = classifyIntentAndAudience(plan);
  const serviceInfo = evaluateServiceRelevance(plan);
  const detectedInd = detectIndustry(plan);
  const industryKey = (plan.industry && plan.industry !== "general_technology") ? plan.industry : (detectedInd !== "general_technology" ? detectedInd : null);
  const scoreInfo = scoreTopicOpportunity({ ...plan, serviceRelevance: serviceInfo.serviceRelevance });
  const enriched = enrichTopicWithIntelligence(plan);
  const clusterPlan = evaluateClusterPotential(plan);
  const criticResult = evaluateTopicKillCritic(plan);
  const conversionClass = classifyConversionIntent(plan);
  const serviceRel = evaluateBlogServiceRelevance(plan);
  const linkRec = generateBlogToServiceLinkRecommendation(plan);

  return {
    ...plan,
    topicType: plan.topicType || (plan.articleType === "pillar" ? "technical_pillar" : plan.articleType),
    audience: plan.audience || intentInfo.audienceLabel,
    intent: plan.intent || plan.searchIntent || intentInfo.intent,
    industry: (typeof plan.industry === "string" ? plan.industry : (industryKey || null)),
    serviceRelevance: plan.serviceRelevance ?? (enriched.serviceIntent?.relevant ? enriched.serviceIntent.confidence : 0),
    serviceSlug: plan.serviceSlug || enriched.serviceIntent?.serviceKey || null,
    clusterDepth: plan.clusterDepth ?? clusterPlan.desiredSupportingCount,
    opportunityScore: plan.opportunityScore ?? scoreInfo.score,
    scoreBreakdown: plan.scoreBreakdown || scoreInfo.breakdown,
    confidence: plan.confidence ?? intentInfo.overallConfidence,
    decisionSource: plan.decisionSource || "legacy_fallback",
    audienceProfile: enriched.audienceProfile,
    businessProblem: enriched.businessProblem,
    solutionType: enriched.solutionType,
    serviceIntent: enriched.serviceIntent,
    geoContext: enriched.geoContext,
    clusterMode: plan.clusterMode || clusterPlan.clusterMode,
    desiredSupportingCount: typeof plan.desiredSupportingCount === "number" ? plan.desiredSupportingCount : clusterPlan.desiredSupportingCount,
    maxSupportingCount: typeof plan.maxSupportingCount === "number" ? plan.maxSupportingCount : clusterPlan.maxSupportingCount,
    clusterConfidence: plan.clusterConfidence ?? clusterPlan.confidence,
    clusterRationale: plan.clusterRationale || clusterPlan.rationale,
    scoreConfidence: plan.scoreConfidence ?? scoreInfo.dataConfidence,
    scoreSources: plan.scoreSources || scoreInfo.scoreSources,
    scoreReasons: plan.scoreReasons || scoreInfo.scoreReasons,
    scoringVersion: plan.scoringVersion || scoreInfo.scoringVersion,
    scoringUpdatedAt: plan.scoringUpdatedAt || scoreInfo.scoringUpdatedAt,
    priority: typeof plan.priority === "number" ? plan.priority : Math.min(100, Math.max(0, scoreInfo.score)),
    topicCritic: plan.topicCritic || {
      status: "evaluated",
      decision: criticResult.decision,
      score: criticResult.score,
      confidence: criticResult.confidence,
      reasonCodes: criticResult.reasonCodes,
      strengths: criticResult.strengths,
      risks: criticResult.risks,
      missingSignals: criticResult.missingSignals,
      recommendedAction: criticResult.recommendedAction,
      clusterDecision: criticResult.clusterDecision,
      evaluatedAt: criticResult.evaluatedAt,
      criticVersion: criticResult.criticVersion,
    },
    conversionIntent: plan.conversionIntent || conversionClass,
    serviceRelevanceCategory: plan.serviceRelevanceCategory || serviceRel.category,
    recommendedServiceLink: plan.recommendedServiceLink || linkRec,
  };
}

/**
 * Generates dynamic clusters with variable depth (0 to 8 supporting topics per cluster).
 * Wraps generation in complete fallback protection.
 */
export async function generateDynamicClusterPacks({ targetClusters = 5, avoidText = "" } = {}) {
  const mode = getEngineMode();
  logTopicDecision("REQUEST_DYNAMIC_CLUSTERS", { targetClusters, mode });

  const prompt = `Create ${targetClusters + 1} unique topical-authority cluster candidates for Muhyo Tech.
Muhyo Tech is a professional web engineering, cloud, software, and digital services brand.

Target multiple audience personas: Developers, Tech Leads, CTOs, Startup Founders, Business Owners, E-Commerce Owners, Growth Leads.
Rotate search intents: Informational, Problem-solving, Commercial investigation, Pricing, Comparison.
Supported Industries: ai_saas_tools, home_services_contractors, edtech_coaching, legal_tech, b2b_wholesale, ecommerce, real_estate, healthcare, seo_digital_marketing, developer_portfolios, student_fyps, beauty_wellness, fitness_gyms, automotive, travel_tourism, education, hospitality, restaurants, professional_services, logistics, finance, saas, startups, local_business, general_technology.

Each cluster MUST contain:
- 1 Pillar topic: articleType "pillar", clusterOrder 0.
- Dynamic Supporting topics: 0 to 6 supporting topics depending on topic depth, search intent diversity, and commercial relevance. (Simple topics = 0-1, standard = 2, deep commercial/industry = 3-5).

EXISTING CONTENT TO AVOID:
${avoidText || "None"}

Return strict JSON only:
{
  "clusters": [
    {
      "clusterKey": "unique-kebab-slug",
      "clusterTitle": "Title",
      "industry": { "key": "real_estate", "label": "Real Estate" } or null,
      "businessProblem": { "key": "lead_generation", "label": "Poor Property Lead Management" } or null,
      "pillar": {
        "title": "Full Guide Title",
        "topicType": "technical_pillar|commercial_pillar|industry_pillar",
        "pillar": "Category Label",
        "subtopic": "subtopic",
        "problem": "problem",
        "solutionAngle": "solution",
        "businessValue": "business value",
        "audience": "Founders and developers",
        "audienceProfile": { "type": "business_owner", "label": "Small Business Owner" },
        "industry": { "key": "real_estate", "label": "Real Estate" } or null,
        "businessProblem": { "key": "lead_generation", "label": "Poor Property Lead Management" } or null,
        "solutionType": "custom_web_application",
        "serviceIntent": { "relevant": true, "serviceKey": "custom-website-development", "confidence": 0.9 },
        "geoContext": { "type": "global" },
        "focusKeyword": "focus keyword",
        "searchIntent": "informational|commercial_investigation|problem_solving|pricing",
        "format": "Premium pillar guide",
        "relatedServiceSlugs": ["custom-website-development"],
        "priority": 80
      },
      "supporting": [
        {
          "title": "Supporting Title",
          "topicType": "technical_supporting|service_supporting",
          "pillar": "Category Label",
          "subtopic": "subtopic",
          "problem": "problem",
          "solutionAngle": "solution",
          "businessValue": "business value",
          "audience": "Founders and developers",
          "audienceProfile": { "type": "developer", "label": "Senior Developer" },
          "industry": null,
          "businessProblem": null,
          "solutionType": "technical_fix",
          "serviceIntent": { "relevant": false, "serviceKey": null, "confidence": 0 },
          "geoContext": { "type": "global" },
          "focusKeyword": "focus keyword",
          "searchIntent": "informational|problem_solving",
          "format": "Focused supporting guide",
          "relatedServiceSlugs": [],
          "priority": 70
        }
      ]
    }
  ]
}

STRICT INTELLIGENCE RULES:
- DO NOT force an industry when none exists (set industry to null for purely technical topics like "Fixing Next.js Hydration Errors").
- DO NOT force a business problem into purely technical articles.
- DO NOT force a service connection merely to sell something (set serviceIntent.relevant to false if connection is forced).
- DO NOT turn every technical article into a commercial article.
- DO NOT generate promotional topics disguised as educational content.
- Service relevance must be genuine and semantically justified.`;

  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.75,
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      thinkingBudget: 0,
      timeoutMs: 60000,
    });

    const parsed = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
    const rawPacks = Array.isArray(parsed.clusters) ? parsed.clusters : [];

    const processedPacks = [];

    for (const pack of rawPacks) {
      if (!pack.pillar || !pack.pillar.title || !pack.pillar.focusKeyword || !pack.clusterKey) continue;

      const signals = await getSearchSignals(pack.pillar);
      const pillarIntent = classifyIntentAndAudience(pack.pillar);
      const pillarService = evaluateServiceRelevance(pack.pillar);
      const pillarIndustry = pack.industry || detectIndustry(pack.pillar);
      const pillarScore = scoreTopicOpportunity({ ...pack.pillar, serviceRelevance: pillarService.serviceRelevance }, signals);

      const dynamicDepth = calculateDynamicClusterDepth({
        ...pack.pillar,
        industry: pillarIndustry,
        serviceRelevance: pillarService.serviceRelevance,
      });

      const processedPillar = {
        ...pack.pillar,
        articleType: "pillar",
        clusterKey: pack.clusterKey,
        clusterTitle: pack.clusterTitle || pack.pillar.title,
        clusterOrder: 0,
        topicType: pack.pillar.topicType || "technical_pillar",
        audience: pillarIntent.audienceLabel,
        intent: pillarIntent.intent,
        industry: pillarIndustry,
        serviceRelevance: pillarService.serviceRelevance,
        serviceSlug: pillarService.serviceSlug,
        clusterDepth: dynamicDepth,
        opportunityScore: pillarScore.score,
        scoreBreakdown: pillarScore.breakdown,
        searchSignals: signals,
        confidence: pillarIntent.overallConfidence,
        decisionSource: "think10x_ai",
      };

      const rawSupporting = Array.isArray(pack.supporting) ? pack.supporting : [];
      const processedSupporting = [];

      // Clamp supporting items to dynamic depth limit
      for (let idx = 0; idx < Math.min(rawSupporting.length, Math.max(1, dynamicDepth)); idx++) {
        const sup = rawSupporting[idx];
        if (!sup.title || !sup.focusKeyword) continue;

        const supIntent = classifyIntentAndAudience(sup);
        const supService = evaluateServiceRelevance(sup);
        const supScore = scoreTopicOpportunity({ ...sup, serviceRelevance: supService.serviceRelevance }, signals);

        processedSupporting.push({
          ...sup,
          articleType: "supporting",
          clusterKey: pack.clusterKey,
          clusterTitle: pack.clusterTitle || pack.pillar.title,
          clusterOrder: idx + 1,
          topicType: sup.topicType || "technical_supporting",
          audience: supIntent.audienceLabel,
          intent: supIntent.intent,
          industry: pillarIndustry,
          serviceRelevance: supService.serviceRelevance,
          serviceSlug: supService.serviceSlug,
          clusterDepth: dynamicDepth,
          opportunityScore: supScore.score,
          scoreBreakdown: supScore.breakdown,
          searchSignals: signals,
          confidence: supIntent.overallConfidence,
          decisionSource: "think10x_ai",
        });
      }

      logTopicDecision("CLUSTER_PACK_PROCESSED", {
        clusterKey: pack.clusterKey,
        pillarTitle: processedPillar.title,
        dynamicDepth,
        supportingCount: processedSupporting.length,
        opportunityScore: processedPillar.opportunityScore,
        industry: pillarIndustry,
      });

      processedPacks.push({
        clusterKey: pack.clusterKey,
        clusterTitle: pack.clusterTitle,
        pillar: processedPillar,
        supporting: processedSupporting,
      });
    }

    if (!processedPacks.length) {
      throw new Error("No valid cluster packs survived deterministic intelligence validation.");
    }

    return {
      success: true,
      mode,
      packs: processedPacks.slice(0, targetClusters),
    };
  } catch (error) {
    console.warn("[TopicIntelligenceFacade] Dynamic cluster generation failed. Engaging 100% safe legacy fallback:", error.message);
    logTopicDecision("FALLBACK_TRIGGERED", { error: error.message });
    return {
      success: false,
      mode,
      error: error.message,
      packs: [],
    };
  }
}
