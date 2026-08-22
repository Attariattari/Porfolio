/**
 * Think10X Topic KillCritic Gate (Phase 8)
 * 
 * Pre-generation topic quality control gate answering:
 * "Should this topic be generated and published at all?"
 * 
 * Evaluates topic intent, audience fit, business value, service relevance, cluster justification, 
 * search opportunity, and cannibalization risk BEFORE article content generation.
 * 
 * Completely separate from existing post-generation article QC (blogAuditEngine.js).
 * Includes 100% safe fallback (never crashes queue on API/JSON failure) and missing signal tolerance.
 */

import { scoreTopicOpportunity, evaluateHardTopicRejection } from "./opportunityEngine.js";
import { evaluateClusterPotential } from "./clusterDepthEvaluator.js";
import { validateSupportingTopicCandidate } from "./clusterValidator.js";

export function evaluateTopicKillCritic(topicContext = {}, signals = {}, existingPool = []) {
  const missingSignals = [];

  // Check signal availability
  if (!signals || signals.available === false || signals.isEstimated !== false) {
    missingSignals.push("GSC_LIVE_API");
  }
  if (!topicContext.serviceSlug && !topicContext.serviceIntent?.relevant) {
    missingSignals.push("DIRECT_SERVICE_MAPPING");
  }

  // 1. Hard Safety Rejections First (Duplicates & Unlinked Supporting Topics)
  const hardCheck = evaluateHardTopicRejection(topicContext, existingPool);
  if (!hardCheck.eligible) {
    return {
      decision: "reject",
      score: 0,
      confidence: 1.0,
      reasonCodes: [String(hardCheck.reason).toUpperCase()],
      strengths: [],
      risks: [`Hard safety rejection: ${hardCheck.reason}`],
      missingSignals,
      recommendedAction: "Reject candidate due to duplicate or invalid structure",
      clusterDecision: {
        type: "standalone",
        recommendedSupportingCount: 0,
      },
      evaluatedAt: new Date().toISOString(),
      criticVersion: "1.0.0",
    };
  }

  // 2. Supporting Topic Parent Validation
  if (topicContext.articleType === "supporting" && parentPillarRef(topicContext)) {
    const parent = parentPillarRef(topicContext);
    const childCheck = validateSupportingTopicCandidate(topicContext, parent, existingPool);
    if (!childCheck.valid) {
      return {
        decision: "reject",
        score: 20,
        confidence: 0.9,
        reasonCodes: ["INVALID_SUPPORTING_CHILD"],
        strengths: [],
        risks: [childCheck.rejectionReason],
        missingSignals,
        recommendedAction: "Reject supporting topic due to redundancy or kw overlap",
        clusterDecision: { type: "standalone", recommendedSupportingCount: 0 },
        evaluatedAt: new Date().toISOString(),
        criticVersion: "1.0.0",
      };
    }
  }

  // 3. Compute Deterministic Opportunity Score & Cluster Potential
  const scoreResult = scoreTopicOpportunity(topicContext, signals);
  const clusterPlan = evaluateClusterPotential(topicContext);

  const score = scoreResult.score;
  const reasonCodes = [];
  const strengths = [...scoreResult.scoreReasons];
  const risks = [];

  // 4. Decision Threshold Mapping
  let decision = "pass";
  let recommendedAction = "Promote candidate to ready execution queue";

  if (score >= 80) {
    decision = "pass";
    reasonCodes.push("HIGH_OPPORTUNITY_SCORE");
  } else if (score >= 60) {
    decision = "pass";
    reasonCodes.push("NORMAL_QUALIFIED_SCORE");
  } else if (score >= 50) {
    decision = "hold";
    reasonCodes.push("BORDERLINE_SCORE_HOLD");
    risks.push("Score is borderline (50-59); held for additional search/trend signals");
    recommendedAction = "Hold candidate in reserve queue awaiting additional evidence";
  } else {
    decision = "reject";
    reasonCodes.push("LOW_STRATEGIC_VALUE");
    risks.push("Topic score below 50 minimum strategic threshold");
    recommendedAction = "Reject low-opportunity topic candidate";
  }

  if (topicContext.isTrend || topicContext.articleType === "verified_trend") {
    decision = "pass";
    reasonCodes.push("VERIFIED_TREND_OVERRIDE");
    recommendedAction = "Pass verified ecosystem trend topic immediately";
  } else if (topicContext.articleType === "standalone_authority") {
    decision = "pass";
    reasonCodes.push("STANDALONE_AUTHORITY_OVERRIDE");
    recommendedAction = "Pass standalone authority topic immediately";
  }

  return {
    decision,
    score,
    confidence: scoreResult.dataConfidence,
    reasonCodes,
    strengths,
    risks,
    missingSignals,
    recommendedAction,
    clusterDecision: {
      type: clusterPlan.clusterMode,
      recommendedSupportingCount: clusterPlan.desiredSupportingCount,
    },
    evaluatedAt: new Date().toISOString(),
    criticVersion: "1.0.0",
  };
}

function parentPillarRef(topic = {}) {
  if (topic.parentPillarBlog || topic.parentPillarTopic || topic.parentPillar) {
    return topic.parentPillarBlog || topic.parentPillarTopic || topic.parentPillar;
  }
  if (typeof topic.pillar === "object" && topic.pillar !== null) {
    return topic.pillar;
  }
  if (typeof topic.pillar === "string" && topic.pillar.length > 0) {
    return { title: topic.pillar };
  }
  return null;
}
