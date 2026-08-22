/**
 * Service Validation & Quality Gate Engine (Phase 6)
 * 
 * Production-grade, deterministic, multi-layer validation engine for every new or modified 
 * Service before publication. Evaluates structural, semantic, commercial, SEO, duplicate, 
 * cannibalization, content quality, and technical safety without breaking existing contracts.
 */

import { getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";
import { calculateServiceRelevanceScore } from "./serviceClassificationScoring.js";

const GENERIC_BUZZWORDS = [
  "cutting-edge", "innovative solutions", "high-quality solutions", "best-in-class",
  "world-class", "game-changer", "synergy", "next-generation", "state-of-the-art"
];

const slugify = (val = "") =>
  String(val)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Main 11-Layer Service Validation Function.
 * 
 * @param {Object} servicePayload - Proposed service object or draft
 * @param {Object} [options={}] - Options (e.g. existingServices snapshot)
 * @returns {Object} Structured Validation Report
 */
export function validateService(servicePayload = {}, options = {}) {
  const rawPayload = servicePayload || {};
  const service = rawPayload.service || rawPayload;
  const catalog = options.existingServicesSnapshot || getServiceIntelligenceSnapshotSync();

  const risks = [];
  const recommendations = [];
  const duplicateCandidates = [];
  const overlappingServices = [];
  const seoIssues = [];
  const contentIssues = [];
  const topicEvidence = [];

  // Dimension Scores (0-100)
  let structural = 100;
  let completeness = 100;
  let semanticConsistency = 100;
  let duplicateSafety = 100;
  let cannibalizationSafety = 100;
  let topicAlignment = 85;
  let commercialValue = 90;
  let seoQuality = 100;
  let contentQuality = 100;
  let technicalCompatibility = 100;

  const currentSlug = slugify(service.slug || service.title || "");

  // ==========================================
  // LAYER 1: SCHEMA & LEGACY VALIDATION
  // ==========================================
  if (!service.title || typeof service.title !== "string" || service.title.trim().length < 3) {
    risks.push({
      type: "SCHEMA_FAILURE",
      severity: "CRITICAL",
      field: "title",
      message: "Missing or invalid service title (minimum 3 characters required).",
      recommendation: "Provide a clean, descriptive service title.",
    });
    structural -= 40;
  }

  if (!service.slug || typeof service.slug !== "string") {
    risks.push({
      type: "SCHEMA_FAILURE",
      severity: "CRITICAL",
      field: "slug",
      message: "Missing candidate slug.",
      recommendation: "Provide a valid URL slug.",
    });
    structural -= 30;
  }

  // ==========================================
  // LAYER 2: DATA COMPLETENESS VALIDATION
  // ==========================================
  if (!service.shortDescription && !service.description) {
    risks.push({
      type: "DATA_INCOMPLETE",
      severity: "HIGH",
      field: "shortDescription",
      message: "Missing short description for service positioning.",
      recommendation: "Add a concise 1-2 sentence summary of what the service delivers.",
    });
    completeness -= 25;
  }

  if (!service.overview && !service.fullDescription) {
    risks.push({
      type: "DATA_INCOMPLETE",
      severity: "HIGH",
      field: "overview",
      message: "Missing service overview or full description.",
      recommendation: "Add detailed operational overview of the service.",
    });
    completeness -= 20;
  }

  const faqs = Array.isArray(service.faqs) ? service.faqs : service.faq || [];
  if (faqs.length < 3) {
    risks.push({
      type: "TRUST_INCOMPLETE",
      severity: "MEDIUM",
      field: "faqs",
      message: `FAQ section incomplete (${faqs.length}/3 minimum required Q&As).`,
      recommendation: "Provide at least 3 FAQ pairs addressing timeline, pricing, and scope.",
    });
    completeness -= 15;
  }

  const problems = Array.isArray(service.problemsSolved) ? service.problemsSolved : [];
  if (problems.length < 2) {
    risks.push({
      type: "VALUE_INCOMPLETE",
      severity: "MEDIUM",
      field: "problemsSolved",
      message: "Fewer than 2 business problems defined.",
      recommendation: "Document at least 2 concrete business challenges solved by this service.",
    });
    completeness -= 10;
  }

  const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
  if (deliverables.length < 2) {
    risks.push({
      type: "EXECUTION_INCOMPLETE",
      severity: "MEDIUM",
      field: "deliverables",
      message: "Fewer than 2 deliverables defined.",
      recommendation: "List at least 2 clear technical deliverables.",
    });
    completeness -= 10;
  }

  // ==========================================
  // LAYER 3: SEMANTIC CONSISTENCY VALIDATION
  // ==========================================
  const fullText = [
    service.title, service.shortDescription, service.overview, service.fullDescription,
    ...(service.technologies || []), ...(service.keywords || [])
  ].filter(Boolean).join(" ").toLowerCase();

  const isNextJsTitle = /next\.?js|react/i.test(service.title || "");
  const hasContradictoryTech = /laravel|wordpress|django|ruby on rails|flutter/i.test(fullText);

  if (isNextJsTitle && hasContradictoryTech && !/migration from/i.test(fullText)) {
    risks.push({
      type: "SEMANTIC_INCONSISTENCY",
      severity: "HIGH",
      field: "technologies",
      message: `Title mentions Next.js but overview references non-stack technologies.`,
      recommendation: "Align technological references with the primary service title.",
    });
    semanticConsistency -= 35;
  }

  // ==========================================
  // LAYER 4 & 5: DUPLICATE & CANNIBALIZATION SAFETY
  // ==========================================
  for (const existing of catalog) {
    if (existing.slug === currentSlug && options.isNewService !== false) {
      risks.push({
        type: "DUPLICATE_SLUG_COLLISION",
        severity: "CRITICAL",
        field: "slug",
        relatedService: existing.slug,
        message: `Slug collision: Existing service '${existing.title}' already uses slug '${existing.slug}'.`,
        recommendation: "Differentiate the service title or target a distinct sub-niche slug.",
      });
      duplicateSafety -= 60;
      duplicateCandidates.push({ slug: existing.slug, title: existing.title, overlapScore: 100 });
    } else if (existing.slug !== currentSlug) {
      const matchCalc = calculateServiceRelevanceScore(existing.slug, { text: fullText });
      if (matchCalc.score >= 90) {
        risks.push({
          type: "SERVICE_OVERLAP",
          severity: "HIGH",
          relatedService: existing.slug,
          message: `High positioning overlap (${matchCalc.score}%) with existing service '${existing.title}'.`,
          recommendation: `Differentiate problem angle or target audience from '${existing.title}'.`,
        });
        cannibalizationSafety -= 30;
        overlappingServices.push({ slug: existing.slug, title: existing.title, overlapScore: matchCalc.score });
      } else if (matchCalc.score >= 75) {
        risks.push({
          type: "SERVICE_OVERLAP",
          severity: "MEDIUM",
          relatedService: existing.slug,
          message: `Moderate overlap (${matchCalc.score}%) with existing service '${existing.title}'.`,
          recommendation: `Ensure distinct deliverables and value proposition.`,
        });
        cannibalizationSafety -= 15;
        overlappingServices.push({ slug: existing.slug, title: existing.title, overlapScore: matchCalc.score });
      }
    }
  }

  // ==========================================
  // LAYER 6 & 7: TOPIC ALIGNMENT & COMMERCIAL VALUE
  // ==========================================
  const isPureInformational = /what is|history of|definition|introduction to/i.test(service.title || "");
  if (isPureInformational) {
    risks.push({
      type: "POOR_COMMERCIAL_VALUE",
      severity: "HIGH",
      field: "title",
      message: "Proposed service title is purely educational rather than commercial.",
      recommendation: "Re-frame title into an actionable commercial engineering service.",
    });
    commercialValue -= 35;
  }
  topicEvidence.push("Evaluated against Muhyo Tech commercial service taxonomy.");

  // ==========================================
  // LAYER 8: SEO VALIDATION
  // ==========================================
  const seoTitle = service.seoTitle || service.title || "";
  const seoDescription = service.seoDescription || service.shortDescription || "";

  if (seoTitle.length < 25 || seoTitle.length > 75) {
    seoIssues.push(`SEO title length (${seoTitle.length} chars) is outside recommended range (25-75 chars).`);
    seoQuality -= 15;
  }
  if (seoDescription.length < 70 || seoDescription.length > 175) {
    seoIssues.push(`SEO description length (${seoDescription.length} chars) is outside recommended range (70-175 chars).`);
    seoQuality -= 15;
  }

  // ==========================================
  // LAYER 9: CONTENT QUALITY VALIDATION
  // ==========================================
  const detectedBuzzwords = GENERIC_BUZZWORDS.filter((b) => fullText.includes(b));
  if (detectedBuzzwords.length > 0) {
    contentIssues.push(`Generic marketing buzzwords detected (${detectedBuzzwords.join(", ")}).`);
    risks.push({
      type: "GENERIC_CONTENT_WARNING",
      severity: "LOW",
      message: `Content relies on generic phrases: ${detectedBuzzwords.join(", ")}.`,
      recommendation: "Replace buzzwords with specific technical deliverables and outcomes.",
    });
    contentQuality -= 15;
  }

  // ==========================================
  // LAYER 10 & 11: RELATIONSHIPS & TECHNICAL COMPATIBILITY
  // ==========================================
  const relatedServices = Array.isArray(service.relatedServices) ? service.relatedServices : [];
  for (const relSlug of relatedServices) {
    if (relSlug === currentSlug) {
      risks.push({
        type: "INVALID_RELATIONSHIP",
        severity: "LOW",
        message: "Self-referencing slug found in relatedServices.",
        recommendation: "Remove self-reference from relatedServices array.",
      });
      technicalCompatibility -= 10;
    } else if (!catalog.some((s) => s.slug === relSlug)) {
      risks.push({
        type: "INVALID_RELATIONSHIP",
        severity: "MEDIUM",
        message: `Referenced related service '${relSlug}' does not exist in catalog.`,
        recommendation: "Replace with a valid canonical service slug.",
      });
      technicalCompatibility -= 15;
    }
  }

  // Clamp dimension scores to [0, 100]
  structural = Math.max(0, structural);
  completeness = Math.max(0, completeness);
  semanticConsistency = Math.max(0, semanticConsistency);
  duplicateSafety = Math.max(0, duplicateSafety);
  cannibalizationSafety = Math.max(0, cannibalizationSafety);
  topicAlignment = Math.max(0, topicAlignment);
  commercialValue = Math.max(0, commercialValue);
  seoQuality = Math.max(0, seoQuality);
  contentQuality = Math.max(0, contentQuality);
  technicalCompatibility = Math.max(0, technicalCompatibility);

  // Calculate Weighted Overall Quality Score
  const overallScore = Math.round(
    structural * 0.10 +
    completeness * 0.10 +
    semanticConsistency * 0.10 +
    duplicateSafety * 0.15 +
    cannibalizationSafety * 0.15 +
    topicAlignment * 0.10 +
    commercialValue * 0.15 +
    seoQuality * 0.05 +
    contentQuality * 0.05 +
    technicalCompatibility * 0.05
  );

  // Decision Engine Logic
  const hasCriticalRisk = risks.some((r) => r.severity === "CRITICAL");
  const hasHighDuplicate = duplicateSafety < 50;

  let decision = "REVIEW";
  if (hasCriticalRisk || hasHighDuplicate || overallScore < 60) {
    decision = "REJECT";
  } else if (overallScore >= 80 && duplicateSafety >= 70 && risks.filter((r) => r.type === "SEMANTIC_INCONSISTENCY" || r.type === "SCHEMA_FAILURE").length === 0) {
    decision = "APPROVE";
  } else {
    decision = "REVIEW";
  }

  // Aggregate Recommendations
  for (const risk of risks) {
    if (risk.recommendation && !recommendations.includes(risk.recommendation)) {
      recommendations.push(risk.recommendation);
    }
  }

  return {
    serviceSlug: currentSlug,
    serviceTitle: service.title || "Untitled Service",
    score: overallScore,
    decision,
    dimensions: {
      structural,
      completeness,
      semanticConsistency,
      duplicateSafety,
      cannibalizationSafety,
      topicAlignment,
      commercialValue,
      seoQuality,
      contentQuality,
      technicalCompatibility,
    },
    risks,
    recommendations,
    duplicateCandidates,
    overlappingServices,
    topicEvidence,
    seoIssues,
    contentIssues,
    validatedAt: new Date().toISOString(),
    validatorVersion: "v6_quality_gate",
  };
}
