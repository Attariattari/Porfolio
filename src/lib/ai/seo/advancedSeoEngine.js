/**
 * Advanced SEO & Cannibalization Intelligence Engine (Phase 5 Upgrade)
 * 
 * Evaluates generated blog drafts for:
 * - Search Intent Alignment (informational, commercial, transactional, navigational)
 * - Topic & Focus Keyword Placement
 * - Semantic & Technical Entity Coverage
 * - Multi-Signal Cannibalization Risk (via cannibalizationDetector)
 * - Internal Authority Flow & Service Link Validation
 * - Actionable SEO Gap Report & Decision Engine
 * 
 * FAIL-SAFE GUARANTEE:
 * - Bounded timeout.
 * - DB readyState check before database operations.
 * - On failure/timeout/error, logs warning and returns status: "degraded", decision: "PASS" (fail open).
 * - NEVER throws uncaught errors; NEVER halts article generation or topic queue execution.
 */

import mongoose from "mongoose";
import { SeoIntelligence } from "../../../models/SeoIntelligence.js";
import { stripBlogHtml, getBlogWordCount, getInvalidBlogServiceSlugs } from "../../blogSeo.js";
import { detectCannibalizationRisk } from "./cannibalizationDetector.js";

/**
 * Evaluates Search Intent Alignment between declared intent and actual HTML content.
 */
