/**
 * Keyword & Intent-Level Cannibalization Analyzer
 * 
 * Upgrades duplicate protection beyond title similarity:
 * Enforces rule: TITLE DIFFERENCE ≠ CONTENT DIFFERENCE.
 * Compares candidate against keyword, intent, audience, problem, and target SERP purpose.
 * 
 * Classifications:
 * - DUPLICATE: High title or exact keyword similarity (>= 82%) -> Reject.
 * - CANNIBALIZING: Different title but identical SERP intent + core problem framing -> Reject / High Risk.
 * - SUPPORTING: Shared cluster key with distinct subproblem angle -> Approve.
 * - RELATED: Shared technology with different problem/cluster -> Approve with cooldown.
 * - UNIQUE: Low semantic overlap (< 35%) -> Approve.
 */

const STOP_WORDS = new Set(["and", "are", "for", "from", "how", "into", "the", "that", "this", "with", "your", "website", "web", "guide", "complete", "practical"]);

const normalize = (val = "") => String(val).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();

function tokenize(text = "") {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function calculateJaccardSimilarity(textA = "", textB = "") {
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (!setA.size || !setB.size) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function analyzeCannibalization(candidate = {}, existingPool = []) {
  const candidateTitle = candidate.title || "";
  const candidateKeyword = candidate.focusKeyword || "";
  const candidateProblem = candidate.problem || candidate.businessProblem || "";
  const candidateCluster = normalize(candidate.clusterKey || "");
  const candidateIntent = normalize(candidate.intent || candidate.searchIntent || "informational");

  let highestTitleSim = 0;
  let highestKeywordSim = 0;
  let highestProblemSim = 0;
  let matchReason = "";
  let matchedItem = null;
  let isSameIntentAndProblem = false;

  for (const item of existingPool) {
    const itemTitle = item.title || "";
    const itemKeyword = item.focusKeyword || "";
    const itemProblem = item.problem || item.summary || "";
    const itemIntent = normalize(item.intent || item.searchIntent || "informational");
    const itemCluster = normalize(item.clusterKey || "");

    const titleSim = calculateJaccardSimilarity(candidateTitle, itemTitle);
    const keywordSim = calculateJaccardSimilarity(candidateKeyword, itemKeyword);
    const problemSim = calculateJaccardSimilarity(candidateProblem, itemProblem);

    if (titleSim > highestTitleSim) highestTitleSim = titleSim;
    if (keywordSim > highestKeywordSim) highestKeywordSim = keywordSim;
    if (problemSim > highestProblemSim) highestProblemSim = problemSim;

    // Intent-Level Cannibalization Check: TITLE DIFFERENCE != CONTENT DIFFERENCE
    // If different title phrasing but identical core problem + identical search intent outside same cluster
    if (problemSim >= 0.70 && candidateIntent === itemIntent && candidateCluster !== itemCluster) {
      matchedItem = item;
      isSameIntentAndProblem = true;
      matchReason = `Intent cannibalization: Candidate solves same core problem as "${item.title}" with identical intent "${candidateIntent}"`;
      break;
    }

    if (titleSim >= 0.82 || keywordSim >= 0.85) {
      matchedItem = item;
      matchReason = `High title/keyword overlap with existing article "${item.title}"`;
      break;
    }
  }

  const maxSim = Math.max(highestTitleSim, highestKeywordSim, highestProblemSim);
  const cannibalizationRisk = Math.round(maxSim * 100);

  // Classification Logic
  let classification = "UNIQUE";
  let approved = true;

  if (highestTitleSim >= 0.82 || highestKeywordSim >= 0.85) {
    classification = "DUPLICATE";
    approved = false;
  } else if (isSameIntentAndProblem) {
    classification = "CANNIBALIZING";
    approved = false; // Reject intent-level cannibalization to preserve SERP authority
  } else if (highestKeywordSim >= 0.65 && candidateCluster && matchedItem && normalize(matchedItem.clusterKey) === candidateCluster) {
    classification = "SUPPORTING";
    approved = true;
  } else if (highestKeywordSim >= 0.65) {
    classification = "CANNIBALIZING";
    approved = true; // High overlap penalized in score
  } else if (highestKeywordSim >= 0.35 || highestProblemSim >= 0.35) {
    classification = "RELATED";
    approved = true;
  }

  return {
    classification,
    approved,
    cannibalizationRisk,
    highestSimilarity: maxSim,
    matchReason: matchReason || (approved ? "No harmful cannibalization detected." : "Cannibalization threshold exceeded."),
    matchedItemTitle: matchedItem?.title || null,
  };
}
