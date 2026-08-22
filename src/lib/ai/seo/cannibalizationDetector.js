/**
 * Multi-Signal Cannibalization & Competing Article Detector (Phase 5 Upgrade)
 * 
 * Evaluates candidate article draft against published/planned articles across:
 * - Focus keyword similarity
 * - Title Jaccard token similarity
 * - Search intent overlap
 * - Entity & problem overlap
 * - Pillar vs Supporting cluster position
 * 
 * CRITICAL RULE: PILLAR-SUPPORTING HIERARCHICAL EXCEPTION
 * A supporting article under a parent pillar is expected to share conceptual overlap.
 * It is classified as SUPPORTIVE (low risk: 0-20%), NOT cannibalization.
 * Cannibalization is flagged ONLY when candidate targets the exact same search query & SERP intent without differentiation.
 */

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "because", "before", "being", "between",
  "build", "building", "but", "can", "could", "does", "for", "from", "had", "has", "have",
  "how", "into", "its", "more", "most", "not", "our", "out", "over", "should", "than", "that",
  "the", "their", "then", "there", "these", "they", "this", "through", "using", "very", "was",
  "web", "website", "were", "what", "when", "where", "which", "why", "will", "with", "without",
  "your", "guide", "complete", "practical",
]);

const normalize = (val = "") =>
  String(val || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
  return union ? intersection / union : 0;
}

/**
 * Detects cannibalization risk and competing articles for a candidate draft.
 * 
 * @param {Object} candidate - Candidate draft or topic object ({ title, focusKeyword, summary, content, articleType, clusterKey, searchIntent })
 * @param {Array} existingBlogs - Array of existing blog metadata objects
 * @param {Object} [options={}] - Custom options ({ parentPillarBlogId, topicPlan })
 * @returns {Object} Cannibalization analysis result
 */
