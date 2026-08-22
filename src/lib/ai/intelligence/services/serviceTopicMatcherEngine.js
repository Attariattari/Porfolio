/**
 * Service ↔ Topic Intelligence & Multi-Signal Matcher Engine (Phase 3)
 * 
 * Evaluates topic candidates against live MongoDB services using a 9-signal 
 * deterministic scoring model:
 * 
 * 1. Problem Relevance (20%)
 * 2. Solution / Capability Relevance (20%)
 * 3. Search / Commercial Intent (15%)
 * 4. Audience Relevance (10%)
 * 5. Industry Relevance (10%)
 * 6. Topic / Keyword Relevance (10%)
 * 7. Technology Relevance (5%)
 * 8. Topic Cluster Relevance (5%)
 * 9. Explicit Context / Relationship (5%)
 * 
 * Classifications:
 * - 90-100 -> highly_relevant
 * - 75-89  -> strong
 * - 55-74  -> moderate
 * - 30-54  -> weak
 * - 0-29   -> none
 * 
 * Features:
 * - Primary vs Secondary service resolution
 * - Search Intent vs Commercial Strength separation
 * - Explanation-first human-readable reason strings
 * - Service coverage & gap detection
 * - 100% Fail-Safe try-catch encapsulation
 */

import { getServiceIntelligenceSnapshot, getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";
import { calculateServiceRelevanceScore } from "./serviceClassificationScoring.js";

const STOP_WORDS = new Set([
  "and", "for", "with", "how", "what", "this", "that", "your", "website", "web", "guide", "into", "from", "build",
  "custom", "development", "services", "system", "setup", "management", "pricing", "cost", "service", "app", "tool"
]);

function tokenizeText(text = "") {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

const clamp = (val) => Math.min(100, Math.max(0, Number(val) || 0));

export function classifyMatchGrade(score = 0) {
  if (score >= 90) return "highly_relevant";
  if (score >= 75) return "strong";
  if (score >= 55) return "moderate";
  if (score >= 30) return "weak";
  return "none";
}

export function determineCommercialStrength(searchIntent = "", text = "") {
  const intentStr = String(searchIntent).toLowerCase();
  const lowerText = String(text).toLowerCase();

  if (/hire|book a call|quote|pricing guide|development cost|agency/i.test(lowerText) || intentStr === "transactional") {
    return { commercialIntent: "TRANSACTIONAL", commercialStrength: "very_high" };
  }
  if (/cost|price|vs|versus|comparison|best framework|evaluating/i.test(lowerText) || intentStr === "commercial" || intentStr === "commercial_investigation") {
    return { commercialIntent: "COMMERCIAL_INVESTIGATION", commercialStrength: "high" };
  }
  if (/service|development company|agency/i.test(lowerText) || intentStr === "service_evaluation") {
    return { commercialIntent: "SERVICE_EVALUATION", commercialStrength: "high" };
  }
  return { commercialIntent: "INFORMATIONAL", commercialStrength: "low" };
}

/**
 * Main Multi-Signal Matching Function.
 * 
 * @param {Object} topicCandidate - Topic candidate object
 * @param {Object} [options={}] - Options ({ snapshot: Array, minScore: number })
 * @returns {Promise<Object>} Comprehensive Service-Topic Relationship Object
 */
export async function matchTopicToServices(topicCandidate = {}, options = {}) {
  try {
    const candidate = topicCandidate || {};
    let snapshot = options.snapshot;
    if (!Array.isArray(snapshot) || snapshot.length === 0) {
      snapshot = await getServiceIntelligenceSnapshot().catch(() => getServiceIntelligenceSnapshotSync());
    }

    const title = String(candidate.title || candidate.topic || "").trim();
    const focusKeyword = String(candidate.focusKeyword || "").trim();
    const problem = String(candidate.problem || candidate.businessProblem || candidate.need || "").trim();
    const solution = String(candidate.solution || candidate.solutionAngle || "").trim();
    const audience = String(candidate.audience || "").trim();
    const industry = typeof candidate.industry === "string" ? candidate.industry : candidate.industry?.key || "";
    const searchIntent = String(candidate.searchIntent || candidate.intent || "informational").trim();
    const explicitSlugs = Array.isArray(candidate.relatedServiceSlugs) ? candidate.relatedServiceSlugs : [];

    const fullText = [title, focusKeyword, problem, solution, audience, industry].filter(Boolean).join(" ");
    const topicTokens = tokenizeText(fullText);
    const intentData = determineCommercialStrength(searchIntent, fullText);

    // Negative penalty for pure technical troubleshooting (syntax errors, closures)
    const isPureTroubleshooting = /syntax error|closure|null pointer|undefined|variable scope|typeerror/i.test(fullText);

    const scoredServices = snapshot.map((service) => {
      let problemRel = 30;
      let solutionRel = 30;
      let intentRel = intentData.commercialStrength === "very_high" || intentData.commercialStrength === "high" ? 85 : 50;
      let audienceRel = 50;
      let industryRel = 50;
      let keywordRel = 10;
      let techRel = 10;
      let clusterRel = 30;
      let explicitRel = explicitSlugs.includes(service.slug) ? 100 : 0;

      const reasons = [];

      // A. Explicit Match
      if (explicitRel > 0) {
        reasons.push(`Explicitly linked to service '${service.title}' in topic plan.`);
      }

      // B. Classification Scoring Base
      const classResult = calculateServiceRelevanceScore(service.slug, {
        text: fullText,
        problem,
        useCase: solution,
        audience,
        industry,
        intent: intentData.commercialIntent
      });

      // C. Title & Slug Overlap
      const lowerFullText = fullText.toLowerCase();
      const cleanSlug = service.slug.replace(/-/g, " ");
      const servTitleTokens = tokenizeText(service.title);
      let titleOverlap = 0;
      for (const t of servTitleTokens) {
        if (topicTokens.has(t) || lowerFullText.includes(t)) titleOverlap++;
      }

      if (lowerFullText.includes(cleanSlug) || lowerFullText.includes(service.title.toLowerCase()) || titleOverlap >= 1) {
        keywordRel = Math.min(100, 85 + titleOverlap * 10);
        reasons.push(`Direct title/slug keyword alignment with '${service.title}'.`);
      }

      if (service.slug === "nextjs-website-development" && /next\.?js|react website/i.test(lowerFullText)) {
        keywordRel = Math.max(keywordRel, 95);
      }
      if (service.slug === "e-commerce-website-development" && /ecommerce|e-commerce|online store/i.test(lowerFullText)) {
        keywordRel = Math.max(keywordRel, 95);
      }
      if (service.slug === "website-speed-optimization" && /speed|core web vitals|performance/i.test(lowerFullText)) {
        keywordRel = Math.max(keywordRel, 95);
      }

      // D. Problem Relevance (20%)
      const isProbMatch = service.problemsSolved.some((p) =>
        tokenizeText(p).size > 0 && [...tokenizeText(p)].some((t) => topicTokens.has(t))
      );
      if (isProbMatch) {
        problemRel = 95;
        reasons.push(`Addresses core business problem solved by ${service.title}.`);
      } else if (keywordRel >= 90) {
        problemRel = Math.max(88, classResult.signals.problemMatch || 85);
      } else if (keywordRel >= 70) {
        problemRel = classResult.signals.problemMatch || 80;
      }

      // E. Solution & Capability Relevance (20%)
      const isSolMatch = service.deliverables.some((d) =>
        tokenizeText(d).size > 0 && [...tokenizeText(d)].some((t) => topicTokens.has(t))
      );
      if (isSolMatch) {
        solutionRel = 95;
        reasons.push(`Requires technical capabilities provided by ${service.title}.`);
      } else if (keywordRel >= 90) {
        solutionRel = Math.max(88, classResult.signals.useCaseMatch || 85);
      } else if (keywordRel >= 70) {
        solutionRel = classResult.signals.useCaseMatch || 80;
      }

      // F. Audience & Industry Relevance
      if (keywordRel >= 90) {
        audienceRel = Math.max(85, classResult.signals.audienceMatch || 80);
        industryRel = Math.max(85, classResult.signals.industryMatch || 80);
      } else if (keywordRel >= 70) {
        audienceRel = classResult.signals.audienceMatch || 75;
        industryRel = classResult.signals.industryMatch || 75;
      }

      // G. Technology Overlap
      const servTechs = service.technologies || [];
      const matchedTechs = servTechs.filter((t) => topicTokens.has(t.toLowerCase()));
      if (matchedTechs.length > 0) {
        techRel = Math.min(100, 75 + matchedTechs.length * 10);
        reasons.push(`Direct technology stack alignment (${matchedTechs.join(", ")}).`);
      }

      // 9-Signal Weighted Score Calculation
      let rawScore = Math.round(
        problemRel * 0.20 +
        solutionRel * 0.20 +
        intentRel * 0.15 +
        audienceRel * 0.10 +
        industryRel * 0.10 +
        keywordRel * 0.10 +
        techRel * 0.05 +
        clusterRel * 0.05 +
        explicitRel * 0.05
      );

      if (isPureTroubleshooting) {
        rawScore = Math.max(0, rawScore - 40);
        reasons.push("Pure technical educational troubleshooting topic; commercial service relevance reduced.");
      }

      const finalScore = clamp(rawScore);
      const classification = classifyMatchGrade(finalScore);

      return {
        serviceSlug: service.slug,
        serviceTitle: service.title,
        score: finalScore,
        classification,
        signals: {
          problemRelevance: problemRel,
          solutionRelevance: solutionRel,
          intentRelevance: intentRel,
          audienceRelevance: audienceRel,
          industryRelevance: industryRel,
          keywordRelevance: keywordRel,
          technologyRelevance: techRel,
        },
        reasons: reasons.length > 0 ? reasons : ["General domain technical relevance."],
      };
    });

    scoredServices.sort((a, b) => b.score - a.score);

    const topMatch = scoredServices[0];
    const hasStrongPrimary = topMatch && topMatch.score >= 55;
    const primaryService = hasStrongPrimary ? topMatch : null;

    const secondaryServices = scoredServices
      .filter((s) => s.score >= 50 && s.serviceSlug !== primaryService?.serviceSlug)
      .slice(0, 2);

    const overallServiceRelevance = topMatch ? topMatch.score : 0;
    const matchClassification = classifyMatchGrade(overallServiceRelevance);

    // Service Coverage & Potential Service Gap Analysis
    let serviceCoverage = "low";
    let potentialServiceGap = false;

    if (overallServiceRelevance >= 80) {
      serviceCoverage = "strong";
    } else if (overallServiceRelevance >= 55) {
      serviceCoverage = "moderate";
    } else {
      serviceCoverage = "low";
      if (intentData.commercialStrength === "high" || intentData.commercialStrength === "very_high") {
        potentialServiceGap = true;
      }
    }

    const relatedServiceSlugs = [
      ...(primaryService ? [primaryService.serviceSlug] : []),
      ...secondaryServices.map((s) => s.serviceSlug),
      ...explicitSlugs,
    ];

    return {
      success: true,
      topicTitle: title,
      primaryService: primaryService
        ? {
            slug: primaryService.serviceSlug,
            title: primaryService.serviceTitle,
            relevanceScore: primaryService.score,
            classification: primaryService.classification,
            reasons: primaryService.reasons,
          }
        : null,
      secondaryServices: secondaryServices.map((s) => ({
        slug: s.serviceSlug,
        title: s.serviceTitle,
        relevanceScore: s.score,
        classification: s.classification,
        reasons: s.reasons,
      })),
      overallServiceRelevance,
      matchClassification,
      commercialIntent: intentData.commercialIntent,
      commercialStrength: intentData.commercialStrength,
      serviceCoverage,
      potentialServiceGap,
      relatedServiceSlugs: [...new Set(relatedServiceSlugs)],
      matchedAt: new Date().toISOString(),
      matcherVersion: "v3_multi_signal",
    };
  } catch (err) {
    console.warn("[ServiceTopicMatcherEngine] Failure safety catch:", err.message);
    return {
      success: true,
      topicTitle: topicCandidate?.title || "",
      primaryService: null,
      secondaryServices: [],
      overallServiceRelevance: 0,
      matchClassification: "none",
      commercialIntent: "INFORMATIONAL",
      commercialStrength: "low",
      serviceCoverage: "low",
      potentialServiceGap: false,
      relatedServiceSlugs: topicCandidate?.relatedServiceSlugs || [],
      error: err.message,
    };
  }
}

/**
 * Synchronous variant of matchTopicToServices for synchronous scoring functions.
 */
export function matchTopicToServicesSync(topicCandidate = {}, options = {}) {
  const syncSnapshot = options.snapshot || getServiceIntelligenceSnapshotSync();
  const rawCandidate = topicCandidate || {};
  const candidate = typeof rawCandidate === "object" ? rawCandidate : {};

  const title = String(candidate.title || candidate.topic || "").trim();
  const focusKeyword = String(candidate.focusKeyword || "").trim();
  const problem = String(candidate.problem || candidate.businessProblem || candidate.need || "").trim();
  const solution = String(candidate.solution || candidate.solutionAngle || "").trim();
  const audience = String(candidate.audience || "").trim();
  const industry = typeof candidate.industry === "string" ? candidate.industry : candidate.industry?.key || "";
  const searchIntent = String(candidate.searchIntent || candidate.intent || "informational").trim();
  const explicitSlugs = Array.isArray(candidate.relatedServiceSlugs) ? candidate.relatedServiceSlugs : [];

  const fullText = [title, focusKeyword, problem, solution, audience, industry].filter(Boolean).join(" ");
  const topicTokens = tokenizeText(fullText);
  const intentData = determineCommercialStrength(searchIntent, fullText);
  const isPureTroubleshooting = /syntax error|closure|null pointer|undefined|variable scope|typeerror/i.test(fullText);

  const scoredServices = syncSnapshot.map((service) => {
    let problemRel = 30;
    let solutionRel = 30;
    let intentRel = intentData.commercialStrength === "very_high" || intentData.commercialStrength === "high" ? 85 : 50;
    let audienceRel = 50;
    let industryRel = 50;
    let keywordRel = 10;
    let techRel = 10;
    let clusterRel = 30;
    let explicitRel = explicitSlugs.includes(service.slug) ? 100 : 0;

    const reasons = [];

    if (explicitRel > 0) reasons.push(`Explicitly linked to service '${service.title}'.`);

    const classResult = calculateServiceRelevanceScore(service.slug, {
      text: fullText,
      problem,
      useCase: solution,
      audience,
      industry,
      intent: intentData.commercialIntent
    });

    const lowerFullText = fullText.toLowerCase();
    const cleanSlug = service.slug.replace(/-/g, " ");
    const servTitleTokens = tokenizeText(service.title);
    let titleOverlap = 0;
    for (const t of servTitleTokens) {
      if (topicTokens.has(t) || lowerFullText.includes(t)) titleOverlap++;
    }

    if (lowerFullText.includes(cleanSlug) || lowerFullText.includes(service.title.toLowerCase()) || titleOverlap >= 1) {
      keywordRel = Math.min(100, 85 + titleOverlap * 10);
      reasons.push(`Direct title/slug keyword alignment with '${service.title}'.`);
    }

    if (service.slug === "nextjs-website-development" && /next\.?js|react website/i.test(lowerFullText)) {
      keywordRel = Math.max(keywordRel, 95);
    }
    if (service.slug === "e-commerce-website-development" && /ecommerce|e-commerce|online store/i.test(lowerFullText)) {
      keywordRel = Math.max(keywordRel, 95);
    }
    if (service.slug === "website-speed-optimization" && /speed|core web vitals|performance/i.test(lowerFullText)) {
      keywordRel = Math.max(keywordRel, 95);
    }

    const isProbMatch = service.problemsSolved.some((p) =>
      tokenizeText(p).size > 0 && [...tokenizeText(p)].some((t) => topicTokens.has(t))
    );
    if (isProbMatch) {
      problemRel = 95;
      reasons.push(`Addresses core business problem solved by ${service.title}.`);
    } else if (keywordRel >= 90) {
      problemRel = Math.max(88, classResult.signals.problemMatch || 85);
    } else if (keywordRel >= 70) {
      problemRel = classResult.signals.problemMatch || 80;
    }

    const isSolMatch = service.deliverables.some((d) =>
      tokenizeText(d).size > 0 && [...tokenizeText(d)].some((t) => topicTokens.has(t))
    );
    if (isSolMatch) {
      solutionRel = 95;
      reasons.push(`Requires technical capabilities provided by ${service.title}.`);
    } else if (keywordRel >= 90) {
      solutionRel = Math.max(88, classResult.signals.useCaseMatch || 85);
    } else if (keywordRel >= 70) {
      solutionRel = classResult.signals.useCaseMatch || 80;
    }

    if (keywordRel >= 90) {
      audienceRel = Math.max(85, classResult.signals.audienceMatch || 80);
      industryRel = Math.max(85, classResult.signals.industryMatch || 80);
    } else if (keywordRel >= 70) {
      audienceRel = classResult.signals.audienceMatch || 75;
      industryRel = classResult.signals.industryMatch || 75;
    }

    const servTechs = service.technologies || [];
    const matchedTechs = servTechs.filter((t) => topicTokens.has(t.toLowerCase()));
    if (matchedTechs.length > 0) {
      techRel = Math.min(100, 75 + matchedTechs.length * 10);
      reasons.push(`Direct technology stack alignment (${matchedTechs.join(", ")}).`);
    }

    let rawScore = Math.round(
      problemRel * 0.20 +
      solutionRel * 0.20 +
      intentRel * 0.15 +
      audienceRel * 0.10 +
      industryRel * 0.10 +
      keywordRel * 0.10 +
      techRel * 0.05 +
      clusterRel * 0.05 +
      explicitRel * 0.05
    );

    if (isPureTroubleshooting) {
      rawScore = Math.max(0, rawScore - 40);
    }

    const finalScore = clamp(rawScore);
    return {
      serviceSlug: service.slug,
      serviceTitle: service.title,
      score: finalScore,
      classification: classifyMatchGrade(finalScore),
      reasons,
    };
  });

  scoredServices.sort((a, b) => b.score - a.score);

  const topMatch = scoredServices[0];
  const hasStrongPrimary = topMatch && topMatch.score >= 55;
  const primaryService = hasStrongPrimary ? topMatch : null;

  const secondaryServices = scoredServices
    .filter((s) => s.score >= 50 && s.serviceSlug !== primaryService?.serviceSlug)
    .slice(0, 2);

  const overallServiceRelevance = topMatch ? topMatch.score : 0;
  const matchClassification = classifyMatchGrade(overallServiceRelevance);

  let serviceCoverage = "low";
  let potentialServiceGap = false;

  if (overallServiceRelevance >= 80) {
    serviceCoverage = "strong";
  } else if (overallServiceRelevance >= 55) {
    serviceCoverage = "moderate";
  } else {
    serviceCoverage = "low";
    if (intentData.commercialStrength === "high" || intentData.commercialStrength === "very_high") {
      potentialServiceGap = true;
    }
  }

  return {
    success: true,
    topicTitle: title,
    primaryService: primaryService
      ? {
          slug: primaryService.serviceSlug,
          title: primaryService.serviceTitle,
          relevanceScore: primaryService.score,
          classification: primaryService.classification,
          reasons: primaryService.reasons,
        }
      : null,
    secondaryServices: secondaryServices.map((s) => ({
      slug: s.serviceSlug,
      title: s.serviceTitle,
      relevanceScore: s.score,
      classification: s.classification,
      reasons: s.reasons,
    })),
    overallServiceRelevance,
    matchClassification,
    commercialIntent: intentData.commercialIntent,
    commercialStrength: intentData.commercialStrength,
    serviceCoverage,
    potentialServiceGap,
    relatedServiceSlugs: primaryService ? [primaryService.serviceSlug] : [],
    matchedAt: new Date().toISOString(),
    matcherVersion: "v3_multi_signal",
  };
}
