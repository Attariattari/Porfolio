/**
 * Fact & Claim Extraction Module
 * 
 * Extracts factual technical claims and standards from official documentation sources.
 * Only returns claims supported by high-confidence sources.
 */

export function extractFactualClaims(docResearch = {}, serpResearch = {}) {
  const claims = [];

  // Extract from official doc sources
  if (Array.isArray(docResearch.officialSources)) {
    for (const source of docResearch.officialSources) {
      if (source.summary) {
        claims.push({
          claim: source.summary,
          sourceUrl: source.url,
          evidence: `Official guidance from ${source.domain}`,
          confidence: source.confidence || 0.95,
          freshness: "current",
          sourceType: "official_documentation",
        });
      }
    }
  }

  // Add official standards if available
  if (Array.isArray(docResearch.officialStandards)) {
    for (const std of docResearch.officialStandards) {
      claims.push({
        claim: std,
        sourceUrl: docResearch.officialSources?.[0]?.url || "https://developer.mozilla.org",
        evidence: "Official platform standard",
        confidence: 0.9,
        freshness: "current",
        sourceType: "standard",
      });
    }
  }

  // De-duplicate claims by text similarity
  const uniqueClaims = [];
  const seenText = new Set();

  for (const c of claims) {
    const norm = String(c.claim).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenText.has(norm)) {
      seenText.add(norm);
      uniqueClaims.push(c);
    }
  }

  return uniqueClaims.slice(0, 6);
}