export function detectCannibalizationRisk(candidate = {}, existingBlogs = [], options = {}) {
  if (!candidate || (!candidate.title && !candidate.focusKeyword)) {
    return {
      cannibalizationRisk: "low",
      cannibalizationScore: 0,
      classification: "UNIQUE",
      competingArticles: [],
      matchReason: "Empty or invalid candidate object provided.",
    };
  }

  const candidateTitle = candidate.title || "";
  const candidateKeyword = candidate.focusKeyword || "";
  const candidateSummary = candidate.summary || candidate.problem || "";
  const candidateCluster = normalize(candidate.clusterKey || options.topicPlan?.clusterKey || "");
  const candidateIntent = normalize(candidate.searchIntent || candidate.intent || "informational");
  const candidateArticleType = candidate.articleType || options.topicPlan?.articleType || "supporting";
  const isCandidateSupporting = candidateArticleType === "supporting";

  const competingArticles = [];
  let highestTitleSim = 0;
  let highestKeywordSim = 0;
  let highestSummarySim = 0;
  let criticalMatchReason = "";
  let highestOverlapItem = null;

  for (const blog of existingBlogs) {
    if (!blog || blog.slug === candidate.slug || blog._id?.toString?.() === candidate._id?.toString?.()) {
      continue;
    }

    const blogTitle = blog.title || "";
    const blogKeyword = blog.focusKeyword || "";
    const blogSummary = blog.summary || "";
    const blogCluster = normalize(blog.clusterKey || "");
    const blogIntent = normalize(blog.searchIntent || blog.intent || "informational");
    const blogArticleType = blog.articleType || "supporting";

    const titleSim = calculateJaccardSimilarity(candidateTitle, blogTitle);
    const keywordSim = calculateJaccardSimilarity(candidateKeyword, blogKeyword);
    const summarySim = calculateJaccardSimilarity(candidateSummary, blogSummary);

    const sameTitle = Boolean(candidateTitle && blogTitle && normalize(candidateTitle) === normalize(blogTitle));
    const sameKeyword = Boolean(candidateKeyword && blogKeyword && normalize(candidateKeyword) === normalize(blogKeyword));
    const sameCluster = Boolean(candidateCluster && blogCluster && candidateCluster === blogCluster);
    const sameIntent = candidateIntent === blogIntent;

    // Check relationship
    let relationship = "competing";
    if (sameCluster) {
      if (blogArticleType === "pillar" && isCandidateSupporting) {
        relationship = "parent_pillar";
      } else {
        relationship = "sibling";
      }
    }

    const maxArticleSim = Math.max(titleSim, keywordSim, summarySim);
    if (maxArticleSim > 0.15 || sameKeyword || sameTitle || sameCluster) {
      competingArticles.push({
        blogId: blog._id?.toString?.() || blog.slug,
        title: blogTitle,
        slug: blog.slug,
        similarity: Math.round(maxArticleSim * 100) / 100,
        titleSimilarity: Math.round(titleSim * 100) / 100,
        keywordSimilarity: Math.round(keywordSim * 100) / 100,
        intentOverlap: sameIntent ? 1.0 : 0.4,
        sameCluster,
        relationship,
      });
    }

    if (titleSim > highestTitleSim) highestTitleSim = titleSim;
    if (keywordSim > highestKeywordSim) highestKeywordSim = keywordSim;
    if (summarySim > highestSummarySim) highestSummarySim = summarySim;

    if (!highestOverlapItem && sameCluster && isCandidateSupporting) {
      highestOverlapItem = blog;
    }

    if (sameTitle || sameKeyword || titleSim >= 0.85 || keywordSim >= 0.85) {
      highestOverlapItem = blog;
      criticalMatchReason = `Exact or high keyword/title duplicate with existing article "${blogTitle}".`;
    } else if (summarySim >= 0.70 && sameIntent && !sameCluster) {
      if (!highestOverlapItem) {
        highestOverlapItem = blog;
        criticalMatchReason = `SERP intent cannibalization: Candidate solves same core problem as "${blogTitle}" outside cluster.`;
      }
    }
  }

  // Sort competing articles by similarity descending
  competingArticles.sort((a, b) => b.similarity - a.similarity);

  // Compute multi-signal similarity score
  const maxSimilarity = Math.max(highestTitleSim, highestKeywordSim, highestSummarySim);
  let cannibalizationScore = Math.round(maxSimilarity * 100);

  // Hierarchical Exception Adjustment:
  // If candidate is a supporting child under same cluster, discount cannibalization score by 35%
  if (isCandidateSupporting && highestOverlapItem && normalize(highestOverlapItem.clusterKey) === candidateCluster && highestOverlapItem.articleType === "pillar") {
    cannibalizationScore = Math.max(0, cannibalizationScore - 35);
  }

  // Classification mapping
  let classification = "UNIQUE";
  let riskLevel = "low";

  if (highestTitleSim >= 0.85 || highestKeywordSim >= 0.85) {
    classification = "DUPLICATE";
    riskLevel = "critical";
    cannibalizationScore = Math.max(cannibalizationScore, 90);
  } else if (criticalMatchReason.includes("SERP intent cannibalization")) {
    classification = "CANNIBALIZING";
    riskLevel = "high";
    cannibalizationScore = Math.max(cannibalizationScore, 75);
  } else if (isCandidateSupporting && candidateCluster && highestOverlapItem && normalize(highestOverlapItem.clusterKey) === candidateCluster) {
    classification = "SUPPORTIVE";
    riskLevel = cannibalizationScore > 50 ? "medium" : "low";
  } else if (cannibalizationScore >= 65) {
    classification = "CANNIBALIZING";
    riskLevel = "high";
  } else if (cannibalizationScore >= 35) {
    classification = "RELATED";
    riskLevel = "medium";
  } else {
    classification = "UNIQUE";
    riskLevel = "low";
  }

  return {
    cannibalizationRisk: riskLevel,
    cannibalizationScore,
    classification,
    highestSimilarity: Math.round(maxSimilarity * 100) / 100,
    competingArticles: competingArticles.slice(0, 5),
    matchReason: criticalMatchReason || (riskLevel === "low" ? "No harmful cannibalization detected." : `Topical overlap detected (${cannibalizationScore}% risk score).`),
    matchedArticleTitle: highestOverlapItem?.title || null,
  };
}
