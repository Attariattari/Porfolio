/**
 * Content Generation Context Builder (Phase 4 Upgrade)
 * 
 * Assembles a unified, normalized Content Generation Context payload combining:
 * - BlogTopicPlan metadata & cluster structure
 * - Phase 2 Technical Research Package
 * - Phase 3 Article Blueprint
 * - SEO guidance & intent requirements
 * - Muhyo Tech brand & editorial rules
 * - Critic retry feedback & previous draft refinements
 * 
 * FAIL-SAFE GUARANTEE:
 * - Gracefully handles missing optional intelligence inputs (research/blueprint).
 * - Never throws uncaught errors.
 */

import { extractBlogIntelligenceContext } from "../intelligence/blogIntelligenceBridge.js";

export const CATEGORY_WRITING_GUIDANCE = Object.freeze({
  core_web_engineering: "Prioritize production web architecture, implementation boundaries, maintainability and concrete engineering trade-offs.",
  software_architecture: "Frame the article as a durable architecture decision: context, constraints, options, failure modes, trade-offs and a practical selection framework.",
  saas_product_engineering: "Connect product and engineering choices without inventing commercial results. Cover validation, operational workflow, maintainability, cost/risk and staged decisions for founders and product teams.",
  cloud_devops_reliability: "Use production-safe operational reasoning. Cover deployment, observability, rollback, failure recovery, ownership and cost trade-offs without fabricated incidents or benchmarks.",
  ai_software_development: "Separate probabilistic model behavior from deterministic application controls. Cover validation, privacy, security, human review, fallback, observability and cost without AI hype.",
  technical_seo_growth: "Tie every recommendation to crawlability, indexation, performance or visible user value. Never promise rankings, traffic, leads or revenue.",
  uiux_accessibility: "Explain user tasks, interaction states, accessibility, recovery and implementation constraints. Avoid subjective design claims presented as measured outcomes.",
  verified_trend: "Explain only the verified release, who is affected, practical implications, adoption/migration decisions and limitations supported by the supplied official evidence.",
});

export const BRAND_POSITIONING = `
Muhyo Tech is a professional software and web engineering brand focused on modern websites, portfolio/business sites, web apps, digital services, AI-assisted workflows, performance, SEO, deployment, automation, and scalable systems.
Blogs should help visitors trust Muhyo Tech as a practical engineering partner: technical enough for developers, clear enough for founders and business owners, and useful enough to share.
Connect each article to real client value: faster launches, stronger reliability, better UX, improved discoverability, lower maintenance risk, automation, and long-term scalability.
Never invent named clients, fake numbers, awards, or case-study results. When discussing Muhyo Tech work, frame it as our approach, our standards, our lessons, or realistic engineering scenarios.
`;

export const PROBLEM_SOLUTION_EDITORIAL_MODE = `
Prefer problem-solution blog angles often, without making every article identical.
Strong Muhyo Tech blogs should usually start from a real pain: slow websites, fragile deployments, poor SEO, messy admin workflows, confusing UX, unreliable forms, scaling bottlenecks, security gaps, manual business processes, or AI workflow confusion.
Then show the engineering response: diagnosis, architecture choice, automation, testing, performance work, UX simplification, monitoring, security hardening, or AI-assisted workflow design.
Finally connect it to business value: faster launch, fewer bugs, better customer trust, easier content updates, lower downtime, stronger SEO, cleaner operations, easier scaling, or less owner stress.
Use "we learned", "we approach", "we design", or "we look for" language. Do not claim fake client results or pretend every story happened exactly as written.
`;

/**
 * Builds a unified, normalized Content Generation Context object.
 * 
 * @param {Object} params - Generation parameters
 * @param {Object} [params.topicPlan] - BlogTopicPlan document or raw topic object
 * @param {Object} [params.researchPackage] - Phase 2 Research Package
 * @param {Object} [params.articleBlueprint] - Phase 3 Article Blueprint
 * @param {Array} [params.recentTopics] - Array of recent article titles for uniqueness check
 * @param {Object} [params.previousDraft] - Previous draft object if refining
 * @param {string} [params.retryFeedback] - Critic feedback string if retrying
 * @param {Object} [params.options] - Custom options ({ articleType, contentCategory, retryCount })
 * @returns {Object} Normalized Generation Context
 */
