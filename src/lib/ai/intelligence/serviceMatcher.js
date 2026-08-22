/**
 * Service Matcher Engine (Phase 4)
 * 
 * Safely evaluates topic candidates against active Muhyo Tech digital services.
 * Surface genuine commercial service relevance without forcing service connections
 * or creating duplicate/new service pages.
 */

import { ALLOWED_SERVICES, evaluateServiceRelevance } from "./industryTaxonomy.js";
import { servicesSeedData } from "../../../data/services.seed.js";
import { matchTopicToServices } from "./services/serviceTopicMatcherEngine.js";

const ACTIVE_SERVICE_SLUGS = new Set(servicesSeedData.map((s) => s.slug));

export function matchServiceForTopic(topic = {}) {
  try {
    const matched = matchTopicToServices(topic);
    if (matched.primaryService) {
      return {
        relevant: true,
        serviceKey: matched.primaryService.slug,
        confidence: Math.round((matched.overallServiceRelevance / 100) * 100) / 100,
        relevanceScore: matched.overallServiceRelevance,
        classification: matched.matchClassification,
        reasons: matched.primaryService.reasons,
      };
    }
  } catch (err) {
    console.warn("[serviceMatcher] Engine fallback:", err.message);
  }

  // Legacy fallback logic if engine unavailable
  if (topic.serviceIntent && typeof topic.serviceIntent === "object") {
    const rawRelevant = Boolean(topic.serviceIntent.relevant);
    const rawKey = topic.serviceIntent.serviceKey ? String(topic.serviceIntent.serviceKey).trim() : null;
    const rawConf = typeof topic.serviceIntent.confidence === "number"
      ? Math.min(1, Math.max(0, topic.serviceIntent.confidence))
      : rawRelevant ? 0.85 : 0;

    if (!rawRelevant) {
      return { relevant: false, serviceKey: null, confidence: 0 };
    }

    if (rawKey && (ACTIVE_SERVICE_SLUGS.has(rawKey) || ALLOWED_SERVICES[rawKey])) {
      return { relevant: true, serviceKey: rawKey, confidence: Math.max(0.85, rawConf) };
    }

    return { relevant: true, serviceKey: null, confidence: rawConf };
  }

  if (Array.isArray(topic.relatedServiceSlugs) && topic.relatedServiceSlugs.length > 0) {
    const firstSlug = topic.relatedServiceSlugs[0];
    if (ACTIVE_SERVICE_SLUGS.has(firstSlug) || ALLOWED_SERVICES[firstSlug]) {
      return { relevant: true, serviceKey: firstSlug, confidence: 0.95 };
    }
  }

  const searchIntent = topic.searchIntent || topic.intent || "informational";
  const text = [topic.title, topic.subtopic, topic.problem, topic.solutionAngle, topic.focusKeyword, topic.businessValue]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isCommercialSearchIntent = ["commercial", "pricing", "transactional", "commercial_investigation"].includes(searchIntent);
  const commercialPatterns = [/cost/i, /price/i, /pricing/i, /hire/i, /agency/i, /services/i, /how much/i, /development cost/i, /redesign/i, /landing page/i, /custom website/i, /ecommerce store/i];
  const hasCommercialText = commercialPatterns.some((p) => p.test(text));

  if (!isCommercialSearchIntent && !hasCommercialText) {
    return { relevant: false, serviceKey: null, confidence: 0 };
  }

  const evaluated = evaluateServiceRelevance(topic);
  if (evaluated.serviceSlug && (ACTIVE_SERVICE_SLUGS.has(evaluated.serviceSlug) || ALLOWED_SERVICES[evaluated.serviceSlug])) {
    return {
      relevant: true,
      serviceKey: evaluated.serviceSlug,
      confidence: Math.max(0.85, Number(evaluated.serviceRelevance) || 0.85),
    };
  }

  return {
    relevant: true,
    serviceKey: null,
    confidence: 0.75,
  };
}
