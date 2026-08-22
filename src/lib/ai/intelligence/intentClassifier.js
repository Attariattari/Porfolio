/**
 * Intent & Audience Classification Engine
 * 
 * Classifies topics into fine-grained search intents and professional audience personas.
 * Removes the rigid assumption that every reader is a developer and enforces editorial trust.
 */

export const SUPPORTED_INTENTS = Object.freeze([
  "informational",
  "problem_solving",
  "commercial_investigation",
  "transactional",
  "comparison",
  "pricing",
  "local",
  "navigational",
  "trend_news",
]);

export const AUDIENCE_GROUPS = Object.freeze([
  "developer",
  "tech_lead",
  "cto",
  "startup_founder",
  "business_owner",
  "ecommerce_owner",
  "marketing_growth",
  "local_business_owner",
  "enterprise_decision_maker",
]);

const INTENT_PATTERNS = Object.freeze({
  pricing: [/cost/i, /price/i, /pricing/i, /how much/i, /budget/i, /rate/i],
  comparison: [/vs/i, /versus/i, /compared/i, /alternative/i, /difference/i, /which is better/i],
  problem_solving: [/how to fix/i, /resolve/i, /error/i, /troubleshoot/i, /bug/i, /issue/i, /failed/i, /slow/i],
  commercial_investigation: [/best/i, /top/i, /services/i, /agency/i, /solution/i, /platform/i, /architecture for/i],
  transactional: [/hire/i, /build my/i, /develop my/i, /quote/i, /consultation/i, /checkout/i],
  local: [/near me/i, /local/i, /city/i, /location/i],
  trend_news: [/release/i, /v\d+/i, /update/i, /announcing/i, /whats new/i, /2026/i, /2025/i],
});

const AUDIENCE_PATTERNS = Object.freeze({
  business_owner: [/business owner/i, /company/i, /non-technical/i, /roi/i, /revenue/i, /cost/i, /hire/i],
  ecommerce_owner: [/e-?commerce/i, /online store/i, /shop/i, /sales/i, /checkout/i],
  startup_founder: [/founder/i, /startup/i, /mvp/i, /bootstrap/i, /product launch/i, /scale/i],
  cto: [/cto/i, /engineering director/i, /vp engineering/i, /architecture strategy/i, /tech debt/i],
  tech_lead: [/tech lead/i, /senior engineer/i, /architect/i, /lead developer/i],
  marketing_growth: [/seo/i, /conversion/i, /traffic/i, /marketing/i, /growth/i, /lead generation/i],
  developer: [/how to/i, /tutorial/i, /code/i, /syntax/i, /react/i, /node/i, /next\.js/i, /setup/i, /install/i],
});

export function classifyIntentAndAudience(topic = {}) {
  const text = [topic.title, topic.subtopic, topic.problem, topic.solutionAngle, topic.focusKeyword, topic.audience, topic.format]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Determine Search Intent
  let detectedIntent = topic.searchIntent || topic.intent || "informational";
  let intentConfidence = 0.8;

  for (const [intentKey, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      detectedIntent = intentKey;
      intentConfidence = 0.92;
      break;
    }
  }

  // Normalize intent to allowed list or fallback to informational
  if (!SUPPORTED_INTENTS.includes(detectedIntent)) {
    detectedIntent = "informational";
  }

  // Determine Audience Group
  let detectedAudience = "developer";
  let audienceConfidence = 0.8;

  for (const [audienceKey, patterns] of Object.entries(AUDIENCE_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      detectedAudience = audienceKey;
      audienceConfidence = 0.9;
      break;
    }
  }

  // Map to friendly human label if requested for display
  const audienceLabels = {
    developer: "Developers & Software Engineers",
    tech_lead: "Technical Leads & Architects",
    cto: "CTOs & Engineering Directors",
    startup_founder: "Startup Founders & Product Owners",
    business_owner: "Business Owners & Decision Makers",
    ecommerce_owner: "E-Commerce Brands & Retailers",
    marketing_growth: "Marketing & Growth Teams",
    local_business_owner: "Local Business Owners",
    enterprise_decision_maker: "Enterprise IT Decision Makers",
  };

  return {
    intent: detectedIntent,
    intentConfidence,
    audienceGroup: detectedAudience,
    audienceLabel: audienceLabels[detectedAudience] || "Founders and Developers",
    audienceConfidence,
    overallConfidence: Math.round(((intentConfidence + audienceConfidence) / 2) * 100) / 100,
  };
}
