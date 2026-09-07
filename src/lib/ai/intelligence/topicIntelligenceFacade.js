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
import { sanitizeTopicTitle } from "../blog/titleSanitizer.js";

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

70% CLIENT & INDUSTRY ACQUISITION / 30% TECHNICAL AUTHORITY MANDATE:
- Exactly 70% of the clusters MUST be anchored in a specific commercial industry chosen from the Supported Industries below.
  These industry clusters target Business Owners, Founders, Clinic Operators, Contractors, and Store Owners.
  They must address high-value business bottlenecks (e.g. lost leads, manual quoting, low mobile conversion, slow appointment booking, MLS lag) and show how Muhyo Tech's custom web applications, Next.js engineering, or custom dashboards definitively solve them.
- The remaining 30% of clusters must be deep technical and software architecture authority topics (targeting CTOs, Tech Leads, and Senior Developers for Google E-E-A-T and technical trust).

SUPPORTED COMMERCIAL INDUSTRIES TO ACTIVELY ROTATE:
ai_saas_tools, home_services_contractors, edtech_coaching, legal_tech, b2b_wholesale, ecommerce, real_estate, healthcare, seo_digital_marketing, developer_portfolios, student_fyps, beauty_wellness, fitness_gyms, automotive, travel_tourism, education, hospitality, restaurants, professional_services, logistics, finance, saas, startups, local_business, general_technology.

ALLOWED SERVICES FOR SERVICE INTENT:
custom-website-development, mern-stack-web-development, nextjs-website-development, full-stack-web-app-development, admin-dashboard-development, e-commerce-website-development, portfolio-website-development, landing-page-design, website-redesign, api-integration, database-integration, seo-friendly-website-setup, website-speed-optimization, maintenance-support.

Each cluster MUST contain:
- 1 Pillar topic: articleType "pillar", clusterOrder 0.
- Dynamic Supporting topics: 1 to 4 supporting topics that directly expand the pillar's domain. For industry pillars, supporting topics must explore specific workflows, features, or technical sub-problems within that same industry.

EXISTING CONTENT TO AVOID:
${avoidText || "None"}

Return strict JSON only:
{
  "clusters": [
    {
      "clusterKey": "unique-kebab-slug",
      "clusterTitle": "Title",
      "industry": { "key": "home_services_contractors", "label": "Home Services & Contractors" },
      "businessProblem": { "key": "slow_quoting", "label": "Manual Quoting and Missed Estimate Leads" },
      "pillar": {
        "title": "Full Guide Title",
        "topicType": "commercial_pillar|industry_pillar|technical_pillar",
        "pillar": "Category Label",
        "subtopic": "subtopic",
        "problem": "Specific commercial or technical problem",
        "solutionAngle": "Specific web engineering solution",
        "businessValue": "Measurable business ROI or operational benefit",
        "audience": "Contractors and business owners",
        "audienceProfile": { "type": "business_owner", "label": "Contractor & Business Owner" },
        "industry": { "key": "home_services_contractors", "label": "Home Services & Contractors" },
        "businessProblem": { "key": "slow_quoting", "label": "Manual Quoting and Missed Estimate Leads" },
        "solutionType": "custom_web_application",
        "serviceIntent": { "relevant": true, "serviceKey": "custom-website-development", "confidence": 0.9 },
        "geoContext": { "type": "global" },
        "focusKeyword": "focus keyword",
        "searchIntent": "commercial|problem_solving|pricing",
        "format": "Comprehensive industry solution guide",
        "relatedServiceSlugs": ["custom-website-development"],
        "priority": 85
      },
      "supporting": [
        {
          "title": "Supporting Title within Same Industry",
          "topicType": "service_supporting|technical_supporting",
          "pillar": "Category Label",
          "subtopic": "subtopic",
          "problem": "problem",
          "solutionAngle": "solution",
          "businessValue": "business value",
          "audience": "Contractors and business owners",
          "audienceProfile": { "type": "business_owner", "label": "Contractor & Business Owner" },
          "industry": { "key": "home_services_contractors", "label": "Home Services & Contractors" },
          "businessProblem": { "key": "slow_quoting", "label": "Manual Quoting and Missed Estimate Leads" },
          "solutionType": "instant_quote_calculator",
          "serviceIntent": { "relevant": true, "serviceKey": "custom-website-development", "confidence": 0.85 },
          "geoContext": { "type": "global" },
          "focusKeyword": "focus keyword",
          "searchIntent": "problem_solving|commercial",
          "format": "Practical implementation guide",
          "relatedServiceSlugs": ["custom-website-development"],
          "priority": 75
        }
      ]
    }
  ]
}

