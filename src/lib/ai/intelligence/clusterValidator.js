/**
 * Cluster & Supporting Topic Validator (Phase 6)
 * 
 * Deterministically validates proposed supporting topics for a Pillar cluster.
 * Rejects redundant children (e.g. "What is E-commerce?" under "E-commerce Guide")
 * and enforces cannibalization risk boundaries (< 70).
 */

import { analyzeCannibalization } from "./cannibalizationAnalyzer.js";

const normalizeStr = (s = "") => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

export function validateSupportingTopicCandidate(candidate = {}, parentPillar = {}, existingClusterTopics = []) {
  const result = {
    valid: true,
    rejectionReason: null,
    confidence: 100,
  };

  const candTitle = String(candidate.title || "").trim();
  const candKw = String(candidate.focusKeyword || "").trim();
  const candProb = String(candidate.problem || "").trim();
  const parentTitle = String(parentPillar.title || "").trim();

  if (!candTitle || !candKw || !candProb) {
    return { valid: false, rejectionReason: "Missing required fields (title, focusKeyword, or problem)." };
  }

  // Rule 1: Reject redundant definition/introductory children that duplicate the parent Pillar scope
  const normCand = normalizeStr(candTitle);
  const normParent = normalizeStr(parentTitle);

  if (normCand.includes("whatis") && normParent.includes(normCand.replace("whatis", ""))) {
    return { valid: false, rejectionReason: "Redundant introductory question child topic." };
  }

  if (normCand === normParent) {
    return { valid: false, rejectionReason: "Supporting topic title is identical to parent Pillar title." };
  }

  // Rule 2: Cannibalization Check against existing cluster topics
  const cannibalCheck = analyzeCannibalization(candidate, existingClusterTopics);
  if (!cannibalCheck.approved) {
    return { valid: false, rejectionReason: `High cannibalization risk: ${cannibalCheck.matchReason}` };
  }

  // Rule 3: Check duplicate focus keywords within cluster
  const normKw = normalizeStr(candKw);
  const duplicateKw = existingClusterTopics.some((t) => normalizeStr(t.focusKeyword || "") === normKw);
  if (duplicateKw) {
    return { valid: false, rejectionReason: `Focus keyword '${candKw}' is already targeted in this cluster.` };
  }

  return result;
}

export function filterAndValidateClusterPack(pack = {}, existingPool = []) {
  const pillar = pack.pillar || {};
  const supporting = Array.isArray(pack.supporting) ? pack.supporting : [];
  const acceptedSupporting = [];
  const rejections = [];

  for (const child of supporting) {
    const check = validateSupportingTopicCandidate(child, pillar, [...existingPool, pillar, ...acceptedSupporting]);
    if (check.valid) {
      acceptedSupporting.push(child);
    } else {
      rejections.push({ topic: child, reason: check.rejectionReason });
    }
  }

  return {
    pillar,
    supporting: acceptedSupporting,
    rejections,
    originalCount: supporting.length,
    acceptedCount: acceptedSupporting.length,
  };
}
