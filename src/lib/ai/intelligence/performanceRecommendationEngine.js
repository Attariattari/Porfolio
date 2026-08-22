/**
 * Evidence-Based Performance Recommendation Engine (Phase 10)
 * 
 * Generates structured, confidence-scored recommendations from performance signals,
 * search opportunities, cluster analysis, and content decay detection.
 */

import { classifyPerformanceState } from "./performanceMaturityEngine.js";
import { detectContentDecay } from "./contentDecayAnalyzer.js";

export function generatePerformanceRecommendations(blog = {}, currentMetrics = {}, previousMetrics = {}, topQueries = []) {
  const recommendations = [];
  const stateInfo = classifyPerformanceState(blog, currentMetrics);
  const decayInfo = detectContentDecay(blog, currentMetrics, previousMetrics);

  // 1. Search Opportunity Recommendation (Page 1 query expansion)
  if (stateInfo.state === "search_opportunity") {
    recommendations.push({
      action: "UPDATE_EXISTING_ARTICLE",
      confidence: 0.92,
      reason: stateInfo.reason,
      evidence: {
        impressions: currentMetrics.impressions,
        position: currentMetrics.averagePosition,
        ctr: currentMetrics.ctr,
      },
      recommendedTarget: blog.slug,
      suggestedActionText: "Optimize title tag, meta description, and H2 headings to improve CTR for Page 1 queries.",
    });
  }

  // 2. Discovered Queries for Supporting Topic Creation (Dynamic Cluster Expansion)
  const highImpressionQueries = topQueries.filter(
    (q) => q.impressions >= 300 && q.position >= 8 && q.query && !blog.title.toLowerCase().includes(q.query.toLowerCase())
  );

  if (highImpressionQueries.length > 0) {
    const topQuery = highImpressionQueries[0];
    recommendations.push({
      action: "CREATE_SUPPORTING_TOPIC",
      confidence: 0.89,
      reason: `Discovered query '${topQuery.query}' with ${topQuery.impressions} impressions at position ${topQuery.position.toFixed(1)}.`,
      evidence: {
        query: topQuery.query,
        impressions: topQuery.impressions,
        position: topQuery.position,
      },
      recommendedTarget: blog.slug,
      suggestedTopicTitle: `Complete Guide to ${topQuery.query.replace(/\b\w/g, (l) => l.toUpperCase())}`,
      suggestedActionText: "Queue candidate supporting topic in Think10X topic system.",
    });
  }

  // 3. Content Decay Refresh Recommendation
  if (decayInfo.hasDecay) {
    recommendations.push({
      action: "REFRESH_DECAYING_CONTENT",
      confidence: decayInfo.confidence,
      reason: decayInfo.reason,
      evidence: {
        impressionDropPercent: decayInfo.impressionDropPercent,
        probableCause: decayInfo.probableCause,
      },
      recommendedTarget: blog.slug,
      suggestedActionText: "Review and update outdated statistics, add new subtopics, and audit internal links.",
    });
  }

  // Default monitor recommendation if no urgent action required
  if (recommendations.length === 0) {
    recommendations.push({
      action: "MONITOR_ONLY",
      confidence: 0.95,
      reason: "Article performance is stable; continue standard monitoring.",
      evidence: { state: stateInfo.state },
      recommendedTarget: blog.slug,
      suggestedActionText: "No immediate action required.",
    });
  }

  return {
    blogId: blog._id,
    slug: blog.slug,
    performanceState: stateInfo.state,
    recommendationsCount: recommendations.length,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}
