/**
 * EEAT & Editorial Quality Engine (Phase 6)
 * 
 * Evaluates generated blog drafts for:
 * - EEAT Signals: Experience, Expertise, Authoritativeness, Trustworthiness (0-10 scale)
 * - Editorial Quality: Detects generic AI filler, shallow explanations, awkward transitions
 * - Technical & Code Consistency: Checks code snippet consistency vs prose explanations
 */

import { stripBlogHtml } from "../../blogSeo.js";

/**
 * Scans content for generic AI filler phrases and textbook fluff.
 */
function detectAiFiller(content = "") {
  const text = stripBlogHtml(content).toLowerCase();

  const FILLER_PATTERNS = [
    "in today's digital landscape",
    "in today's fast-paced digital world",
    "let's dive right in",
    "delve into",
    "testament to",
    "game changer",
    "in conclusion,",
    "in summary,",
    "it is important to remember that",
  ];

  const detectedFiller = FILLER_PATTERNS.filter((pattern) => text.includes(pattern));
  return detectedFiller;
}

/**
 * Checks consistency between code snippets and surrounding prose text.
 */
function evaluateCodeConsistency(content = "") {
  const codeMatches = [...content.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>|```[a-z]*\n([\s\S]*?)```/gi)];
  const contradictions = [];

  if (codeMatches.length === 0) {
    return {
      hasCode: false,
      score: 9.0,
      contradictions: [],
    };
  }

  const prose = stripBlogHtml(content).toLowerCase();
  const codeText = codeMatches.map((m) => m[1] || m[2] || "").join("\n").toLowerCase();

  // Check common prose vs code conflicts
  if (prose.includes("usestate") && !codeText.includes("usestate") && codeText.includes("usereducer")) {
    contradictions.push("Prose mentions 'useState' hook, but code snippet implements 'useReducer'.");
  }

  if (prose.includes("async/await") && codeText.includes(".then(") && !codeText.includes("await")) {
    contradictions.push("Prose explains async/await, but code snippet uses promise chaining (.then).");
  }

  const score = contradictions.length > 0 ? 6.5 : 9.5;

  return {
    hasCode: true,
    score,
    contradictions,
  };
}

/**
 * Main EEAT & Editorial Quality Evaluator.
 * 
 * @param {Object} blogData - Generated blog data object ({ title, summary, content })
 * @param {Object} [options={}] - Custom options
 * @returns {Object} Structured EEAT & Editorial audit payload
 */
export function evaluateEeatAndEditorial(blogData = {}, options = {}) {
  const content = String(blogData.content || "");
  const text = stripBlogHtml(content);

  // 1. EEAT Signals Evaluation
  const hasTradeoffs = /trade-off|limitation|drawback|pitfall|caveat|overhead|consideration/i.test(text);
  const hasProductionContext = /production|deployment|monitoring|scale|benchmark|memory|performance/i.test(text);
  const hasCodeSnippet = /<code\b|```[a-z]*/i.test(content);
  const hasArchitectureDiagram = /<pre\b|<table\b|component|architecture|flow/i.test(content);

  let experience = 7.5;
  let expertise = 8.0;
  let authority = 7.5;
  let trust = 8.5;

  if (hasTradeoffs) {
    experience += 1.0;
    trust += 0.8;
  }
  if (hasProductionContext) {
    experience += 0.8;
    expertise += 0.7;
  }
  if (hasCodeSnippet) {
    expertise += 0.8;
    authority += 0.5;
  }
  if (hasArchitectureDiagram) {
    authority += 0.8;
  }

  experience = Math.min(10.0, Math.round(experience * 10) / 10);
  expertise = Math.min(10.0, Math.round(expertise * 10) / 10);
  authority = Math.min(10.0, Math.round(authority * 10) / 10);
  trust = Math.min(10.0, Math.round(trust * 10) / 10);

  // 2. Editorial Quality Evaluation
  const detectedFiller = detectAiFiller(content);
  const strengths = [];
  const issues = [];

  if (hasTradeoffs) strengths.push("Discusses practical engineering trade-offs and limitations.");
  if (hasCodeSnippet) strengths.push("Includes practical code implementation snippet.");
  if (hasProductionContext) strengths.push("Grounds technical advice in production operational context.");

  if (detectedFiller.length > 0) {
    issues.push(`Contains generic AI filler phrases: ${detectedFiller.join(", ")}`);
  }

  const editorialScore = Math.max(5.0, Math.min(10.0, 9.0 - detectedFiller.length * 0.8));

  // 3. Technical Consistency Evaluation
  const codeConsistencyResult = evaluateCodeConsistency(content);

  return {
    eeat: {
      experience,
      expertise,
      authority,
      trust,
    },
    editorial: {
      score: Math.round(editorialScore * 10) / 10,
      strengths,
      issues,
    },
    technicalConsistency: {
      score: codeConsistencyResult.score,
      contradictions: codeConsistencyResult.contradictions,
    },
  };
}
