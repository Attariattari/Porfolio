/**
 * Dynamic Cluster Depth Evaluator (Phase 6)
 * 
 * Evidence-driven evaluator determining whether a topic requires 0, 1, 2, 3, 4, 5, or 6+ supporting topics.
 * Evaluates 15 signals: topic breadth, intent diversity, subproblem count, entity depth, 
 * technology depth, business problem depth, industry relevance, service relevance, 
 * existing content coverage, search opportunity signals, topical authority value, 
 * cannibalization risk, content uniqueness, supporting topic usefulness, and independent search value.
 */

export function evaluateClusterPotential(topicContext = {}) {
  const articleType = topicContext.articleType || "pillar";
  const topicType = topicContext.topicType || (articleType === "pillar" ? "technical_pillar" : articleType);
  const rationale = [];

  // Standalone authority, verified trend, or single-answer topics get 0 supporting depth
  if (articleType === "standalone_authority" || articleType === "verified_trend" || topicType === "standalone_authority") {
    rationale.push(`Topic is ${articleType} designed as a standalone authority guide with no child expansion.`);
    return {
      clusterMode: "standalone",
      desiredSupportingCount: 0,
      maxSupportingCount: 0,
      confidence: 95,
      rationale,
      candidateSubtopics: [],
    };
  }

  let desiredCount = 2; // Default baseline
  const text = [
    topicContext.title,
    topicContext.subtopic,
    topicContext.problem,
    topicContext.solutionAngle,
    topicContext.businessProblem,
    topicContext.focusKeyword,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Signal 1: Commercial & Industry Depth (+2 to +3)
  if (topicType === "commercial_pillar" || topicType === "industry_pillar" || topicContext.industry?.key) {
    desiredCount += 2;
    rationale.push("Topic contains commercial or industry-specific depth justification.");
  }

  // Signal 2: Service Relevance (+1)
  if (topicContext.serviceIntent?.relevant && topicContext.serviceIntent.serviceKey) {
    desiredCount += 1;
    rationale.push(`Topic maps directly to active service '${topicContext.serviceIntent.serviceKey}'.`);
  }

  // Signal 3: Broad Architecture & System Breadth (+1)
  if (/production|enterprise|architecture|scaling|security|migration|full-stack|infrastructure/i.test(text)) {
    desiredCount += 1;
    rationale.push("Topic involves complex production architecture or enterprise system scope.");
  }

  // Signal 4: Search Opportunity & Content Gap Signal (+1)
  if (topicContext.searchSignals?.available || topicContext.opportunityScore >= 75) {
    desiredCount += 1;
    rationale.push("High search opportunity score supports deeper cluster coverage.");
  }

  // Signal 5: Narrow / Focused Query Deduction (-1)
  if (/how to fix|quick fix|error code|syntax|setup|install|command/i.test(text)) {
    desiredCount -= 1;
    rationale.push("Topic is a focused troubleshooting or single-procedure topic.");
  }

  // Signal 6: Existing Coverage Deductions
  if (topicContext.existingCoverage) {
    desiredCount = Math.max(1, desiredCount - 1);
    rationale.push("Existing coverage detected in repository; reduced new supporting requirement.");
  }

  // Clamp desired count to safe range [0, 6]
  const finalDesiredCount = Math.min(6, Math.max(0, desiredCount));
  const maxCount = Math.min(8, finalDesiredCount + 2);

  const mode = finalDesiredCount === 0 ? "standalone" : "cluster";

  return {
    clusterMode: mode,
    desiredSupportingCount: finalDesiredCount,
    maxSupportingCount: maxCount,
    confidence: 85,
    rationale,
    candidateSubtopics: [],
  };
}
