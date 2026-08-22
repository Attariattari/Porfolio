/**
 * Conversion Intelligence & Contextual Linking Engine (Phase 9)
 * 
 * Context-aware, intent-driven conversion strategy engine connecting:
 * BLOG -> USER INTENT -> RELEVANT SERVICE -> NATURAL CTA -> BOOKING -> LEAD
 * 
 * Classifies commercial intent (NONE, SOFT, MEDIUM, HIGH), maps live MongoDB service records,
 * enforces confidence bands, generates contextual anchors, and outputs a structured ConversionStrategy.
 */

import { evaluateBlogServiceRelevance } from "./blogServiceRelevanceEngine.js";
import { getServiceIntelligenceSnapshotSync } from "./services/serviceIntelligenceSnapshot.js";

/**
 * Classifies conversion intent for a blog/topic payload.
 * 
 * @param {Object} item - Blog or Topic object
 * @returns {String} Intent Level: 'NONE' | 'SOFT' | 'MEDIUM' | 'HIGH'
 */
export function classifyConversionIntent(item = {}) {
  const blog = item.blog || item.topic || item || {};
  const text = [blog.title, blog.subtopic, blog.problem, blog.focusKeyword, blog.category, blog.content]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const searchIntent = String(blog.intent || blog.searchIntent || "").toLowerCase();

  if (
    /cost|price|pricing|hire|agency|redesign|cost guide|development cost|quote|proposal/i.test(text) ||
    searchIntent === "pricing" ||
    searchIntent === "transactional"
  ) {
    return "HIGH";
  }

  if (
    /versus|vs|comparison|framework|architecture|best practices|services|solutions|vendor/i.test(text) ||
    searchIntent === "commercial_investigation"
  ) {
    return "MEDIUM";
  }

  if (/guide|tutorial|how to|optimization|performance|security|fix|troubleshoot/i.test(text)) {
    return "SOFT";
  }

  return "NONE";
}

/**
 * Generates natural contextual anchor text options for a service.
 */
export function generateNaturalAnchorText(serviceTitle = "", topicTitle = "") {
  const normTitle = serviceTitle.toLowerCase();

  if (normTitle.includes("e-commerce")) {
    return ["custom e-commerce development", "build a scalable online store", "e-commerce engineering services"];
  }
  if (normTitle.includes("next.js") || normTitle.includes("nextjs")) {
    return ["custom Next.js web development", "build modern Next.js applications", "Next.js engineering services"];
  }
  if (normTitle.includes("landing page")) {
    return ["high-converting landing page design", "build a custom landing page", "landing page design services"];
  }
  if (normTitle.includes("redesign")) {
    return ["website redesign and modernization", "rebuild your web platform", "website modernization services"];
  }
  if (normTitle.includes("speed") || normTitle.includes("optimization")) {
    return ["website speed optimization", "improve Core Web Vitals", "performance optimization services"];
  }

  return [
    `custom ${serviceTitle.toLowerCase()}`,
    `professional ${serviceTitle.toLowerCase()} services`,
    `build custom ${serviceTitle.toLowerCase()} solutions`,
  ];
}

/**
 * Centralized Conversion Strategy Generator.
 * 
 * @param {Object} blogPayload - Blog or Topic object
 * @param {Object} [options={}] - Options
 * @returns {Object} Structured Conversion Strategy
 */