DYNAMIC & UNIQUE TITLE CRAFTING MANDATE (CRITICAL):
- ABSOLUTELY ZERO ROBOTIC TEMPLATES OR FORMULAIC STOCK OPENERS:
  * NEVER start any title with "Beyond..." or "Beyond the..." (STRICTLY PROHIBITED for both pillars and supporting topics).
  * NEVER use robotic formulas like "Beyond [X]: Engineering [Y] for [Z]" or "[Concept]: Engineering a [Thing]".
  * NEVER start titles with "Engineering...", "Architecting...", "Mastering...", "Demystifying...", "Unlocking...", "Navigating...", "The Complete Guide...", or "A Deep Dive into...".
  * DO NOT stuff the word "Engineering" or "Architecting" repeatedly into titles or subtitles (e.g. avoid ": Engineering an?...", ": An Engineering Guide for..."). Use diverse, dynamic verbs and nouns: "Building", "Scaling", "Deploying", "Solving", "Automating", "Fixing", "Eliminating", "Real-Time Pipeline", "Production Blueprint", "Architecture Decisions".
- UNIQUE, BESPOKE HEADLINES FOR EVERY TOPIC:
  * Every pillar parent AND supporting child must have a completely unique, natural, human headline that feels like an article from Stripe, Vercel, or Figma.
  * Pillar titles must be authoritative, comprehensive, and commercially compelling.
  * Child/supporting titles must be specific, actionable, and focus directly on a distinct technical mechanism, concrete sub-problem, or client workflow without repeating words from the pillar title.
  * Dynamically vary headline styles across clusters (problem-to-outcome, automation ROI, system design deep-dives, metric-driven case studies).

STRICT INTELLIGENCE RULES:
- When an industry is selected, ensure the problem and solution are tailored specifically to that sector's operational reality.
- Maintain high engineering credibility: explain the actual tech stack, database, or API mechanism that makes the business solution reliable.
- Service relevance must be genuine and semantically justified without hollow marketing slogans.`;

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

      const sanitizedPillarTitle = sanitizeTopicTitle(pack.pillar.title, pack.pillar);
      const sanitizedClusterTitle = sanitizeTopicTitle(pack.clusterTitle || sanitizedPillarTitle, pack.pillar);
      const pillarSubtopic = String(pack.pillar.subtopic || pack.pillar.topicFamily || pack.pillar.focusKeyword || "Core Architecture").trim();

      const processedPillar = {
        ...pack.pillar,
        title: sanitizedPillarTitle,
        subtopic: pillarSubtopic,
        articleType: "pillar",
        clusterKey: pack.clusterKey,
        clusterTitle: sanitizedClusterTitle,
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
        const sanitizedSupTitle = sanitizeTopicTitle(sup.title, sup);
        const supSubtopic = String(sup.subtopic || sup.topicFamily || sup.focusKeyword || pillarSubtopic || "Architecture Strategy").trim();

        processedSupporting.push({
          ...sup,
          title: sanitizedSupTitle,
          subtopic: supSubtopic,
          articleType: "supporting",
          clusterKey: pack.clusterKey,
          clusterTitle: sanitizedClusterTitle,
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
