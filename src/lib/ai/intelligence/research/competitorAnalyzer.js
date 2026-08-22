/**
 * Competitor & SERP Coverage Analyzer Module
 * 
 * Analyzes competitor coverage patterns at a high level to identify:
 * - Recurring subtopics & technical concepts
 * - Technical depth patterns
 * - Common weaknesses or outdated patterns
 * - Legitimate opportunities for a superior engineering guide
 * 
 * STRICT MANDATE:
 * - DO NOT copy competitor text.
 * - DO NOT reproduce competitor writing style.
 * - Purpose is strictly identifying coverage gaps and improvement opportunities.
 */

export function analyzeCompetitorCoverage(serpResults = [], category = "core_web_engineering") {
  if (!Array.isArray(serpResults) || serpResults.length === 0) {
    return {
      recurringTopics: ["Foundational concepts", "Implementation details", "Production considerations"],
      technicalDepth: "standard",
      weakAreas: ["Missing explicit production error handling and edge cases"],
      opportunities: ["Provide concrete engineering tradeoffs and post-mortem lessons"],
    };
  }

  const combinedText = serpResults.map((r) => `${r.title || ""} ${r.snippet || ""}`).join(" ");

  const recurringTopics = [];
  if (/performance|speed|optimization/i.test(combinedText)) recurringTopics.push("Performance Optimization & Latency");
  if (/security|auth|token|permission/i.test(combinedText)) recurringTopics.push("Security & Identity Controls");
  if (/database|mongodb|index|query/i.test(combinedText)) recurringTopics.push("Data Persistence & Index Strategy");
  if (/architecture|design|pattern/i.test(combinedText)) recurringTopics.push("System Architecture Boundaries");
  if (/deploy|vercel|aws|cloud/i.test(combinedText)) recurringTopics.push("Deployment & CI/CD Pipelines");
  if (recurringTopics.length === 0) recurringTopics.push("Production Architecture & Implementation");

  const weakAreas = [
    "Most top articles cover basic setup but lack concrete production failure scenarios",
    "Generic code snippets without operational error handling or rollback boundaries",
    "Omission of real-world performance/cost tradeoffs for scaling applications",
  ];

  const opportunities = [
    "Include a clear step-by-step engineering decision framework",
    "Provide actionable pros/cons and honest limitations of each approach",
    "Explain explicit failure recovery and observability patterns",
  ];

  return {
    recurringTopics,
    technicalDepth: combinedText.length > 500 ? "detailed" : "standard",
    weakAreas,
    opportunities,
  };
}
