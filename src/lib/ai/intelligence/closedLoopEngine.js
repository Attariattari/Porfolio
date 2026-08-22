/**
 * Closed-Loop Self-Improving Content Engine
 * 
 * Coordinates the full performance feedback cycle:
 * DISCOVER -> CLASSIFY -> SCORE -> PLAN -> GENERATE -> CRITIC -> PUBLISH -> MEASURE -> LEARN -> REPEAT.
 * 
 * Ingests GSC ranking opportunities, real performance feedback, and topical authority graph gaps 
 * to automatically generate and queue high-value topic recommendations.
 */

import { detectGscOpportunities } from "../seo/gscProvider.js";
import { buildTopicalAuthorityGraph } from "../seo/topicalAuthorityGraph.js";
import { analyzeContentGaps } from "./contentGapAnalyzer.js";
import { analyzeCannibalization } from "./cannibalizationAnalyzer.js";

export async function runClosedLoopCycle({ blogs = [], topicPlans = [], performanceRecords = [] } = {}) {
  const logTrace = [];
  const log = (msg) => {
    console.log(`[ClosedLoopEngine] ${msg}`);
    logTrace.push(msg);
  };

  log("Starting closed-loop self-improving content evaluation...");

  // Step 1: Detect GSC Ranking Opportunities
  const gscOpportunities = detectGscOpportunities(performanceRecords);
  log(`Detected GSC Opportunities -> Optimization: ${gscOpportunities.optimization.length}, Supporting Cluster: ${gscOpportunities.supportingCluster.length}, Conversion: ${gscOpportunities.conversion.length}`);

  // Step 2: Build Topical Authority Graph & Analyze Content Gaps
  const graph = buildTopicalAuthorityGraph({ blogs, topicPlans });
  const gaps = analyzeContentGaps({ blogs, topicPlans });
  log(`Topical Graph Analyzed -> Weak Clusters: ${graph.weakClusters.length}, Orphan Pages: ${graph.orphanPages.length}, Orphan Pillars: ${gaps.orphanPillars.length}`);

  // Step 3: Formulate Recommendations
  const proposedRecommendations = [];

  // A. Generate supporting topic recommendations for GSC supporting cluster opportunities
  for (const item of gscOpportunities.supportingCluster.slice(0, 3)) {
    const parentBlog = blogs.find((b) => b._id === item.blogId || b.slug === item.slug);
    if (parentBlog && item.topQueries.length) {
      const topSubQuery = item.topQueries[0]?.query || "Subtopic";
      proposedRecommendations.push({
        title: `Deep Dive: ${topSubQuery} (${parentBlog.title})`,
        articleType: "supporting",
        contentCategory: parentBlog.contentCategory || "core_web_engineering",
        clusterKey: parentBlog.clusterKey || `gsc-${parentBlog.slug}`,
        clusterTitle: parentBlog.title,
        parentPillarBlogId: parentBlog._id,
        subtopic: topSubQuery,
        problem: `Addressing specific search demand for "${topSubQuery}" ranking at position ${item.position}.`,
        solutionAngle: `Comprehensive technical breakdown of ${topSubQuery}.`,
        focusKeyword: topSubQuery,
        searchIntent: "informational",
        decisionSource: "closed_loop_gsc",
        opportunityScore: 88,
      });
    }
  }

  // B. Generate orphan pillar supporting recommendations
  for (const orphan of gaps.orphanPillars.slice(0, 3)) {
    proposedRecommendations.push({
      title: `Practical Implementation Guide: ${orphan.title}`,
      articleType: "supporting",
      contentCategory: "core_web_engineering",
      clusterKey: orphan.clusterKey,
      clusterTitle: orphan.title,
      parentPillarBlogId: orphan.pillarBlogId,
      subtopic: `Practical ${orphan.title}`,
      problem: `Orphan pillar "${orphan.title}" requires supporting content for topical depth.`,
      solutionAngle: `Step-by-step implementation guide.`,
      focusKeyword: `practical ${orphan.title.toLowerCase()}`,
      searchIntent: "problem_solving",
      decisionSource: "closed_loop_graph",
      opportunityScore: 85,
    });
  }

  // Step 4: Deduplicate against existing topic queue
  const approvedRecommendations = [];
  for (const candidate of proposedRecommendations) {
    const check = analyzeCannibalization(candidate, [...blogs, ...topicPlans]);
    if (check.approved) {
      approvedRecommendations.push(candidate);
    } else {
      log(`Recommendation "${candidate.title}" rejected: ${check.matchReason}`);
    }
  }

  log(`Closed-loop cycle finished. Approved ${approvedRecommendations.length} recommendations for queueing.`);

  return {
    success: true,
    gscOpportunities,
    graph,
    gaps,
    proposedCount: proposedRecommendations.length,
    approvedRecommendations,
    logTrace,
    timestamp: new Date().toISOString(),
  };
}