export function generateConversionStrategy(blogPayload = {}, options = {}) {
  const blog = blogPayload.blog || blogPayload.topic || blogPayload || {};
  const intent = classifyConversionIntent(blog);
  const relevance = evaluateBlogServiceRelevance(blog);

  const score = relevance.relevanceScore || 0;
  const primaryService = relevance.primaryService;
  const secondaryServices = relevance.secondaryServices || [];

  // Confidence Bands & Thresholds
  let confidence = "NO_MATCH";
  let ctaLevel = "NONE";

  if (score >= 85) {
    confidence = "HIGHLY_RELEVANT";
    ctaLevel = intent === "HIGH" ? "HIGH" : "MEDIUM";
  } else if (score >= 70) {
    confidence = "STRONG";
    ctaLevel = intent === "HIGH" ? "HIGH" : intent === "MEDIUM" ? "MEDIUM" : "SOFT";
  } else if (score >= 50) {
    confidence = "MODERATE";
    ctaLevel = intent === "NONE" ? "NONE" : "SOFT";
  } else if (score >= 30) {
    confidence = "WEAK";
    ctaLevel = "NONE";
  } else {
    confidence = "NO_MATCH";
    ctaLevel = "NONE";
  }

  if (intent === "NONE" && score < 70) {
    ctaLevel = "NONE";
  }

  if (!primaryService || ctaLevel === "NONE") {
    return {
      intent,
      primaryService: null,
      secondaryServices: [],
      relevanceScore: score,
      confidence,
      ctaLevel: "NONE",
      anchorText: null,
      ctaTitle: null,
      ctaDescription: null,
      primaryAction: null,
      secondaryAction: null,
      placement: "none",
      reason: `Pure educational content or low service relevance (${score}/100); sales CTAs suppressed.`,
    };
  }

  const anchors = generateNaturalAnchorText(primaryService.title, blog.title);
  const selectedAnchor = anchors[0];

  let ctaTitle = `Explore ${primaryService.title}`;
  let ctaDescription = `Partner with Muhyo Tech to design and build custom ${primaryService.title.toLowerCase()} solutions engineered for scale and conversion growth.`;
  let placement = "end_of_article";

  if (ctaLevel === "HIGH") {
    ctaTitle = `Ready to Launch Your ${primaryService.title}?`;
    ctaDescription = `Talk directly with our senior software architects. Get a custom proposal and project roadmap tailored to your business goals.`;
    placement = "after_problem_solution";
  } else if (ctaLevel === "SOFT") {
    ctaTitle = `Need Help with ${primaryService.title}?`;
    ctaDescription = `Learn how Muhyo Tech delivers production-grade ${primaryService.title.toLowerCase()} for growing businesses.`;
    placement = "contextual_paragraph";
  }

  return {
    intent,
    primaryService,
    secondaryServices: secondaryServices.slice(0, 2),
    relevanceScore: score,
    confidence,
    ctaLevel,
    anchorText: selectedAnchor,
    alternativeAnchors: anchors,
    ctaTitle,
    ctaDescription,
    primaryAction: {
      label: `Explore ${primaryService.title}`,
      url: `/services/${primaryService.slug}`,
    },
    secondaryAction: {
      label: "Book a Discovery Call",
      url: `/book-call?service=${primaryService.slug}`,
    },
    placement,
    reason: `Mapped to '${primaryService.title}' with ${relevance.category} relevance (${score}/100) and ${intent} intent.`,
  };
}

/**
 * Legacy Wrapper Function for Backward Compatibility.
 */
export function generateBlogToServiceLinkRecommendation(topic = {}) {
  const strategy = generateConversionStrategy(topic);
  return {
    hasLink: strategy.ctaLevel !== "NONE",
    serviceSlug: strategy.primaryService?.slug || null,
    serviceTitle: strategy.primaryService?.title || null,
    ctaType: strategy.ctaLevel === "HIGH" ? "consultation_cta" : strategy.ctaLevel === "MEDIUM" ? "service_link" : "soft_contextual",
    anchorText: strategy.anchorText,
    alternativeAnchors: strategy.alternativeAnchors || [],
    relevanceScore: strategy.relevanceScore,
    reason: strategy.reason,
  };
}

/**
 * Legacy Service -> Blog Recommendation Helper.
 */
export function generateServiceToBlogRecommendations(serviceSlug = "", blogPool = []) {
  if (!serviceSlug || !Array.isArray(blogPool) || blogPool.length === 0) {
    return [];
  }

  return blogPool
    .map((blog) => {
      const rel = evaluateBlogServiceRelevance(blog);
      return {
        blogId: blog._id || blog.slug,
        title: blog.title,
        slug: blog.slug,
        category: blog.contentCategory || blog.category,
        relevanceScore: rel.primaryService?.slug === serviceSlug ? rel.relevanceScore : 0,
      };
    })
    .filter((item) => item.relevanceScore >= 40)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}
