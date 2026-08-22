/**
 * Blog Intelligence Bridge Module
 * 
 * Bridges the New Topic Intelligence System with the Existing Blog Generation Pipeline.
 * Safely extracts, enriches, and formats complete topic intelligence context
 * (Audience Profile, Industry, Business Problem, Solution Type, Service Intent,
 * Search Intent, Cluster Hierarchy, Parent Pillar relationships, and Research Package)
 * for use in writer prompts and database persistence.
 * 
 * 100% backward compatible with legacy topics.
 */

import { enrichTopicWithIntelligence } from "./topicIntelligence.js";

/**
 * Extracts unified, normalized intelligence context from a BlogTopicPlan document or raw topic object.
 * 
 * @param {Object} topicPlan - The BlogTopicPlan document or topic object
 * @returns {Object} Enriched intelligence context payload
 */
export function extractBlogIntelligenceContext(topicPlan = {}) {
  if (!topicPlan) return {};

  const planObj = typeof topicPlan.toObject === "function" ? topicPlan.toObject() : topicPlan;
  const enriched = enrichTopicWithIntelligence(planObj);

  const articleType = enriched.articleType || "supporting";
  const contentCategory = enriched.contentCategory || "core_web_engineering";
  const topicType = enriched.topicType || (articleType === "pillar" ? "technical_pillar" : articleType);
  const clusterKey = enriched.clusterKey || "";
  const clusterTitle = enriched.clusterTitle || enriched.pillar || "";
  const clusterOrder = Number(enriched.clusterOrder || 0);

  // Audience Profile extraction
  const audienceProfile = enriched.audienceProfile || (enriched.audience ? {
    type: String(enriched.audience).toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    label: String(enriched.audience).trim(),
  } : {
    type: "founders_and_developers",
    label: "Founders and developers",
  });

  // Industry extraction
  const industry = enriched.industry || (typeof planObj.industry === "object" ? planObj.industry : (
    typeof planObj.industry === "string" && planObj.industry.trim() && planObj.industry !== "general_technology"
      ? { key: planObj.industry.trim().toLowerCase().replace(/[\s-]+/g, "_"), label: planObj.industry.trim() }
      : null
  ));

  // Business Problem extraction
  const businessProblem = enriched.businessProblem || (typeof planObj.businessProblem === "object" ? planObj.businessProblem : (
    typeof planObj.businessProblem === "string" && planObj.businessProblem.trim()
      ? { key: planObj.businessProblem.trim().toLowerCase().replace(/[\s-]+/g, "_"), label: planObj.businessProblem.trim() }
      : null
  ));

  // Solution Type extraction
  const solutionType = enriched.solutionType || planObj.solutionType || planObj.format || "Problem-solution guide";

  // Service Intent extraction
  const serviceIntent = enriched.serviceIntent || (planObj.serviceIntent && typeof planObj.serviceIntent === "object" ? planObj.serviceIntent : {
    relevant: Boolean(planObj.relatedServiceSlugs && planObj.relatedServiceSlugs.length > 0),
    serviceKey: (planObj.relatedServiceSlugs && planObj.relatedServiceSlugs[0]) || planObj.serviceSlug || null,
    confidence: Number(planObj.serviceRelevance || 0),
  });

  return {
    topicPlanId: planObj._id ? planObj._id.toString() : null,
    title: String(planObj.title || "").trim(),
    articleType,
    contentCategory,
    topicType,
    topicFamily: String(enriched.topicFamily || enriched.subtopic || "").trim(),
    clusterKey,
    clusterTitle,
    clusterOrder,
    clusterDepth: Number(enriched.clusterDepth || (articleType === "pillar" ? 2 : 0)),
    parentTopicId: planObj.parentTopicId ? planObj.parentTopicId.toString() : null,
    parentPillarBlog: enriched.parentPillarBlog || planObj.parentPillarBlog || null,
    pillar: String(enriched.pillar || "Web Development").trim(),
    subtopic: String(enriched.subtopic || "").trim(),
    problem: String(enriched.problem || "").trim(),
    solutionAngle: String(enriched.solutionAngle || "").trim(),
    businessValue: String(enriched.businessValue || "").trim(),
    focusKeyword: String(enriched.focusKeyword || "").trim(),
    searchIntent: String(enriched.searchIntent || enriched.intent || "informational").trim(),
    format: String(enriched.format || "Problem-solution guide").trim(),
    relatedServiceSlugs: Array.isArray(enriched.relatedServiceSlugs) ? enriched.relatedServiceSlugs : [],
    audienceProfile,
    industry,
    businessProblem,
    solutionType,
    serviceIntent,
    geoContext: enriched.geoContext || { type: "global" },
    opportunityScore: Number(enriched.opportunityScore || enriched.priority || 50),
    scoreBreakdown: enriched.scoreBreakdown || {},
    decisionSource: enriched.decisionSource || "think10x_ai",
    isTrend: Boolean(enriched.isTrend),
    trendPlan: enriched.isTrend ? {
      articleType: enriched.articleType,
      isTrend: true,
      verificationScore: enriched.verificationScore,
      verifiedClaims: enriched.verifiedClaims || [],
      prohibitedClaims: enriched.prohibitedClaims || [],
      officialSources: enriched.officialSources || [],
      sourceVerifiedAt: enriched.sourceVerifiedAt,
      lastReverifiedAt: enriched.lastReverifiedAt,
      expiresAt: enriched.expiresAt,
    } : null,
  };
}

