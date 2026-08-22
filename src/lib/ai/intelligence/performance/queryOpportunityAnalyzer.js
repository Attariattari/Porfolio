/**
 * Query & Opportunity Analyzer (Phase 8)
 * 
 * Analyzes GSC search queries and performance signals to identify actionable opportunities:
 * - CTR Opportunities (High impressions + weak CTR)
 * - Ranking Opportunities (Position 4-20 with high impressions)
 * - Content Gap Opportunities (Queries appearing in GSC not adequately covered)
 * - Cluster Expansion Opportunities (Strong pillar generating sub-queries)
 * - Content Decay Opportunities (Mature content showing traffic decline)
 */

import { stripBlogHtml } from "../../../blogSeo.js";

/**
 * Analyzes query performance and identifies content opportunities for a blog.
 * 
 * @param {Object} blog - Published blog document ({ _id, title, slug, focusKeyword, clusterKey, articleType })
 * @param {Object|null} gscData - GSC performance metrics for this blog
 * @param {Object} [options={}] - Options
 * @returns {Array<Object>} Array of discovered opportunity objects
 */
export function analyzeQueryOpportunities(blog = {}, gscData = null, options = {}) {
  if (!blog || !gscData) return [];

  const opportunities = [];
  const impressions = Number(gscData.impressions || 0);
  const clicks = Number(gscData.clicks || 0);
  const ctr = Number(gscData.ctr || 0);
  const avgPos = Number(gscData.averagePosition || 0);
  const topQueries = Array.isArray(gscData.topQueries) ? gscData.topQueries : [];

  const slug = blog.slug;
  const blogId = blog._id;
  const clusterKey = blog.clusterKey || `cluster-${slug}`;

  // 1. CTR Opportunity (High impressions > 100, CTR < 2.0%)
  if (impressions >= 100 && ctr < 2.0) {
    opportunities.push({
      blogId,
      slug,
      opportunityType: "ctr_optimization",
      opportunityScore: 85,
      targetClusterKey: clusterKey,
      reason: `High search visibility (${impressions} impressions) at avg position ${avgPos}, but low CTR (${ctr}%).`,
      recommendedAction: "Review title tag and meta description positioning to improve click-through rate.",
      recommendedTopicTitle: null,
      evidence: { impressions, clicks, ctr, averagePosition: avgPos, topQueries: topQueries.slice(0, 3) },
    });
  }

  // 2. Ranking Opportunity (Position 4-20, impressions >= 80)
  if (avgPos >= 4.0 && avgPos <= 20.0 && impressions >= 80) {
    const primaryQuery = topQueries[0]?.query || blog.focusKeyword || blog.title;
    opportunities.push({
      blogId,
      slug,
      opportunityType: "ranking_boost",
      opportunityScore: 80,
      targetClusterKey: clusterKey,
      reason: `Ranking on page 1-2 (pos ${avgPos}) for query '${primaryQuery}' with ${impressions} impressions.`,
      recommendedAction: "Add focused technical section or code example to move query into top 3 positions.",
      recommendedTopicTitle: null,
      evidence: { impressions, clicks, ctr, averagePosition: avgPos, primaryQuery },
    });
  }

  // 3. Cluster Expansion Opportunity (Pillar blog generating sub-queries)
  if ((blog.articleType === "pillar" || blog.type === "pillar") && topQueries.length >= 2 && impressions >= 150) {
    const secondaryQuery = topQueries[1]?.query || topQueries[0]?.query;
    if (secondaryQuery) {
      opportunities.push({
        blogId,
        slug,
        opportunityType: "cluster_expansion",
        opportunityScore: 88,
        targetClusterKey: clusterKey,
        reason: `Pillar blog generating strong sub-query demand for '${secondaryQuery}'.`,
        recommendedAction: "Create dedicated supporting article targeting sub-query to expand cluster authority.",
        recommendedTopicTitle: `Practical Guide: ${secondaryQuery.charAt(0).toUpperCase() + secondaryQuery.slice(1)}`,
        evidence: { pillarSlug: slug, secondaryQuery, impressions },
      });
    }
  }

  return opportunities;
}
