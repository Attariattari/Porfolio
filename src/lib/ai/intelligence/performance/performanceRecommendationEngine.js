/**
 * Performance Topic Recommendation Engine (Phase 8)
 * 
 * Formulates structured topic recommendations (supporting_topic, cluster_expansion, content_refresh)
 * derived from performance opportunities.
 * 
 * QUEUE INTEGRATION & SAFETY:
 * - Recommendations flow into BlogTopicPlan via standard deduplication (analyzeCannibalization).
 * - NEVER bypasses topic queue safety rules or status state machines.
 */

import mongoose from "mongoose";
import { BlogTopicPlan } from "../../../../models/BlogTopicPlan.js";
import { analyzeCannibalization } from "../cannibalizationAnalyzer.js";

/**
 * Generates and validates topic recommendations from performance opportunities.
 * 
 * @param {Array<Object>} [opportunities=[]] - Array of performance opportunities
 * @param {Array<Object>} [existingBlogs=[]] - Array of published blog objects
 * @param {Array<Object>} [existingPlans=[]] - Array of existing topic plan objects
 * @param {Object} [options={}] - Options
 * @returns {Promise<Object>} Recommendation summary
 */
export async function generatePerformanceRecommendations(
  opportunities = [],
  existingBlogs = [],
  existingPlans = [],
  options = {}
) {
  const proposedRecommendations = [];

  for (const opp of opportunities) {
    if (opp.opportunityType === "cluster_expansion" && opp.recommendedTopicTitle) {
      const candidateTitle = opp.recommendedTopicTitle;
      const parentBlog = existingBlogs.find((b) => b.slug === opp.slug);

      proposedRecommendations.push({
        title: candidateTitle,
        articleType: "supporting",
        contentCategory: parentBlog?.contentCategory || "core_web_engineering",
        clusterKey: opp.targetClusterKey || parentBlog?.clusterKey || `cluster-${opp.slug}`,
        clusterTitle: parentBlog?.title || candidateTitle,
        parentPillarBlogId: parentBlog?._id || null,
        problem: `Addressing high search demand for sub-query derived from pillar '${opp.slug}'.`,
        solutionAngle: `Comprehensive technical breakdown and code implementation for ${candidateTitle}.`,
        focusKeyword: opp.evidence?.secondaryQuery || candidateTitle,
        searchIntent: "informational",
        decisionSource: "performance_gsc_closed_loop",
        opportunityScore: opp.opportunityScore || 85,
      });
    }
  }

  // Validate candidates against cannibalization detector
  const approvedRecommendations = [];
  for (const candidate of proposedRecommendations) {
    const check = analyzeCannibalization(candidate, [...existingBlogs, ...existingPlans]);
    if (check.approved) {
      approvedRecommendations.push(candidate);
    }
  }

  let queuedCount = 0;

  // Persist approved recommendations to BlogTopicPlan if database is connected
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1 && BlogTopicPlan && typeof BlogTopicPlan.create === "function") {
      for (const rec of approvedRecommendations.slice(0, 5)) {
        const exists = await BlogTopicPlan.findOne({
          $or: [{ title: rec.title }, { focusKeyword: rec.focusKeyword }],
        });

        if (!exists) {
          await BlogTopicPlan.create({
            ...rec,
            status: "ready",
            topicType: "supporting_tech",
          });
          queuedCount++;
        }
      }
    }
  } catch (dbErr) {
    console.warn("[PerformanceRecommendationEngine] Safe DB persistence warning:", dbErr.message);
  }

  return {
    proposedCount: proposedRecommendations.length,
    approvedRecommendations,
    queuedCount,
  };
}
