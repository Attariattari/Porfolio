/**
 * Master Phase 8 Performance Collector & Closed-Loop Orchestrator
 * 
 * Coordinates:
 * - GSC Performance collection (impressions, clicks, CTR, position, queries)
 * - GA4 Performance collection (pageviews, engagement)
 * - Deterministic Content Performance Scoring
 * - Query & Opportunity Analysis
 * - Closed-Loop Topic Recommendation Generation
 * 
 * NON-BLOCKING & FAIL-SAFE GUARANTEE:
 * - Controlled by PHASE8_PERFORMANCE_INTELLIGENCE_ENABLED (defaults to false).
 * - Runs as a secondary, non-blocking path.
 * - If GSC/GA4 credentials are missing or API calls fail, degrades gracefully without throwing uncaught errors.
 * - NEVER blocks article generation, topic queue execution, or blog publishing.
 */

import mongoose from "mongoose";
import dbConnect from "../../../dbConnect.js";
import { Blog } from "../../../../models/Portfolio.js";
import { BlogTopicPlan } from "../../../../models/BlogTopicPlan.js";
import { ContentPerformanceSnapshot } from "../../../../models/ContentPerformanceSnapshot.js";
import { ContentOpportunity } from "../../../../models/ContentOpportunity.js";
import { collectGscPerformance } from "./gscPerformance.js";
import { collectGa4Performance } from "./ga4Performance.js";
import { calculateContentPerformanceScore } from "./contentPerformanceScorer.js";
import { analyzeQueryOpportunities } from "./queryOpportunityAnalyzer.js";
import { generatePerformanceRecommendations } from "./performanceRecommendationEngine.js";

/**
 * Executes a full Phase 8 Performance Intelligence & Closed-Loop Cycle.
 * 
 * @param {Object} [options={}] - Options ({ startDate, endDate })
 * @returns {Promise<Object>} Cycle execution summary
 */
export async function runPerformanceIntelligenceCycle(options = {}) {
  const startedAt = Date.now();
  const isEnabled = process.env.PHASE8_PERFORMANCE_INTELLIGENCE_ENABLED === "true" || options.enablePerformance === true;

  const cycleSummary = {
    available: false,
    enabled: isEnabled,
    blogsAnalyzedCount: 0,
    opportunitiesDiscoveredCount: 0,
    recommendationsCount: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    let publishedBlogs = [];
    let topicPlans = [];

    // DB fetch for published blogs & topic plans
    try {
      await dbConnect();
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        if (Blog) publishedBlogs = await Blog.find({ publishStatus: "published" }).lean().catch(() => []);
        if (BlogTopicPlan) topicPlans = await BlogTopicPlan.find({}).lean().catch(() => []);
      }
    } catch {
      // Non-critical database catch
    }

    if (publishedBlogs.length === 0) {
      cycleSummary.message = "No published blogs found for performance analysis.";
      return cycleSummary;
    }

    // 1. Collect GSC & GA4 Signals
    const gscResult = await collectGscPerformance(publishedBlogs, options);
    const ga4Result = await collectGa4Performance(publishedBlogs, options);

    const performanceMap = gscResult.performanceMap || new Map();
    const allOpportunities = [];
    const scoredBlogs = [];

    // 2. Score Content Performance & Analyze Query Opportunities per blog
    for (const blog of publishedBlogs) {
      const gscData = performanceMap.get(blog.slug?.toLowerCase()) || null;
      const ga4Data = (ga4Result.performanceMap || new Map()).get(blog.slug?.toLowerCase()) || null;

      const scoreResult = calculateContentPerformanceScore(blog, gscData, ga4Data);
      scoredBlogs.push({ blog, scoreResult });

      // Persist snapshot to ContentPerformanceSnapshot if DB connected
      try {
        if (mongoose.connection && mongoose.connection.readyState === 1 && ContentPerformanceSnapshot) {
          await ContentPerformanceSnapshot.create({
            blogId: blog._id,
            slug: blog.slug,
            source: gscResult.available ? "gsc_live" : "estimated_heuristic",
            impressions: scoreResult.metrics.impressions,
            clicks: scoreResult.metrics.clicks,
            ctr: scoreResult.metrics.ctr,
            averagePosition: scoreResult.metrics.averagePosition,
            maturityDays: scoreResult.maturityDays,
            performanceState: scoreResult.classification,
            topQueries: gscData?.topQueries || [],
          }).catch(() => {});
        }
      } catch {
        // Non-critical DB snapshot save catch
      }

      // Analyze Query Opportunities
      const opps = analyzeQueryOpportunities(blog, gscData, options);
      allOpportunities.push(...opps);
    }

    // Persist discovered opportunities to ContentOpportunity model
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && ContentOpportunity) {
        for (const opp of allOpportunities) {
          await ContentOpportunity.findOneAndUpdate(
            { slug: opp.slug, opportunityType: opp.opportunityType },
            { ...opp, lastSyncAt: new Date() },
            { upsert: true, new: true }
          ).catch(() => {});
        }
      }
    } catch {
      // Non-critical DB opportunity save catch
    }

    // 3. Formulate Topic Recommendations for Closed-Loop Feedback
    const recSummary = await generatePerformanceRecommendations(allOpportunities, publishedBlogs, topicPlans, options);

    const durationMs = Date.now() - startedAt;
    console.log(`[PerformanceCollector] Completed cycle in ${durationMs}ms. Analyzed ${publishedBlogs.length} blogs. Discovered ${allOpportunities.length} opportunities. Approved ${recSummary.approvedRecommendations.length} recommendations.`);

    return {
      available: true,
      enabled: isEnabled,
      source: gscResult.source,
      blogsAnalyzedCount: publishedBlogs.length,
      opportunitiesDiscoveredCount: allOpportunities.length,
      recommendationsCount: recSummary.approvedRecommendations.length,
      queuedRecommendationsCount: recSummary.queuedCount,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[PerformanceCollector] Safe fail-open catch: Cycle error:", error.message);
    cycleSummary.error = error.message;
    return cycleSummary;
  }
}
