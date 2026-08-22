/**
 * Search Intent Analyzer Module
 * 
 * Compares declared search intent on topic plan with observed search landscape evidence.
 * Produces intent confidence and evidence without mutating the BlogTopicPlan authority.
 */

export function analyzeSearchIntent(declaredIntent = "informational", serpResults = [], observedIntentOverride = null) {
  const normDeclared = String(declaredIntent).toLowerCase().trim() || "informational";
  
  let observedIntent = observedIntentOverride || normDeclared;
  const evidence = [];

  // Analyze titles & snippets in SERP results for intent signals
  const text = serpResults.map((r) => `${r.title || ""} ${r.snippet || ""}`).join(" ").toLowerCase();

  let commercialHits = (text.match(/pricing|best|vs|comparison|review|top|cost|service|hire|pricing/g) || []).length;
  let informationalHits = (text.match(/how to|guide|tutorial|example|architecture|explanation|what is|learn/g) || []).length;
  let transactionalHits = (text.match(/buy|download|sign up|checkout|pricing plan|demo/g) || []).length;

  if (commercialHits > informationalHits && commercialHits >= 2) {
    observedIntent = "commercial_investigation";
    evidence.push("SERP contains multiple comparison, pricing, and service selection keywords.");
  } else if (transactionalHits > commercialHits && transactionalHits >= 2) {
    observedIntent = "transactional";
    evidence.push("SERP contains direct download or product signup CTAs.");
  } else if (informationalHits > 0) {
    observedIntent = "informational";
    evidence.push("SERP is dominated by how-to guides, documentation, and conceptual deep-dives.");
  } else {
    evidence.push("Defaulting to declared topic intent due to balanced SERP signals.");
  }

  const matchesDeclared = observedIntent === normDeclared || 
    (normDeclared === "informational" && observedIntent === "problem_solving") ||
    (normDeclared === "commercial" && observedIntent === "commercial_investigation");

  const confidence = matchesDeclared ? 0.9 : 0.7;

  return {
    declaredIntent: normDeclared,
    observedIntent,
    matchesDeclared,
    confidence,
    evidence,
  };
}
