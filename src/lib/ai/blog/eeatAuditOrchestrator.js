/**
 * Master EEAT + Factual Accuracy + Editorial Intelligence Audit Orchestrator (Phase 6)
 * 
 * Aggregates Factual Accuracy, Fabrication Detection, EEAT Evaluation,
 * Code/Technical Consistency, and Editorial Quality into a unified decision engine.
 * 
 * FAIL-SAFE GUARANTEE:
 * - Controlled by BLOG_INTELLIGENCE_STRICT_MODE (defaults to false).
 * - When strict mode is false, any evaluation exception/timeout logs a warning
 *   and defaults to status: "degraded", decision: "PASS" (fail open).
 * - NEVER halts article generation or daily cron queue execution on audit failure.
 */

import { evaluateFactualAccuracy } from "./factualAccuracyEngine.js";
import { evaluateEeatAndEditorial } from "./eeatIntelligenceEngine.js";

/**
 * Master Phase 6 EEAT Audit Orchestrator.
 * 
 * @param {Object} blogData - Generated blog data object
 * @param {Object} [options={}] - Options ({ researchPackage, topicPlan, timeoutMs })
 * @returns {Promise<Object>} Standardized Phase 6 Audit Output Contract
 */
export async function runEeatAuditIntelligence(blogData = {}, options = {}) {
  const startedAt = Date.now();
  const strictMode = process.env.BLOG_INTELLIGENCE_STRICT_MODE === "true" || options.strictMode === true;

  if (!blogData || (!blogData.title && !blogData.content)) {
    return {
      success: true,
      decision: "PASS",
      status: "degraded",
      overallScore: 7.5,
      eeat: { experience: 7.5, expertise: 7.5, authority: 7.5, trust: 7.5 },
      factualAccuracy: { score: 7.5, verificationStatus: "not_verified", claims: [], unsupportedClaims: [], highRiskClaims: [] },
      editorial: { score: 7.5, strengths: [], issues: ["Skipped evaluation due to empty input."] },
      fabricationRisk: { detected: false, severity: "NONE", claims: [] },
      technicalConsistency: { score: 7.5, contradictions: [] },
      revisionFeedback: [],
      metadata: { engineVersion: "1.0.0", auditedAt: new Date().toISOString(), durationMs: Date.now() - startedAt },
    };
  }

  try {
    const researchPackage = options.researchPackage || null;

    // 1. Factual Accuracy & Fabrication Evaluation
    const factAudit = evaluateFactualAccuracy(blogData, researchPackage, options);

    // 2. EEAT & Editorial Quality Evaluation
    const eeatEditorial = evaluateEeatAndEditorial(blogData, options);

    // Score Aggregation (0–10 Scale)
    const eeat = eeatEditorial.eeat;
    const editorial = eeatEditorial.editorial;
    const technicalConsistency = eeatEditorial.technicalConsistency;
    const fabricationRisk = factAudit.fabricationRisk;

    const overallScore = Math.round(
      (factAudit.score * 0.25 +
        eeat.expertise * 0.20 +
        eeat.experience * 0.20 +
        eeat.trust * 0.15 +
        editorial.score * 0.10 +
        technicalConsistency.score * 0.10) *
        10
    ) / 10;

    // Revision Feedback Assembly
    const revisionFeedback = [];
    if (fabricationRisk.detected) {
      revisionFeedback.push(`Fabrication Risk (${fabricationRisk.severity}): Remove or reword unverified statistics/client claims: ${fabricationRisk.claims.join("; ")}.`);
    }
    if (technicalConsistency.contradictions.length > 0) {
      revisionFeedback.push(`Technical Contradictions: ${technicalConsistency.contradictions.join("; ")}.`);
    }
    if (editorial.issues.length > 0) {
      revisionFeedback.push(`Editorial Issues: ${editorial.issues.join("; ")}.`);
    }
    if (factAudit.unsupportedClaims.length > 0 && factAudit.unsupportedClaims.length > 3) {
      revisionFeedback.push(`Unsupported Claims: Ground performance numbers in realistic engineering context.`);
    }

    // Decision Engine Logic
    let decision = "PASS";

    if (fabricationRisk.detected && (fabricationRisk.severity === "CRITICAL" || fabricationRisk.severity === "HIGH")) {
      decision = "BLOCK";
    } else if (technicalConsistency.contradictions.length > 0 || overallScore < 7.0) {
      decision = "REVISION_REQUIRED";
    } else if (overallScore < 8.5 || revisionFeedback.length > 0) {
      decision = "PASS_WITH_WARNINGS";
    } else {
      decision = "PASS";
    }

    const durationMs = Date.now() - startedAt;
    console.log(`[EEAT-Intelligence] Evaluated article in ${durationMs}ms. Score: ${overallScore}/10 | Fabrication Risk: ${fabricationRisk.severity} | Decision: ${decision}`);

    return {
      success: true,
      status: "completed",
      decision,
      overallScore,
      eeat,
      factualAccuracy: factAudit,
      editorial,
      fabricationRisk,
      technicalConsistency,
      revisionFeedback,
      metadata: {
        engineVersion: "1.0.0",
        auditedAt: new Date().toISOString(),
        durationMs,
      },
    };
  } catch (err) {
    console.warn(`[EEAT-Intelligence] Safe fail-open catch: ${err.message}`);
    if (strictMode) {
      return {
        success: false,
        status: "failed",
        decision: "REVISION_REQUIRED",
        overallScore: 5.0,
        error: err.message,
        metadata: { engineVersion: "1.0.0", auditedAt: new Date().toISOString(), durationMs: Date.now() - startedAt },
      };
    }

    return {
      success: true,
      status: "degraded",
      decision: "PASS",
      overallScore: 7.5,
      eeat: { experience: 7.5, expertise: 7.5, authority: 7.5, trust: 7.5 },
      factualAccuracy: { score: 7.5, verificationStatus: "not_verified", claims: [], unsupportedClaims: [], highRiskClaims: [] },
      editorial: { score: 7.5, strengths: [], issues: ["Engine encountered exception; failed open safely."] },
      fabricationRisk: { detected: false, severity: "NONE", claims: [] },
      technicalConsistency: { score: 7.5, contradictions: [] },
      revisionFeedback: [],
      metadata: { engineVersion: "1.0.0", auditedAt: new Date().toISOString(), durationMs: Date.now() - startedAt },
    };
  }
}
