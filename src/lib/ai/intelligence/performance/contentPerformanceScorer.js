/**
 * Deterministic Content Performance Scorer (Phase 8)
 * 
 * Computes deterministic 0-100 performance scores across measurable signals:
 * - Search visibility (Impressions)
 * - Search traffic (Clicks)
 * - CTR efficiency (%)
 * - Ranking position strength
 * - Article maturity age (days since publication)
 * 
 * CRITICAL RULE: DO NOT CONFUSE PERFORMANCE WITH CONTENT QUALITY.
 * Newly published content (< 21 days) is classified as 'insufficient_data'
 * and is NEVER penalized as 'underperforming'.
 */

/**
 * Calculates deterministic performance score and classification for a published blog.
 * 
 * @param {Object} blog - Published blog document ({ _id, title, slug, createdAt })
 * @param {Object|null} [gscData=null] - GSC performance metrics for this blog
 * @param {Object|null} [ga4Data=null] - GA4 engagement metrics for this blog
 * @returns {Object} Deterministic performance score payload
 */
export function calculateContentPerformanceScore(blog = {}, gscData = null, ga4Data = null) {
  const publishedDate = new Date(blog.createdAt || blog.generatedAt || blog.date || Date.now());
  const maturityDays = Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)));

  const impressions = Number(gscData?.impressions || 0);
  const clicks = Number(gscData?.clicks || 0);
  const ctr = Number(gscData?.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0));
  const avgPos = Number(gscData?.averagePosition || 0);

  // Newly published articles (< 21 days) get insufficient_data classification
  if (maturityDays < 21 && impressions < 50) {
    return {
      score: 50,
      confidence: 0.3,
      classification: "insufficient_data",
      dataSufficiency: "insufficient",
      maturityDays,
      metrics: { impressions, clicks, ctr, averagePosition: avgPos },
      reason: "Article published less than 21 days ago; awaiting search indexing maturity.",
    };
  }

  // Compute sub-scores (0-100 scale)
  let visibilityScore = Math.min(100, Math.round((impressions / 500) * 100));
  let trafficScore = Math.min(100, Math.round((clicks / 25) * 100));
  let ctrScore = Math.min(100, Math.round((ctr / 3.0) * 100));
  let rankingScore = avgPos > 0 ? Math.max(0, Math.round((1 - (avgPos - 1) / 50) * 100)) : 40;

  const aggregateScore = Math.round(
    visibilityScore * 0.30 +
    trafficScore * 0.30 +
    ctrScore * 0.20 +
    rankingScore * 0.20
  );

  let classification = "stable";
  if (clicks >= 15 || (impressions >= 300 && avgPos <= 10)) {
    classification = "strong";
  } else if (impressions >= 100 && avgPos <= 20) {
    classification = "promising";
  } else if (maturityDays >= 60 && impressions < 50 && clicks < 3) {
    classification = "underperforming";
  } else {
    classification = "stable";
  }

  const confidence = Math.min(1.0, Math.round((impressions / 200 + maturityDays / 90) * 50) / 100);

  return {
    score: Math.min(100, Math.max(0, aggregateScore)),
    confidence,
    classification,
    dataSufficiency: impressions > 30 ? "sufficient" : "insufficient",
    maturityDays,
    metrics: {
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      averagePosition: avgPos,
    },
    reason: `Evaluated performance score ${aggregateScore}/100 (${classification}) based on ${impressions} impressions and ${clicks} clicks.`,
  };
}