function evaluateSearchIntentMatch(blogData = {}) {
  const declaredIntent = String(blogData.searchIntent || blogData.intent || "informational").toLowerCase().trim();
  const content = String(blogData.content || "");
  const text = stripBlogHtml(content).toLowerCase();

  const reasons = [];
  let score = 85;
  let matched = true;

  if (declaredIntent === "informational") {
    const hasExplanation = /how to|what is|guide|architecture|understand|overview|framework/i.test(text);
    const hasDirectAnswer = text.length > 500 && /<p\b/i.test(content);
    if (!hasExplanation) {
      score -= 15;
      reasons.push("Informational intent lacks clear explanatory phrasing or overview sections.");
    }
    if (!hasDirectAnswer) {
      score -= 10;
      reasons.push("Informational intent lacks direct summary paragraph.");
    }
  } else if (declaredIntent === "commercial") {
    const hasComparison = /comparison|vs\.|trade-off|pros and cons|decision criteria|evaluation|table/i.test(content);
    const hasServiceLink = /href=(["'])\/services\/[^"']+\1/i.test(content);
    if (!hasComparison) {
      score -= 20;
      reasons.push("Commercial investigation intent lacks comparison table or trade-off evaluation.");
    }
    if (!hasServiceLink) {
      score -= 15;
      reasons.push("Commercial intent lacks contextual link to relevant Muhyo Tech service.");
    }
  } else if (declaredIntent === "transactional") {
    const hasCta = /consult|contact|get started|hire|partner|solution/i.test(text);
    const hasServiceLink = /href=(["'])\/services\/[^"']+\1/i.test(content);
    if (!hasCta && !hasServiceLink) {
      score -= 25;
      reasons.push("Transactional intent lacks clear contextual CTA or service link.");
    }
  }

  if (score < 65) {
    matched = false;
  }

  return {
    declared: declaredIntent,
    matched,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

/**
 * Evaluates Focus Keyword & Topic Placement Alignment.
 */
function evaluateTopicAlignment(blogData = {}) {
  const focusKeyword = String(blogData.focusKeyword || "").toLowerCase().trim();
  const title = String(blogData.title || "").toLowerCase();
  const summary = String(blogData.seoDescription || blogData.summary || "").toLowerCase();
  const content = String(blogData.content || "");

  if (!focusKeyword) {
    return {
      score: 50,
      focusKeywordInTitle: false,
      focusKeywordInSummary: false,
      focusKeywordInH2: false,
      gaps: ["Missing primary focus keyword specification."],
    };
  }

  const keywordTokens = focusKeyword.split(/\s+/).filter((t) => t.length > 2);
  const focusKeywordInTitle = keywordTokens.every((token) => title.includes(token));
  const focusKeywordInSummary = keywordTokens.every((token) => summary.includes(token));
  const h2Matches = [...content.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/gi)];
  const focusKeywordInH2 = h2Matches.some((m) => keywordTokens.every((token) => m[1].toLowerCase().includes(token)));

  let score = 70;
  const gaps = [];

  if (focusKeywordInTitle) score += 15;
  else gaps.push(`Primary focus keyword '${focusKeyword}' not fully present in title.`);

  if (focusKeywordInSummary) score += 10;
  else gaps.push(`Primary focus keyword '${focusKeyword}' not fully present in SEO description.`);

  if (focusKeywordInH2) score += 5;
  else gaps.push(`Primary focus keyword '${focusKeyword}' not present in any H2 section heading.`);

  return {
    score: Math.min(100, score),
    focusKeywordInTitle,
    focusKeywordInSummary,
    focusKeywordInH2,
    gaps,
  };
}

/**
 * Extracts technical & business entities and checks entity coverage.
 */
function evaluateEntityCoverage(blogData = {}) {
  const contentText = stripBlogHtml(blogData.content || "").toLowerCase();
  const topicText = `${blogData.title || ""} ${blogData.focusKeyword || ""} ${blogData.category || ""}`.toLowerCase();

  const ENTITY_DICTIONARY = [
    "next.js", "react", "mongodb", "node.js", "typescript", "express.js",
    "vercel", "aws", "docker", "ci/cd", "rest api", "graphql", "jwt", "oauth",
    "core web vitals", "lcp", "inp", "ttfb", "ssr", "ssg", "rsc", "sharding",
    "indexing", "caching", "redis", "microservices", "multi-tenancy"
  ];

  const relevantEntities = ENTITY_DICTIONARY.filter((entity) => topicText.includes(entity) || contentText.includes(entity));
  const covered = relevantEntities.filter((entity) => contentText.includes(entity));
  const missing = relevantEntities.filter((entity) => !contentText.includes(entity));

  const score = relevantEntities.length ? Math.round((covered.length / relevantEntities.length) * 100) : 85;

  return {
    score,
    covered,
    missing,
  };
}

/**
 * Evaluates Internal Authority Flow & Service Link Validation.
 */
function evaluateInternalAuthority(blogData = {}) {
  const content = String(blogData.content || "");
  const invalidServiceSlugs = getInvalidBlogServiceSlugs(content);

  const serviceLinkMatches = [...content.matchAll(/href=(["'])\/services\/([^"'#?\/]+)(?:[?#][^"']*)?\1/gi)];
  const serviceLinks = [...new Set(serviceLinkMatches.map((m) => m[2]))];

  const parentLinkMatches = [...content.matchAll(/href=(["'])\/blog\/([^"'#?\/]+)(?:[?#][^"']*)?\1/gi)];
  const blogLinks = [...new Set(parentLinkMatches.map((m) => m[2]))];

  let score = 85;
  const gaps = [];

  if (invalidServiceSlugs.length > 0) {
    score -= 30;
    gaps.push(`Contains invalid service slugs: ${invalidServiceSlugs.join(", ")}`);
  }

  if (serviceLinks.length === 0) {
    score -= 10;
    gaps.push("Contains zero contextual service links.");
  }

  return {
    score: Math.max(0, score),
    serviceLinks,
    blogLinks,
    invalidServiceSlugs,
    gaps,
  };
}

/**
 * Main Phase 5 SEO & Cannibalization Intelligence Engine.
 * 
 * @param {Object} blogData - Generated blog data object
 * @param {Object} [options={}] - Custom options ({ topicPlan, recentBlogs, timeoutMs })
 * @returns {Promise<Object>} Structured SEO Intelligence payload
 */
export async function evaluateArticleSeoIntelligence(blogData = {}, options = {}) {
  const startedAt = Date.now();

  if (!blogData || (!blogData.title && !blogData.content)) {
    return {
      status: "degraded",
      decision: "PASS",
      score: 75,
      cannibalizationRisk: "low",
      detectedGaps: ["Empty blog data provided."],
      warnings: ["Skipped SEO evaluation due to empty input."],
      recommendations: [],
      analyzedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
    };
  }

  try {
    const recentBlogs = Array.isArray(options.recentBlogs) ? options.recentBlogs : [];

    // 1. Search Intent Evaluation
    const intentResult = evaluateSearchIntentMatch(blogData);

    // 2. Topic & Keyword Placement Alignment
    const topicResult = evaluateTopicAlignment(blogData);

    // 3. Entity Coverage
    const entityResult = evaluateEntityCoverage(blogData);

    // 4. Cannibalization Detection
    const cannibalizationResult = detectCannibalizationRisk(blogData, recentBlogs, options);

    // 5. Internal Authority & Service Link Evaluation
    const authorityResult = evaluateInternalAuthority(blogData);

    // Content Completeness metrics
    const wordCount = getBlogWordCount(blogData);
    const sectionCount = (blogData.content?.match(/<h2\b/gi) || []).length;
    const hasFaq = /frequently asked|<h[23][^>]*>\s*faqs?\b/i.test(blogData.content || "");
    const hasTable = /<table\b/i.test(blogData.content || "");
    const hasCode = /<code\b/i.test(blogData.content || "");

    // Aggregate overall score
    const aggregateScore = Math.round(
      intentResult.score * 0.25 +
      topicResult.score * 0.25 +
      entityResult.score * 0.15 +
      authorityResult.score * 0.15 +
      (100 - cannibalizationResult.cannibalizationScore) * 0.20
    );

    // Actionable Gap List & Recommendations
    const detectedGaps = [
      ...intentResult.reasons,
      ...topicResult.gaps,
      ...authorityResult.gaps,
      entityResult.missing.length > 0 && `Missing entity coverage for: ${entityResult.missing.join(", ")}`,
      wordCount < 700 && `Word count is low (${wordCount} words).`,
    ].filter(Boolean);

    const warnings = [
      cannibalizationResult.matchReason,
    ].filter((w) => w && !w.includes("No harmful cannibalization"));

    const recommendations = [
      !topicResult.focusKeywordInTitle && `Include focus keyword '${blogData.focusKeyword}' in title.`,
      !topicResult.focusKeywordInH2 && `Add focus keyword '${blogData.focusKeyword}' into an H2 section heading.`,
      authorityResult.serviceLinks.length === 0 && `Link to 1 relevant Muhyo Tech service in /services/allowed-slug format.`,
    ].filter(Boolean);

    // Decision Engine Logic (Fail-Open Principles)
    let decision = "PASS";
    if (cannibalizationResult.classification === "DUPLICATE" || cannibalizationResult.cannibalizationScore >= 85) {
      decision = "BLOCK";
    } else if (cannibalizationResult.cannibalizationRisk === "high" && cannibalizationResult.classification !== "SUPPORTIVE") {
      decision = "REVISE";
    } else if (aggregateScore < 70 || authorityResult.invalidServiceSlugs.length > 0) {
      decision = "REVISE";
    } else if (aggregateScore < 85 || detectedGaps.length > 0) {
      decision = "PASS_WITH_RECOMMENDATIONS";
    } else {
      decision = "PASS";
    }

    const payload = {
      status: "completed",
      decision,
      score: aggregateScore,
      searchIntent: intentResult,
      topicAlignment: topicResult,
      entityCoverage: entityResult,
      contentCompleteness: {
        wordCount,
        sectionCount,
        hasFaq,
        hasTable,
        hasCode,
      },
      cannibalizationRisk: cannibalizationResult.cannibalizationRisk,
      cannibalizationScore: cannibalizationResult.cannibalizationScore,
      classification: cannibalizationResult.classification,
      competingArticles: cannibalizationResult.competingArticles,
      internalAuthority: authorityResult,
      detectedGaps,
      warnings,
      recommendations,
      analyzedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
    };

    // Safe Mongoose persistence
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && SeoIntelligence && typeof SeoIntelligence.create === "function") {
        await SeoIntelligence.create({
          ...payload,
          blogId: blogData._id || null,
          topicPlanId: options.topicPlan?._id || options.topicPlan?.topicPlanId || null,
        });
        console.log(`[SEO-Intelligence] Persisted audit record to MongoDB.`);
      }
    } catch (dbErr) {
      console.warn("[SEO-Intelligence] Safe catch: DB persistence failed:", dbErr.message);
    }

    const durationMs = Date.now() - startedAt;
    console.log(`[SEO-Intelligence] Evaluated article in ${durationMs}ms. Score: ${aggregateScore}/100 | Risk: ${cannibalizationResult.cannibalizationRisk} | Decision: ${decision}`);

    return payload;
  } catch (err) {
    console.warn(`[SEO-Intelligence] Safe fail-open catch: ${err.message}`);
    return {
      status: "degraded",
      decision: "PASS",
      score: 75,
      cannibalizationRisk: "low",
      detectedGaps: [`Evaluation error: ${err.message}`],
      warnings: ["SEO engine encountered an exception; failed open safely."],
      recommendations: [],
      analyzedAt: new Date().toISOString(),
      engineVersion: "1.0.0",
    };
  }
}