export function buildContentGenerationContext({
  topicPlan = {},
  researchPackage = null,
  articleBlueprint = null,
  recentTopics = [],
  previousDraft = null,
  retryFeedback = "",
  options = {},
} = {}) {
  const opts = options || {};
  const plan = topicPlan || {};
  const intelCtx = extractBlogIntelligenceContext(plan);

  const articleType = opts.articleType || intelCtx.articleType || "supporting";
  const contentCategory = opts.contentCategory || intelCtx.contentCategory || "core_web_engineering";
  const isPillar = articleType === "pillar";
  const isAuthority = isPillar || articleType === "standalone_authority" || articleType === "verified_trend";

  const targetWords = isPillar
    ? "2,000-3,500 words when the topic requires that depth"
    : isAuthority
    ? "1,800-3,000 words, or more only when the subject genuinely requires it"
    : "900-1,200 words";

  const minimumWords = isPillar ? 1800 : isAuthority ? 1600 : 700;
  const minimumSections = isAuthority ? 8 : 5;

  const hasResearch = Boolean(
    researchPackage &&
    researchPackage.status !== "unavailable" &&
    Number(researchPackage.researchConfidence || 0) > 0
  );

  const hasBlueprint = Boolean(articleBlueprint && articleBlueprint.titleDirection);

  return {
    topic: {
      id: intelCtx.topicPlanId || null,
      title: intelCtx.title || "Realistic Technical Problem Solving",
      articleType,
      contentCategory,
      topicType: intelCtx.topicType,
      pillar: intelCtx.pillar,
      subtopic: intelCtx.subtopic,
      problem: intelCtx.problem,
      solutionAngle: intelCtx.solutionAngle,
      businessValue: intelCtx.businessValue,
      audience: intelCtx.audienceProfile?.label || "Founders and developers",
      focusKeyword: intelCtx.focusKeyword,
      searchIntent: intelCtx.searchIntent,
      format: intelCtx.format,
      isTrend: intelCtx.isTrend,
      trendPlan: intelCtx.trendPlan,
    },

    cluster: {
      clusterKey: intelCtx.clusterKey || "",
      clusterTitle: intelCtx.clusterTitle || intelCtx.pillar || "",
      clusterOrder: intelCtx.clusterOrder || 0,
      clusterDepth: intelCtx.clusterDepth || 0,
      parentTopicId: intelCtx.parentTopicId || null,
      parentPillarBlog: intelCtx.parentPillarBlog || null,
    },

    research: {
      hasResearch,
      status: hasResearch ? researchPackage.status || "completed" : "not_available",
      confidence: hasResearch ? Number(researchPackage.researchConfidence || 0.8) : 0,
      questions: hasResearch && Array.isArray(researchPackage.questions) ? researchPackage.questions : [],
      entities: hasResearch && Array.isArray(researchPackage.entities) ? researchPackage.entities : [],
      claims: hasResearch && Array.isArray(researchPackage.claims) ? researchPackage.claims : [],
      contentGaps: hasResearch ? researchPackage.contentGaps || {} : {},
      sources: hasResearch && Array.isArray(researchPackage.sources) ? researchPackage.sources : [],
    },

    blueprint: {
      hasBlueprint,
      version: articleBlueprint?.version || "1.0.0",
      titleDirection: articleBlueprint?.titleDirection || intelCtx.title || "",
      primaryIntent: articleBlueprint?.primaryIntent || intelCtx.searchIntent || "informational",
      audience: articleBlueprint?.audience || { primary: intelCtx.audienceProfile?.label || "Founders and developers" },
      uniqueAngle: articleBlueprint?.uniqueAngle || "",
      searchCoverage: articleBlueprint?.searchCoverage || { primaryQuery: intelCtx.focusKeyword || "" },
      structure: Array.isArray(articleBlueprint?.structure) ? articleBlueprint.structure : [],
      requiredElements: articleBlueprint?.requiredElements || {},
      researchMap: Array.isArray(articleBlueprint?.researchMap) ? articleBlueprint.researchMap : [],
      internalLinkPlan: Array.isArray(articleBlueprint?.internalLinkPlan) ? articleBlueprint.internalLinkPlan : [],
      serviceAlignment: articleBlueprint?.serviceAlignment || {},
      conversionStrategy: articleBlueprint?.conversionStrategy || {},
      differentiation: articleBlueprint?.differentiation || {},
      editorialRules: articleBlueprint?.editorialRules || {},
    },

    seo: {
      focusKeyword: intelCtx.focusKeyword || articleBlueprint?.searchCoverage?.primaryQuery || "",
      searchIntent: intelCtx.searchIntent || articleBlueprint?.primaryIntent || "informational",
      targetWords,
      minimumWords,
      minimumSections,
      recentTopics: Array.isArray(recentTopics) ? recentTopics : [],
    },

    brandRules: {
      positioning: BRAND_POSITIONING.trim(),
      problemSolutionMode: PROBLEM_SOLUTION_EDITORIAL_MODE.trim(),
      categoryGuidance: CATEGORY_WRITING_GUIDANCE[contentCategory] || CATEGORY_WRITING_GUIDANCE.core_web_engineering,
    },

    refinement: {
      previousDraft: previousDraft || null,
      retryFeedback: retryFeedback || "",
      retryCount: Number(opts.retryCount || 0),
    },

    options: opts,
  };
}
