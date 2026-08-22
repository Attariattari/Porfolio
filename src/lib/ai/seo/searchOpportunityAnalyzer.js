/**
 * Search Opportunity Analyzer (Phase 5)
 * 
 * Evaluates search signals and query clusters against existing published Blog content 
 * and BlogTopicPlan records.
 * 
 * Classifies opportunities and assigns recommended actions:
 * - optimize_existing
 * - expand_existing_cluster
 * - potential_new_supporting
 * - potential_new_pillar
 * - potential_standalone
 * - no_action
 * - monitor
 * 
 * Crucially checks existing coverage (existingCoverage = true) to prevent creating redundant topics.
 */

import { analyzeCannibalization } from "../intelligence/cannibalizationAnalyzer.js";
import { classifyIntentAndAudience } from "../intelligence/intentClassifier.js";

const normalizeTerm = (str = "") => String(str).toLowerCase().replace(/[^a-z0-9]/g, "");

export function checkExistingCoverage(query = "", blogs = [], topicPlans = []) {
  const normQuery = normalizeTerm(query);

  const matchedBlogs = (blogs || []).filter((blog) => {
    const normTitle = normalizeTerm(blog.title || "");
    const normSlug = normalizeTerm(blog.slug || "");
    const normKw = normalizeTerm(blog.focusKeyword || "");
    return normTitle.includes(normQuery) || normSlug.includes(normQuery) || normKw.includes(normQuery) || (normQuery.length > 5 && normTitle.includes(normQuery.slice(0, 15)));
  });

  const matchedPlans = (topicPlans || []).filter((plan) => {
    const normTitle = normalizeTerm(plan.title || "");
    const normKw = normalizeTerm(plan.focusKeyword || "");
    return normTitle.includes(normQuery) || normKw.includes(normQuery);
  });

  const hasCoverage = matchedBlogs.length > 0 || matchedPlans.length > 0;

  const linkedContent = [
    ...matchedBlogs.map((b) => ({ contentType: "blog", id: b._id, title: b.title, slug: b.slug })),
    ...matchedPlans.map((p) => ({ contentType: "topic_plan", id: p._id, title: p.title, slug: p.fingerprint || p.clusterKey })),
  ];

  return {
    hasCoverage,
    linkedContent,
    matchedBlogCount: matchedBlogs.length,
    matchedPlanCount: matchedPlans.length,
  };
}

export function analyzeSearchOpportunities({ clusters = [], blogs = [], topicPlans = [] } = {}) {
  const results = [];

  for (const cluster of clusters) {
    const query = cluster.primaryQuery;
    const impressions = cluster.totalImpressions || 0;
    const clicks = cluster.totalClicks || 0;
    const ctr = cluster.ctr || 0;
    const pos = cluster.averagePosition || 0;

    const coverage = checkExistingCoverage(query, blogs, topicPlans);
    const intentInfo = classifyIntentAndAudience({ title: query, searchIntent: "informational" });

    let opportunityType = "stable";
    let recommendedAction = "no_action";
    let opportunityScore = 50;

    // 1. High Impressions + Low CTR on Existing Content -> Optimize Title/Snippet
    if (coverage.hasCoverage && pos >= 4 && pos <= 20 && impressions >= 300 && ctr < 3.0) {
      opportunityType = "optimization";
      recommendedAction = "optimize_existing";
      opportunityScore = Math.min(95, 60 + Math.round(impressions / 100));
    }
    // 2. Near-Page-One Ranking -> Expand Existing Cluster
    else if (coverage.hasCoverage && pos >= 4 && pos <= 20 && impressions >= 150) {
      opportunityType = "near_page_one";
      recommendedAction = "expand_existing_cluster";
      opportunityScore = Math.min(90, 55 + Math.round(impressions / 150));
    }
    // 3. Uncovered Demand with High Impressions -> Potential New Pillar or Supporting Topic
    else if (!coverage.hasCoverage && impressions >= 200) {
      opportunityType = "content_gap";
      recommendedAction = impressions >= 800 ? "potential_new_pillar" : "potential_new_supporting";
      opportunityScore = Math.min(95, 70 + Math.round(impressions / 200));
    }
    // 4. Uncovered Demand with Moderate Impressions -> Potential Standalone Topic
    else if (!coverage.hasCoverage && impressions >= 50) {
      opportunityType = "content_gap";
      recommendedAction = "potential_standalone";
      opportunityScore = 65;
    }
    // 5. Existing Content with Strong Position (1-3) -> No Action Needed
    else if (coverage.hasCoverage && pos <= 3.5) {
      opportunityType = "stable";
      recommendedAction = "no_action";
      opportunityScore = 40;
    }
    // 6. Low Demand / Low Signals -> Monitor
    else {
      opportunityType = "stable";
      recommendedAction = "monitor";
      opportunityScore = 30;
    }

    // Cannibalization Risk Evaluation
    const cannibalCheck = analyzeCannibalization({ title: query, focusKeyword: query }, [...blogs, ...topicPlans]);
    const cannibalizationRisk = cannibalCheck.approved ? (coverage.hasCoverage ? 40 : 0) : 90;

    // Downgrade recommended action if high cannibalization risk
    if (cannibalizationRisk >= 80 && recommendedAction.startsWith("potential_new")) {
      recommendedAction = coverage.hasCoverage ? "expand_existing_cluster" : "monitor";
    }

    results.push({
      queryCluster: cluster.clusterKey,
      primaryQuery: query,
      normalizedQuery: query.toLowerCase(),
      relatedQueries: cluster.relatedQueries,
      searchIntent: intentInfo.intent || "informational",
      existingCoverage: coverage.hasCoverage,
      linkedContent: coverage.linkedContent,
      impressions,
      clicks,
      ctr,
      averagePosition: pos,
      opportunityType,
      recommendedAction,
      opportunityScore,
      cannibalizationRisk,
      lastObservedAt: new Date().toISOString(),
    });
  }

  return results.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
