/**
 * Service Problem & Audience Matcher Engine
 * 
 * Implements the 4-stage matching pipeline:
 * User Problem -> Audience Profile -> Required Solution -> Best-Fit Service
 */

import { SERVICE_KNOWLEDGE_PROFILES, getAllServiceKnowledgeProfiles } from "./serviceKnowledgeBase.js";
import { detectIndustry } from "../industryTaxonomy.js";
import { detectBusinessProblem } from "../businessProblemTaxonomy.js";

const STOP_WORDS = new Set(["and", "the", "for", "with", "how", "what", "this", "that", "your", "web", "website", "from"]);

function tokenize(text = "") {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

/**
 * Matches candidate text/problem/audience inputs to the best-fit Muhyo Tech service.
 * 
 * @param {Object} input - { text, problem, audience, intent }
 * @returns {Object} { primaryService, secondaryService, confidence, problemAnalysis, rationale }
 */
export function matchBestServiceForProblem(input = {}) {
  const text = [input.text, input.title, input.problem, input.focusKeyword, input.summary]
    .filter(Boolean)
    .join(" ");

  const inputTokens = tokenize(text);
  const detectedProblem = detectBusinessProblem(input) || { key: "general", label: "General Business Web Need" };
  const detectedIndustryKey = detectIndustry(input);

  const profiles = getAllServiceKnowledgeProfiles();
  const scoredServices = profiles.map((profile) => {
    let score = 0;
    const rationale = [];

    // 1. Direct Keyword / Token Overlap (up to 40 pts)
    const profileText = [
      profile.title,
      profile.category,
      profile.whatItIs,
      ...profile.problemsSolved,
      ...profile.whoNeedsIt.map((w) => `${w.role} ${w.label}`),
      ...profile.whenTheyNeedIt
    ].join(" ");
    const profileTokens = tokenize(profileText);

    let overlapCount = 0;
    for (const token of inputTokens) {
      if (profileTokens.has(token)) overlapCount++;
    }
    const overlapScore = Math.min(40, overlapCount * 8);
    score += overlapScore;
    if (overlapCount > 0) rationale.push(`Matched ${overlapCount} domain terms in Knowledge Base.`);

    // 2. Specific Industry / Service Specific Patterns (up to 30 pts)
    const lowerText = text.toLowerCase();

    if (profile.slug === "website-speed-optimization" && /speed|performance|core web vitals|slow|lcp|cls|loading delay/i.test(lowerText)) {
      score += 35;
      rationale.push("High match for site performance and Core Web Vitals optimization.");
    }
    if (profile.slug === "e-commerce-website-development" && /ecommerce|e-commerce|store|cart|checkout|shop|product catalog/i.test(lowerText)) {
      score += 35;
      rationale.push("High match for e-commerce and shopping store development.");
    }
    if (profile.slug === "nextjs-website-development" && /next\.?js|server component|app router|ssr|react website/i.test(lowerText)) {
      score += 30;
      rationale.push("High match for Next.js engineering.");
    }
    if (profile.slug === "admin-dashboard-development" && /admin|dashboard|cms|panel|internal tool|control panel/i.test(lowerText)) {
      score += 30;
      rationale.push("High match for admin dashboards.");
    }
    if (profile.slug === "landing-page-design" && /landing page|lead generation|ad campaign|conversion page/i.test(lowerText)) {
      score += 30;
      rationale.push("High match for landing page design.");
    }
    if (profile.slug === "website-redesign" && /redesign|rebuild|outdated site|modernize|revamp/i.test(lowerText)) {
      score += 30;
      rationale.push("High match for website redesign.");
    }
    if (profile.slug === "api-integration" && /api|webhook|oauth|third-party|connect payment|stripe/i.test(lowerText)) {
      score += 30;
      rationale.push("High match for API integration.");
    }

    // 3. Problem Friction Match (up to 20 pts)
    const problemMatch = profile.problemsSolved.some((prob) =>
      tokenize(prob).size > 0 && [...tokenize(prob)].some((t) => inputTokens.has(t))
    );
    if (problemMatch) {
      score += 20;
      rationale.push("Directly solves identified business friction.");
    }

    return {
      profile,
      score,
      rationale,
    };
  });

  scoredServices.sort((a, b) => b.score - a.score);

  const topMatch = scoredServices[0];
  const secondMatch = scoredServices[1];

  const confidence = Math.min(1.0, Math.max(0.4, Math.round((topMatch.score / 60) * 100) / 100));

  return {
    primaryService: topMatch ? topMatch.profile : SERVICE_KNOWLEDGE_PROFILES["custom-website-development"],
    secondaryService: secondMatch && secondMatch.score >= 20 ? secondMatch.profile : null,
    confidence,
    problemAnalysis: {
      detectedProblem: detectedProblem.label,
      detectedIndustry: detectedIndustryKey,
    },
    rationale: topMatch ? topMatch.rationale : ["Default fallback to Custom Website Development."],
  };
}
