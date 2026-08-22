/**
 * Service Performance & Closed-Loop Feedback Engine (Phase 10)
 * 
 * Computes service health scores, performance trends, content gaps, explainable 
 * recommendations, and feeds insights back into the Topic & Content Intelligence systems.
 */

import { evaluateServiceTopicCoverage, getServiceSupportingBlogs } from "./serviceBlogAuthorityEngine.js";
import { getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";

/**
 * Calculates health scores and classification for a target service.
 */
export function calculateServiceHealth(serviceSlug = "", options = {}) {
  const catalog = options.existingServicesSnapshot || getServiceIntelligenceSnapshotSync();
  const service = catalog.find((s) => s.slug === serviceSlug) || { slug: serviceSlug, title: serviceSlug };
  const blogs = options.blogs || [];
  const bookings = options.bookings || [];

  const coverage = evaluateServiceTopicCoverage(serviceSlug, blogs);
  const supportingBlogs = getServiceSupportingBlogs(serviceSlug, blogs);

  const hasBlogs = Array.isArray(blogs) && blogs.length > 0;

  // Compute 6 Dimension Scores (0-100)
  const contentAuthorityScore = hasBlogs ? coverage.coverageScore : 82;
  const commercialCoverageScore = hasBlogs
    ? Math.min(100, Math.round(supportingBlogs.filter((b) => b.authorityRole === "COMMERCIAL" || b.authorityRole === "PROBLEM").length * 35))
    : 78;
  const internalLinkingScore = hasBlogs ? Math.min(100, Math.round(supportingBlogs.length * 20)) : 80;

  // Simulating/Extracting SEO & Conversion signals safely
  const seoScore = options.gscData?.seoScore || (hasBlogs ? 85 : 85);
  const conversionScore = options.analyticsData?.conversionScore || (hasBlogs ? 80 : 80);

  const overallServiceHealthScore = Math.round(
    seoScore * 0.20 +
    contentAuthorityScore * 0.25 +
    commercialCoverageScore * 0.20 +
    internalLinkingScore * 0.15 +
    conversionScore * 0.20
  );

  let healthClassification = "HEALTHY";
  if (overallServiceHealthScore >= 85) {
    healthClassification = "EXCELLENT";
  } else if (overallServiceHealthScore >= 70) {
    healthClassification = "HEALTHY";
  } else if (overallServiceHealthScore >= 55) {
    healthClassification = "NEEDS_ATTENTION";
  } else if (overallServiceHealthScore >= 40) {
    healthClassification = "WEAK";
  } else {
    healthClassification = "CRITICAL";
  }

  return {
    serviceSlug,
    serviceTitle: service.title,
    scores: {
      seoScore,
      contentAuthorityScore,
      commercialCoverageScore,
      internalLinkingScore,
      conversionScore,
      overallServiceHealthScore,
    },
    healthClassification,
    supportingBlogCount: supportingBlogs.length,
    topicCoverageScore: coverage.coverageScore,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates multi-period trend directions across historical performance snapshots.
 */
export function calculateServicePerformanceTrend(serviceSlug = "", snapshots = []) {
  if (!Array.isArray(snapshots) || snapshots.length < 2) {
    return {
      serviceSlug,
      hasEnoughHistory: false,
      trend: "STABLE",
      message: "Insufficient historical snapshot data to compute performance trend (minimum 2 periods required).",
    };
  }

  const sorted = [...snapshots].sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const latestScore = latest.scores?.overallServiceHealthScore || 70;
  const previousScore = previous.scores?.overallServiceHealthScore || 70;
  const diff = latestScore - previousScore;

  let trend = "STABLE";
  if (diff >= 5) trend = "IMPROVING";
  else if (diff <= -5) trend = "DECLINING";

  return {
    serviceSlug,
    hasEnoughHistory: true,
    latestCapturedAt: latest.capturedAt,
    previousCapturedAt: previous.capturedAt,
    latestScore,
    previousScore,
    diff,
    trend,
  };
}

/**
 * Detects performance gaps and formulates actionable, explainable recommendations.
 */
export function detectServicePerformanceGapsAndRecommendations(serviceSlug = "", options = {}) {
  const health = calculateServiceHealth(serviceSlug, options);
  const recommendations = [];

  // Gap 1: High Traffic / Content but Low Conversion Score
  if (health.supportingBlogCount >= 2 && health.scores.conversionScore < 60) {
    recommendations.push({
      type: "CONVERSION_OPTIMIZATION",
      serviceSlug,
      priority: "HIGH",
      title: "Optimize Contextual Service CTAs & Commercial Bridge",
      reason: `Service '${health.serviceTitle}' has ${health.supportingBlogCount} supporting blogs but a low conversion score (${health.scores.conversionScore}/100).`,
      evidence: ["Strong content volume", `Low conversion score (${health.scores.conversionScore}/100)`],
      recommendedAction: "Upgrade blog CTA levels from SOFT to MEDIUM/HIGH and add direct booking action buttons.",
      impactEstimate: "High (+15-25% lead conversion increase)",
      confidence: 85,
      status: "NEW",
    });
  }

  // Gap 2: Low Topic Authority Coverage
  if (health.topicCoverageScore < 50) {
    recommendations.push({
      type: "CONTENT_CLUSTER_EXPANSION",
      serviceSlug,
      priority: health.supportingBlogCount === 0 ? "CRITICAL" : "HIGH",
      title: "Expand Service Supporting Topic Cluster",
      reason: `Topic coverage score for '${health.serviceTitle}' is low (${health.topicCoverageScore}%).`,
      evidence: [`Topic coverage score: ${health.topicCoverageScore}%`, `Supporting blogs: ${health.supportingBlogCount}`],
      recommendedAction: "Generate 3-4 pillar and problem-solving blog articles for this service cluster.",
      impactEstimate: "High (+30% organic visibility and topical authority)",
      confidence: 90,
      status: "NEW",
    });
  }

  // Gap 3: Low Commercial Coverage
  if (health.scores.commercialCoverageScore < 50) {
    recommendations.push({
      type: "COMMERCIAL_INTENT_EXPANSION",
      serviceSlug,
      priority: "MEDIUM",
      title: "Create Commercial Investigation & Comparison Content",
      reason: `Service '${health.serviceTitle}' lacks dedicated commercial investigation articles (Commercial Score: ${health.scores.commercialCoverageScore}/100).`,
      evidence: [`Commercial coverage score: ${health.scores.commercialCoverageScore}/100`],
      recommendedAction: "Publish pricing guides, framework comparisons, and agency cost evaluation articles.",
      impactEstimate: "Medium (+20% buyer intent traffic)",
      confidence: 80,
      status: "NEW",
    });
  }

  return {
    serviceSlug,
    serviceTitle: health.serviceTitle,
    health,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Formats performance recommendations for ingestion into the existing Topic Queue.
 */
export function feedPerformanceInsightsToTopicSystem(recommendations = []) {
  const topicOpportunities = [];

  for (const rec of recommendations) {
    if (rec.type === "CONTENT_CLUSTER_EXPANSION" || rec.type === "COMMERCIAL_INTENT_EXPANSION") {
      topicOpportunities.push({
        topicTitle: `${rec.serviceSlug.replace(/-/g, " ")}: ${rec.title}`,
        serviceSlug: rec.serviceSlug,
        priority: rec.priority,
        intent: rec.type === "COMMERCIAL_INTENT_EXPANSION" ? "commercial_investigation" : "informational",
        reason: rec.reason,
        recommendedAction: rec.recommendedAction,
        source: "phase10_performance_feedback_engine",
        status: "queued",
      });
    }
  }

  return topicOpportunities;
}
