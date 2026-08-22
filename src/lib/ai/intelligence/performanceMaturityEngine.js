/**
 * Performance Maturity & State Classification Engine (Phase 10)
 * 
 * Classifies articles into maturity stages (0-14d, 15-30d, 31-90d, 90d+) and
 * evidence-based performance states (emerging_winner, strong_performer, content_decay, search_opportunity).
 * 
 * Articles < 14 days old are never judged prematurely for low traffic.
 */

export function evaluateContentMaturity(publishedAt = new Date(), now = new Date()) {
  const pubDate = new Date(publishedAt);
  const diffMs = Math.max(0, now.getTime() - pubDate.getTime());
  const daysOld = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let stage = "early_indexing";
  if (daysOld >= 90) stage = "mature_historical";
  else if (daysOld >= 31) stage = "analyzable";
  else if (daysOld >= 15) stage = "early_signals";
  else stage = "early_indexing";

  return {
    daysOld,
    stage,
    isAnalyzable: daysOld >= 15,
  };
}

export function classifyPerformanceState(blog = {}, metrics = {}) {
  const maturity = evaluateContentMaturity(blog.publishedAt || blog.createdAt);

  // Articles under 14 days old are protected from premature low-traffic evaluation
  if (maturity.daysOld < 14) {
    return {
      state: "early_indexing",
      maturityDays: maturity.daysOld,
      reason: "Article is less than 14 days old; protected from low-ranking conclusions.",
    };
  }

  const impressions = metrics.impressions || 0;
  const clicks = metrics.clicks || 0;
  const position = metrics.averagePosition || 50;
  const ctr = metrics.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0);

  // High Impressions, Position 5-15, low CTR -> Search Opportunity
  if (impressions >= 1000 && position >= 5 && position <= 20 && ctr < 3.0) {
    return {
      state: "search_opportunity",
      maturityDays: maturity.daysOld,
      reason: `Page has ${impressions} impressions at position ${position.toFixed(1)} with low CTR (${ctr.toFixed(1)}%). Optimization opportunity.`,
    };
  }

  // Strong clicks & top 5 ranking -> Strong Performer
  if (clicks >= 100 || (position <= 5 && impressions >= 500)) {
    return {
      state: "strong_performer",
      maturityDays: maturity.daysOld,
      reason: `Strong organic rankings (Position ${position.toFixed(1)}, ${clicks} clicks).`,
    };
  }

  // Emerging growth -> Emerging Winner
  if (maturity.stage === "early_signals" && (impressions >= 300 || clicks >= 10)) {
    return {
      state: "emerging_winner",
      maturityDays: maturity.daysOld,
      reason: "Early signal growth detected in first 30 days.",
    };
  }

  return {
    state: "stable",
    maturityDays: maturity.daysOld,
    reason: "Steady performance within expected baseline parameters.",
  };
}
