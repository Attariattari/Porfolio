/**
 * Service Commercial Intent & Contextual Conversion Engine
 * 
 * Implements the 6-Stage Intent Progression Pipeline:
 * Problem Awareness -> Information -> Comparison -> Solution Evaluation -> Service Evaluation -> Contact / Lead
 */

import { getServiceKnowledgeProfile } from "./serviceKnowledgeBase.js";

export const INTENT_STAGES = Object.freeze({
  PROBLEM_AWARENESS: "problem_awareness",
  INFORMATION: "information",
  COMPARISON: "comparison",
  SOLUTION_EVALUATION: "solution_evaluation",
  SERVICE_EVALUATION: "service_evaluation",
  CONTACT_LEAD: "contact_lead"
});

/**
 * Classifies candidate article text into one of the 6 commercial intent progression stages.
 */
export function classifyCommercialIntentStage(topic = {}) {
  const text = [topic.title, topic.subtopic, topic.problem, topic.focusKeyword, topic.searchIntent, topic.intent]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/hire|book a call|pricing|quote|cost in pakistan|development cost/i.test(text)) {
    return INTENT_STAGES.CONTACT_LEAD;
  }
  if (/service|agency|developer in lahore|company|pricing guide/i.test(text)) {
    return INTENT_STAGES.SERVICE_EVALUATION;
  }
  if (/architecture|best practices|framework choice|solution|production ready/i.test(text)) {
    return INTENT_STAGES.SOLUTION_EVALUATION;
  }
  if (/versus|vs|comparison|difference|pros and cons/i.test(text)) {
    return INTENT_STAGES.COMPARISON;
  }
  if (/guide|tutorial|how to|what is|explanation/i.test(text)) {
    return INTENT_STAGES.INFORMATION;
  }

  return INTENT_STAGES.PROBLEM_AWARENESS;
}

/**
 * Generates intent-aware, highly relevant CTAs derived from Service Knowledge Base profiles.
 * 
 * @param {Object} input - { blogData, matchedService, intentStage }
 * @returns {Object} Structured CTA Payload
 */
export function generateContextualServiceCTA(input = {}) {
  const blog = input.blogData || {};
  const serviceSlug = typeof input.matchedService === "string"
    ? input.matchedService
    : input.matchedService?.slug || "custom-website-development";
  
  const profile = getServiceKnowledgeProfile(serviceSlug);
  const stage = input.intentStage || classifyCommercialIntentStage(blog);

  let headline = `Ready to discuss ${profile?.title || "Web Development"}?`;
  let description = profile?.whatItIs || "Connect with Muhyo Tech engineers for practical, high-performance web solutions.";
  let primaryCtaText = profile?.conversionStrategy?.primaryCtaText || "Book a Call";
  let primaryCtaHref = `/services/${serviceSlug}`;
  let secondaryCtaText = "Book Strategy Call";
  let secondaryCtaHref = `/book-call?service=${serviceSlug}`;
  let ctaType = "INFORMATIONAL";

  switch (stage) {
    case INTENT_STAGES.CONTACT_LEAD:
    case INTENT_STAGES.SERVICE_EVALUATION:
      ctaType = "TRANSACTIONAL";
      headline = `Need expert ${profile?.title} for your business?`;
      description = profile?.whoNeedsIt?.[0]?.label || `Our engineering team delivers production-ready ${profile?.title?.toLowerCase()} solutions.`;
      primaryCtaText = `Book ${profile?.title} Call`;
      primaryCtaHref = `/book-call?service=${serviceSlug}`;
      break;

    case INTENT_STAGES.SOLUTION_EVALUATION:
    case INTENT_STAGES.COMPARISON:
      ctaType = "COMMERCIAL";
      headline = `Evaluating ${profile?.title} for your platform?`;
      description = profile?.problemsSolved?.[0]
        ? `Overcome ${profile.problemsSolved[0].toLowerCase()} with Muhyo Tech engineering guidance.`
        : description;
      primaryCtaText = `Explore ${profile?.title}`;
      primaryCtaHref = `/services/${serviceSlug}`;
      break;

    default:
      ctaType = "INFORMATIONAL";
      headline = `Looking for practical ${profile?.title} guidance?`;
      description = `Learn how Muhyo Tech builds scalable, conversion-focused ${profile?.title?.toLowerCase()} applications.`;
      primaryCtaText = `Learn About ${profile?.title}`;
      primaryCtaHref = `/services/${serviceSlug}`;
      break;
  }

  const anchorOptions = profile?.conversionStrategy?.anchorTextOptions || [`custom ${serviceSlug.replace(/-/g, " ")}`];

  return {
    ctaType,
    intentStage: stage,
    headline,
    description,
    primaryCtaText,
    primaryCtaHref,
    secondaryCtaText,
    secondaryCtaHref,
    targetServiceSlug: serviceSlug,
    recommendedAnchorText: anchorOptions[0],
    alternativeAnchors: anchorOptions,
    placement: "end_of_article"
  };
}