/**
 * Formats complete intelligence context into a rich, structured prompt string for the AI Writer.
 * Optionally includes Phase 2 Research Context if research is available.
 * 
 * @param {Object} topicPlan - The BlogTopicPlan document or raw topic object
 * @param {Object} [researchPackage=null] - Optional Research Package from Phase 2 Research Engine
 * @returns {string} Formatted prompt context string
 */
export function buildWriterContextFromTopicPlan(topicPlan = {}, researchPackage = null) {
  const ctx = extractBlogIntelligenceContext(topicPlan);

  const parts = [
    `Article type: ${ctx.articleType.toUpperCase()} (${ctx.topicType})`,
    `Professional category: ${ctx.contentCategory}`,
    `Content cluster: ${ctx.clusterTitle || ctx.pillar}`,
    `Title direction: "${ctx.title}"`,
    `Pillar: ${ctx.pillar}`,
    `Specific subtopic: ${ctx.subtopic}`,
    `Problem: ${ctx.problem}`,
    `Engineering solution angle: ${ctx.solutionAngle}`,
    `Business value: ${ctx.businessValue}`,
    `Audience persona: ${ctx.audienceProfile?.label || "Founders and developers"}`,
    `Primary search query: ${ctx.focusKeyword}`,
    `Search intent: ${ctx.searchIntent}`,
    `Article format: ${ctx.format}`,
  ];

  if (ctx.industry?.label) {
    parts.push(`Industry context: ${ctx.industry.label} (${ctx.industry.key})`);
  }

  if (ctx.businessProblem?.label) {
    parts.push(`Business pain point: ${ctx.businessProblem.label}`);
  }

  if (ctx.solutionType) {
    parts.push(`Solution delivery format: ${ctx.solutionType}`);
  }

  if (ctx.serviceIntent?.relevant && ctx.serviceIntent.serviceKey) {
    parts.push(`Primary service connection: /services/${ctx.serviceIntent.serviceKey} (Relevance confidence: ${Math.round((ctx.serviceIntent.confidence || 0.8) * 100)}%)`);
  }

  if (ctx.relatedServiceSlugs && ctx.relatedServiceSlugs.length > 0) {
    parts.push(`Relevant service slugs for contextual internal links: ${ctx.relatedServiceSlugs.join(", ")}`);
  } else {
    parts.push(`Relevant service slugs for contextual internal links: none`);
  }

  if (ctx.parentPillarBlog && ctx.parentPillarBlog.title && ctx.parentPillarBlog.slug) {
    parts.push(`Parent pillar article: "${ctx.parentPillarBlog.title}" at /blog/${ctx.parentPillarBlog.slug}. Link to it naturally as the foundational guide.`);
  }

  if (ctx.isTrend && ctx.trendPlan) {
    parts.push(`This is a verified trend article. Use only these verified claims: ${(ctx.trendPlan.verifiedClaims || []).join(" | ")}.`);
    if (ctx.trendPlan.officialSources && ctx.trendPlan.officialSources.length > 0) {
      parts.push(`Official sources: ${ctx.trendPlan.officialSources.map((s) => `${s.title}: ${s.url}`).join(" | ")}. Never add unsupported release facts.`);
    }
  }

  // OPTIONAL PHASE 2 RESEARCH CONTEXT INJECTION
  if (researchPackage && researchPackage.status !== "unavailable" && researchPackage.researchConfidence > 0) {
    const resParts = [
      `RESEARCH CONTEXT (Supporting Evidence - Research Confidence: ${Math.round(researchPackage.researchConfidence * 100)}%):`,
    ];

    if (researchPackage.questions && researchPackage.questions.length > 0) {
      resParts.push(`Common User & Developer Questions to Address: ${researchPackage.questions.slice(0, 4).join(" | ")}`);
    }

    if (researchPackage.contentGaps?.opportunityAreas && researchPackage.contentGaps.opportunityAreas.length > 0) {
      resParts.push(`Key Content Gaps & Opportunities to Fulfill: ${researchPackage.contentGaps.opportunityAreas.slice(0, 3).join(" | ")}`);
    }

    if (researchPackage.claims && researchPackage.claims.length > 0) {
      resParts.push(`Verified Factual Claims & Technical Standards: ${researchPackage.claims.map((c) => c.claim).join(" | ")}`);
    }

    resParts.push(`IMPORTANT RESEARCH RULES: Use research as supporting background context. Do not copy source text or imitate competitor writing style. Do not invent unsupported claims. Prefer official sources.`);

    parts.push("\n" + resParts.join("\n"));
  }

  return parts.join(". ") + ".";
}
