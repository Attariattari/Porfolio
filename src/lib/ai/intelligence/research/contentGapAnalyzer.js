/**
 * Content Gap Analyzer Module (Phase 2 Upgrade)
 * 
 * Synthesizes search results, competitor coverage, and documentation guidance
 * to produce structured content gap insights for the writer.
 */

export function analyzeContentGaps(topic = {}, serpData = {}, competitorData = {}) {
  const pillar = topic.pillar || "Web Development";
  const focusKeyword = topic.focusKeyword || topic.title || "";

  const coveredTopics = competitorData.recurringTopics || [
    "Basic setup & quickstart guidance",
    "Conceptual overview",
  ];

  const commonQuestions = serpData.questions || [
    `How to implement ${focusKeyword} safely in production?`,
    `What are common pitfalls when scaling ${pillar}?`,
    `How does ${focusKeyword} impact performance and maintenance?`,
  ];

  const missingTopics = [
    "Production failure modes & recovery boundaries",
    "Detailed cost, complexity, and performance trade-offs",
    "Security hardening & input validation edge cases",
    "Backward-compatible database/schema migration strategies",
  ];

  const weakAreas = competitorData.weakAreas || [
    "Superficial code samples lacking error handling",
    "Unclear criteria for choosing between alternative architectures",
  ];

  const opportunityAreas = [
    "Provide a production-ready architectural checklist",
    "Include a clear comparison matrix evaluating alternatives",
    "Explain Muhyo Tech's real-world engineering approach and standards",
  ];

  return {
    coveredTopics,
    commonQuestions,
    missingTopics,
    weakAreas,
    opportunityAreas,
  };
}
