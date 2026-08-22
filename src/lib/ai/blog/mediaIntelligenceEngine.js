/**
 * In-Body Media Planning & Visual Intelligence Engine (Phase 7)
 * 
 * Analyzes article HTML sections to determine if technical topics benefit from
 * supporting visual diagrams (architecture diagrams, system flows, API lifecycles, database schemas).
 * 
 * Max Planning Targets (Bounds):
 * - Pillar: 2-4 supporting visuals
 * - Standalone Authority: 1-3
 * - Supporting: 0-2
 * - Verified Trend: 0-2
 * 
 * HERO IMAGE PRESERVATION:
 * Primary cover image pipeline in ensureBlogImage.js is 100% untouched.
 * Media plan items are optional supplementary visual assets stored under blogData.mediaPlan.
 */

import { stripBlogHtml } from "../../blogSeo.js";

const MEDIA_RULES = [
  {
    type: "architecture_diagram",
    terms: ["architecture", "micro-frontend", "multi-zone", "microservices", "monolith", "edge", "middleware", "rsc", "server component"],
    purpose: "Explain architectural boundaries and system component interactions.",
    promptTemplate: "Clean technical architecture diagram showing component boundaries and data flow for: ",
  },
  {
    type: "system_flow",
    terms: ["flow", "lifecycle", "request", "event loop", "pipeline", "ci/cd", "authentication", "jwt", "handshake", "websocket"],
    purpose: "Illustrate step-by-step request/response or authentication sequence flow.",
    promptTemplate: "Detailed process flow diagram illustrating sequence of events for: ",
  },
  {
    type: "database_relationship",
    terms: ["database", "schema", "mongodb", "sharding", "index", "embedding", "referencing", "aggregation"],
    purpose: "Visualize data model relationships or index query execution path.",
    promptTemplate: "Database schema diagram showing entity relationships and indexing for: ",
  },
  {
    type: "decision_framework",
    terms: ["trade-off", "comparison", "vs", "versus", "decision", "benchmarks", "evaluation"],
    purpose: "Visual decision matrix or trade-off evaluation framework.",
    promptTemplate: "Clean engineering decision tree matrix comparing approaches for: ",
  },
];

/**
 * Generates an in-body media plan for a candidate blog draft.
 * 
 * @param {Object} blogData - Generated blog data object
 * @param {Object} [options={}] - Options ({ articleType, maxVisuals })
 * @returns {Array<Object>} Array of planned media items
 */
export function generateMediaPlan(blogData = {}, options = {}) {
  const content = String(blogData.content || "");
  const title = blogData.title || "Technical Guide";
  const articleType = blogData.articleType || options.articleType || "supporting";

  // Target maximum bounds
  let maxTarget = 2;
  if (articleType === "pillar") maxTarget = 4;
  else if (articleType === "standalone_authority") maxTarget = 3;
  else if (articleType === "supporting" || articleType === "verified_trend") maxTarget = 2;

  if (options.maxVisuals) maxTarget = Math.min(maxTarget, Number(options.maxVisuals));

  // Extract H2 sections
  const h2Matches = [...content.matchAll(/<h2\b[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi)];
  if (h2Matches.length === 0) {
    return [];
  }

  const mediaPlan = [];

  for (const match of h2Matches) {
    if (mediaPlan.length >= maxTarget) break;

    const headingText = stripBlogHtml(match[1]).trim();
    const sectionBody = stripBlogHtml(match[2]).toLowerCase();
    const headingLower = headingText.toLowerCase();

    // Skip FAQ sections
    if (/frequently asked|faq/i.test(headingText)) continue;

    for (const rule of MEDIA_RULES) {
      const matchesRule = rule.terms.some((term) => headingLower.includes(term) || sectionBody.includes(term));
      if (matchesRule) {
        mediaPlan.push({
          section: headingText,
          type: rule.type,
          purpose: rule.purpose,
          alt: `Technical ${rule.type.replace(/_/g, " ")} for ${headingText} in ${title}`,
          caption: `Figure ${mediaPlan.length + 1}: ${rule.purpose} (${headingText})`,
          prompt: `${rule.promptTemplate} ${headingText} - ${title}`,
          priority: mediaPlan.length === 0 ? "high" : "medium",
          optional: false,
        });
        break;
      }
    }
  }

  return mediaPlan;
}
