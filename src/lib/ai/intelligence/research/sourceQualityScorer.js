/**
 * Source Quality Scorer Module
 * 
 * Scores research sources across 4 key dimensions:
 * 1. Authority Level (official_documentation = 1.0, official_announcement = 0.9, reputable = 0.75, community = 0.5)
 * 2. Freshness Score (evaluates publication/update recency)
 * 3. Relevance Score (query and domain alignment)
 * 4. Combined Confidence (0.0 to 1.0)
 */

const OFFICIAL_DOMAINS = new Set([
  "react.dev",
  "nextjs.org",
  "nodejs.org",
  "mongodb.com",
  "developer.mozilla.org",
  "typescriptlang.org",
  "vercel.com",
  "expressjs.com",
  "github.com",
  "w3.org",
]);

const REPUTABLE_TECHNICAL_DOMAINS = new Set([
  "stackoverflow.com",
  "web.dev",
  "smashingmagazine.com",
  "css-tricks.com",
  "dev.to",
  "medium.com",
  "logrocket.com",
  "infoq.com",
]);

export function evaluateSourceType(domain = "", explicitType = null) {
  if (explicitType) return explicitType;
  const cleanDomain = String(domain).toLowerCase().replace(/^www\./, "").trim();

  if (OFFICIAL_DOMAINS.has(cleanDomain)) return "official_documentation";
  if (REPUTABLE_TECHNICAL_DOMAINS.has(cleanDomain)) return "reputable_technical_source";
  return "community_source";
}

export function evaluateAuthorityLevel(sourceType = "community_source") {
  switch (sourceType) {
    case "official_documentation": return 1.0;
    case "official_announcement": return 0.9;
    case "standard": return 0.95;
    case "reputable_technical_source": return 0.75;
    case "community_source": return 0.5;
    case "general_source": default: return 0.3;
  }
}

export function calculateFreshnessScore(publishedAt = null) {
  if (!publishedAt) return 0.75;
  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) return 0.75;

  const ageInDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays <= 30) return 1.0;
  if (ageInDays <= 180) return 0.9;
  if (ageInDays <= 365) return 0.8;
  if (ageInDays <= 730) return 0.65;
  return 0.5;
}

export function scoreResearchSource(source = {}, query = "") {
  const domain = String(source.domain || source.url || "").toLowerCase().replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
  const sourceType = evaluateSourceType(domain, source.sourceType);
  const authorityLevel = evaluateAuthorityLevel(sourceType);
  const freshnessScore = calculateFreshnessScore(source.publishedAt);
  
  const queryTokens = String(query).toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const titleTokens = String(source.title || "").toLowerCase();
  const matchedTokens = queryTokens.filter((token) => titleTokens.includes(token)).length;
  const relevanceScore = queryTokens.length > 0 ? Math.min(1.0, 0.5 + (matchedTokens / queryTokens.length) * 0.5) : 0.8;

  const confidence = Math.min(1.0, Math.max(0.1, (authorityLevel * 0.5) + (relevanceScore * 0.3) + (freshnessScore * 0.2)));

  return {
    url: source.url || `https://${domain}`,
    title: source.title || "Technical Reference",
    domain,
    sourceType,
    authorityLevel,
    relevanceScore: Math.round(relevanceScore * 100) / 100,
    freshnessScore: Math.round(freshnessScore * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
  };
}
