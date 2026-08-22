/**
 * Article Blueprint Engine Master Orchestrator (Phase 3 Upgrade)
 * 
 * Converts a BlogTopicPlan + available Intelligence Context + Phase 2 Research Package
 * into a structured, machine-readable Article Blueprint BEFORE the article writer runs.
 * 
 * FAIL-SAFE GUARANTEE:
 * - Bounded timeout (20s default).
 * - Deterministic validation via validateArticleBlueprint.
 * - On failure/timeout/validation error, catches safely and returns null.
 * - NEVER throws uncaught errors; NEVER halts article generation or topic queue execution.
 */

import mongoose from "mongoose";
import { generateGeminiResponse } from "../../geminiService.js";
import { Blog } from "../../../models/Portfolio.js";
import { ArticleBlueprint } from "../../../models/ArticleBlueprint.js";
import { extractBlogIntelligenceContext } from "../intelligence/blogIntelligenceBridge.js";
import { validateArticleBlueprint } from "./articleBlueprintValidator.js";

const BLUEPRINT_SYSTEM_INSTRUCTION = `
Act as a Principal Technical Editor and Content Architect at Muhyo Tech.
Your mission is to convert a blog topic plan and available intelligence context into a highly structured, machine-readable Article Blueprint.

The blueprint is an editorial design document that tells the writer:
- WHAT the article must accomplish
- WHAT search intent to satisfy
- WHO the target audience is and what pain point they face
- WHAT H2/H3 section architecture to build and the depth required for each section
- WHAT concepts, entities, code examples, comparisons, and evidence belong in each section
- HOW to differentiate the article from existing content and prevent cannibalization
- WHICH internal links and Muhyo Tech services naturally fit
- WHAT editorial rules (trade-offs, limitations, practical engineering voice) to enforce

RULES:
1. Output MUST be strictly valid JSON matching the specified blueprint JSON structure.
2. DO NOT write the article body itself. Write detailed structural and editorial instructions.
3. Keep technical depth realistic, practical, and founder/engineer focused. Never fabricate client names or fake metrics.
`;

function repairUnescapedJsonQuotes(value = "") {
  let repaired = "";
  let insideString = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (!insideString) {
      repaired += character;
      if (character === '"') insideString = true;
      continue;
    }
    if (escaped) {
      repaired += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      repaired += character;
      escaped = true;
      continue;
    }
    if (character !== '"') {
      repaired += character;
      continue;
    }

    let nextIndex = index + 1;
    while (/\s/.test(value[nextIndex] || "")) nextIndex += 1;
    const nextCharacter = value[nextIndex];
    if ([":", ",", "}", "]"].includes(nextCharacter)) {
      repaired += character;
      insideString = false;
    } else {
      repaired += '\\"';
    }
  }

  return repaired;
}

/**
 * Retrieves compact existing blog metadata from the database for cannibalization & link planning.
 */
async function fetchCompactExistingBlogs() {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return [];
    }
    const existing = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select("title slug focusKeyword articleType category clusterKey searchIntent summary")
      .lean();
    return (existing || []).map((b) => ({
      title: b.title,
      slug: b.slug,
      focusKeyword: b.focusKeyword,
      articleType: b.articleType || "supporting",
      category: b.category,
      clusterKey: b.clusterKey,
      searchIntent: b.searchIntent,
      summary: b.summary ? String(b.summary).slice(0, 100) : "",
    }));
  } catch (err) {
    console.warn("[Article-Blueprint-Engine] Could not fetch existing blog metadata for overlap check:", err.message);
    return [];
  }
}

/**
 * Generates an Article Blueprint for a topic plan.
 * 
 * @param {Object} topicInput - BlogTopicPlan document or raw topic object
 * @param {Object} [researchPackage=null] - Optional Phase 2 Research Package
 * @param {Object} [options={}] - Custom options ({ timeoutMs, retryCount })
 * @returns {Promise<Object|null>} Article Blueprint payload or null on failure
 */
export async function generateArticleBlueprint(topicInput = {}, researchPackage = null, options = {}) {
  const startedAt = Date.now();
  const timeoutMs = Number(options.timeoutMs || process.env.AI_BLUEPRINT_TIMEOUT_MS || 20000);
  const retryCount = Number(options.retryCount || 0);

  if (!topicInput || (!topicInput.title && !topicInput.topicTitle)) {
    console.warn("[Article-Blueprint-Engine] Invalid or empty topic input provided.");
    return null;
  }

  const ctx = extractBlogIntelligenceContext(topicInput);
  const existingBlogs = await fetchCompactExistingBlogs();

  const hasResearch = Boolean(
    researchPackage &&
    researchPackage.status !== "unavailable" &&
    Number(researchPackage.researchConfidence || 0) > 0
  );
  const researchStatus = hasResearch ? researchPackage.status || "completed" : "not_available";

  const isAuthority = ctx.articleType === "pillar" || ctx.articleType === "standalone_authority" || ctx.articleType === "verified_trend";
  const minH2s = isAuthority ? 6 : 4;

  const prompt = `
Generate a complete, structured Article Blueprint JSON for the following technical article plan.

TOPIC PLAN CONTEXT:
- Title direction: "${ctx.title}"
- Article Type: ${ctx.articleType.toUpperCase()} (${ctx.topicType})
- Content Category: ${ctx.contentCategory}
- Cluster Key: ${ctx.clusterKey || "general"}
- Cluster Title: ${ctx.clusterTitle || ctx.pillar}
- Pillar: ${ctx.pillar}
- Subtopic: ${ctx.subtopic}
- Core Reader Problem: ${ctx.problem}
- Engineering Solution Angle: ${ctx.solutionAngle}
- Business Value: ${ctx.businessValue}
- Audience Persona: ${ctx.audienceProfile?.label || "Founders and developers"}
- Primary Search Query: ${ctx.focusKeyword}
- Declared Search Intent: ${ctx.searchIntent}
- Format: ${ctx.format}
- Primary Service Connection: ${ctx.serviceIntent?.serviceKey ? `/services/${ctx.serviceIntent.serviceKey}` : "None"}
- Parent Pillar Article: ${ctx.parentPillarBlog?.title ? `"${ctx.parentPillarBlog.title}" at /blog/${ctx.parentPillarBlog.slug}` : "None"}

RESEARCH CONTEXT (${hasResearch ? `Confidence: ${Math.round((researchPackage.researchConfidence || 0.8) * 100)}%` : "Not Available"}):
${hasResearch ? JSON.stringify({
  questions: researchPackage.questions || [],
  entities: researchPackage.entities || [],
  contentGaps: researchPackage.contentGaps || {},
  claims: (researchPackage.claims || []).slice(0, 5),
}, null, 2) : "Research status: not_available. Build structure based on topic plan context and senior engineering patterns."}

EXISTING CONTENT ECOSYSTEM (Compact Metadata):
${JSON.stringify(existingBlogs.slice(0, 25), null, 2)}

REQUIRED BLUEPRINT STRUCTURE (STRICT JSON OUTPUT):
{
  "version": "1.0.0",
  "articleType": "${ctx.articleType}",
  "contentCategory": "${ctx.contentCategory}",
  "clusterKey": "${ctx.clusterKey || ""}",
  "clusterTitle": "${ctx.clusterTitle || ctx.pillar}",
  "titleDirection": "${ctx.title}",
  "primaryIntent": "${ctx.searchIntent || "informational"}",
  "secondaryIntents": ["informational"],
  "audience": {
    "primary": "${ctx.audienceProfile?.label || "Founders and developers"}",
    "secondary": "Technical decision makers",
    "expertiseLevel": "intermediate_to_advanced",
    "businessContext": "${ctx.businessValue || "Improving reliability and engineering speed"}"
  },
  "readerProblem": "${ctx.problem}",
  "desiredOutcome": "${ctx.solutionAngle}",
  "uniqueAngle": "Clear, non-generic engineering perspective distinguishing this from standard web tutorials.",
  "searchCoverage": {
    "primaryQuery": "${ctx.focusKeyword}",
    "secondaryQueries": ["query 2", "query 3"],
    "relatedQuestions": ["question 1", "question 2"],
    "entities": ["technology 1", "framework 2", "pattern 3"],
    "subtopics": ["subtopic 1", "subtopic 2"],
    "terminology": ["term 1", "term 2"]
  },
  "structure": [
    {
      "order": 1,
      "heading": "Clear, Actionable H2 Heading",
      "headingLevel": "h2",
      "purpose": "Explain exact objective of this section.",
      "keyQuestions": ["What question does this section resolve?"],
      "requiredConcepts": ["concept 1", "concept 2"],
      "evidenceNeeded": false,
      "exampleNeeded": true,
      "codeNeeded": false,
      "comparisonNeeded": false,
      "estimatedDepth": "deep"
    }
    /* MUST include at least ${minH2s} distinct H2 sections ${isAuthority ? "including an explicit 'Frequently Asked Questions (FAQs)' H2 section" : ""} */
  ],
  "requiredElements": {
    "introduction": "Hook with real pain point, declare scope and key takeaway upfront.",
    "practicalExample": "Concrete engineering scenario describing workflow or architectural choice.",
    "codeExample": "Clear, concise code block demonstrating the core implementation logic.",
    "comparison": "Side-by-side trade-off comparison evaluating options or performance implications.",
    "table": "Structured comparison table comparing criteria, speed, cost, or complexity.",
    "checklist": "Actionable decision checklist for senior developers/founders.",
    "faq": "3-4 concise, direct Q&As answering high-intent technical questions.",
    "conclusion": "Summary of decision framework and practical next step."
  },
  "researchMap": [
    {
      "claimOrSection": "Section or topic statement",
      "source": "Official documentation or standard",
      "sourceType": "official_documentation",
      "evidenceSummary": "Verified behavior or benchmark concept",
      "confidence": 0.9
    }
  ],
  "internalLinkPlan": [
    {
      "targetType": "${ctx.parentPillarBlog ? "pillar" : "service"}",
      "targetId": "${ctx.parentPillarBlog?.slug || ctx.serviceIntent?.serviceKey || ""}",
      "targetSlug": "${ctx.parentPillarBlog?.slug || ctx.serviceIntent?.serviceKey || ""}",
      "reason": "Provide context to foundational guide or service capabilities.",
      "anchorDirection": "natural contextual anchor text"
    }
  ],
  "serviceAlignment": {
    "serviceSlug": "${ctx.serviceIntent?.serviceKey && ["custom-website-development","mern-stack-web-development","nextjs-website-development","full-stack-web-app-development","admin-dashboard-development","e-commerce-website-development","portfolio-website-development","landing-page-design","website-redesign","api-integration","database-integration","seo-friendly-website-setup","website-speed-optimization","maintenance-support"].includes(ctx.serviceIntent.serviceKey) ? ctx.serviceIntent.serviceKey : "full-stack-web-app-development"}",
    "reason": "Natural fit for clients needing custom web application development.",
    "relevance": 0.85,
    "ctaDirection": "Soft educational invitation to discuss custom web engineering."
  },
  "conversionStrategy": {
    "intent": "educational_trust",
    "ctaType": "soft_consultation",
    "ctaPlacement": "end_of_article",
    "valueProposition": "Engineering guidance for scaling web infrastructure."
  },
  "differentiation": {
    "existingOverlap": ["Topics covered in existing blogs"],
    "avoidTopics": ["Basic introductory definitions already well covered elsewhere"],
    "uniqueCoverage": ["Specific practical edge-cases and trade-offs"],
    "competitiveGap": "Deep production trade-offs often omitted in generic tutorials.",
    "cannibalizationRisk": "low"
  },
  "editorialRules": {
    "tone": "Senior engineering leadership — practical, honest, direct.",
    "depth": "deep",
    "firstHandPerspective": true,
    "technicalDepth": "intermediate_to_advanced",
    "businessDepth": "connects code to maintenance and performance outcomes",
    "limitationsRequired": true,
    "tradeoffsRequired": true
  }
}
`;

  try {
    console.log(`[Article-Blueprint-Engine] Generating blueprint for topic: "${ctx.title}" (Timeout: ${timeoutMs}ms)`);

    const rawResponse = await generateGeminiResponse(prompt, {
      systemInstruction: BLUEPRINT_SYSTEM_INSTRUCTION,
      temperature: 0.4, // Lower temperature for structured planning
      responseMimeType: "application/json",
      timeoutMs,
    });

    const cleanedResponse = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      throw new Error("Gemini returned truncated JSON without a complete blueprint object.");
    }

    const cleanedJson = cleanedResponse.slice(jsonStart, jsonEnd + 1);
    let blueprintObj;
    try {
      blueprintObj = JSON.parse(cleanedJson);
    } catch (parseErr) {
      blueprintObj = JSON.parse(repairUnescapedJsonQuotes(cleanedJson));
    }

    // Attach metadata
    const durationMs = Date.now() - startedAt;
    const intentMismatch = String(blueprintObj.primaryIntent || "").toLowerCase() !== String(ctx.searchIntent || "").toLowerCase();

    blueprintObj.topicPlanId = ctx.topicPlanId || topicInput._id?.toString?.() || null;
    blueprintObj.generationMeta = {
      timestamp: new Date(),
      model: "gemini-flash",
      durationMs,
      researchStatus,
      intentMismatch,
      warnings: [],
    };

    // Validate blueprint
    const valResult = validateArticleBlueprint(blueprintObj);
    if (!valResult.valid) {
      console.warn(`[Article-Blueprint-Engine] Blueprint validation failed: ${valResult.errors.join("; ")}`);
      if (retryCount < 1) {
        return generateArticleBlueprint(topicInput, researchPackage, {
          ...options,
          retryCount: retryCount + 1,
        });
      }
      return null;
    }

    if (valResult.warnings.length) {
      blueprintObj.generationMeta.warnings = valResult.warnings;
      console.log(`[Article-Blueprint-Engine] Blueprint passed validation with ${valResult.warnings.length} warning(s).`);
    }

    // Safe DB persistence
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1 && ArticleBlueprint && typeof ArticleBlueprint.create === "function") {
        await ArticleBlueprint.create(blueprintObj);
        console.log(`[Article-Blueprint-Engine] Successfully persisted blueprint to MongoDB.`);
      }
    } catch (dbErr) {
      console.warn("[Article-Blueprint-Engine] Safe catch: DB persistence failed:", dbErr.message);
    }

    console.log(`[Article-Blueprint-Engine] Blueprint generated successfully in ${durationMs}ms. Sections: ${valResult.metrics.sectionCount}, H2s: ${valResult.metrics.h2Count}`);

    return blueprintObj;
  } catch (err) {
    console.warn(`[Article-Blueprint-Engine] Safe fallback catch: ${err.message}`);
    return buildFallbackBlueprint(ctx, researchPackage);
  }
}

/**
 * Deterministic Fallback Blueprint Builder.
 * Produces a complete, schema-compliant ArticleBlueprint when AI generation fails or times out.
 */
export function buildFallbackBlueprint(ctx = {}, researchPackage = null) {
  const isAuthority = ctx.articleType === "pillar" || ctx.articleType === "standalone_authority" || ctx.articleType === "verified_trend";
  const title = ctx.title || "Custom Engineering Guide";
  const primaryService = ctx.serviceIntent?.serviceKey || "custom-website-development";

  const structure = [
    {
      order: 1,
      heading: `Understanding ${ctx.subtopic || ctx.pillar || "the Core Technical Architecture"}`,
      headingLevel: "h2",
      purpose: "Define the fundamental architectural principles and real-world performance stakes.",
      keyQuestions: [`What is ${ctx.subtopic || ctx.pillar}?`, `Why is it critical for modern systems?`],
      requiredConcepts: [ctx.pillar, ctx.subtopic].filter(Boolean),
      evidenceNeeded: false,
      exampleNeeded: true,
      codeNeeded: false,
      comparisonNeeded: false,
      estimatedDepth: "standard",
    },
    {
      order: 2,
      heading: `Common Bottlenecks & Why Traditional Approaches Fail`,
      headingLevel: "h2",
      purpose: "Analyze specific bottlenecks causing developer friction and business latency.",
      keyQuestions: [`What causes ${ctx.problem || "performance issues"}?`, `How does it impact users?`],
      requiredConcepts: ["latency", "resource overhead", "maintainability"],
      evidenceNeeded: true,
      exampleNeeded: true,
      codeNeeded: false,
      comparisonNeeded: true,
      estimatedDepth: "deep",
    },
    {
      order: 3,
      heading: `Step-by-Step Implementation & Practical Code Architecture`,
      headingLevel: "h2",
      purpose: "Provide production-ready, hands-on implementation guide with code snippets.",
      keyQuestions: [`How do you implement ${ctx.solutionAngle || "the solution"} correctly?`],
      requiredConcepts: ["clean architecture", "code implementation", "error handling"],
      evidenceNeeded: false,
      exampleNeeded: true,
      codeNeeded: true,
      comparisonNeeded: false,
      estimatedDepth: "deep",
    },
    {
      order: 4,
      heading: `Production Trade-Offs, Edge Cases & Real-World Limitations`,
      headingLevel: "h2",
      purpose: "Evaluate technical trade-offs, scaling limits, and edge cases to avoid in production.",
      keyQuestions: [`What are the trade-offs of this approach?`, `When should you NOT use this pattern?`],
      requiredConcepts: ["trade-offs", "edge cases", "scalability limits"],
      evidenceNeeded: true,
      exampleNeeded: true,
      codeNeeded: false,
      comparisonNeeded: true,
      estimatedDepth: "standard",
    },
    {
      order: 5,
      heading: `Engineering Checklist for Long-Term Maintainability`,
      headingLevel: "h2",
      purpose: "Summarize actionable verification steps for deployment readiness.",
      keyQuestions: [`How do you verify this implementation before shipping to production?`],
      requiredConcepts: ["audit checklist", "monitoring", "best practices"],
      evidenceNeeded: false,
      exampleNeeded: false,
      codeNeeded: false,
      comparisonNeeded: false,
      estimatedDepth: "standard",
    },
  ];

  if (isAuthority) {
    structure.splice(2, 0, {
      order: 3,
      heading: `Advanced Configuration & Performance Optimization Patterns`,
      headingLevel: "h2",
      purpose: "Deep-dive into advanced optimizations, caching strategies, and telemetry.",
      keyQuestions: [`How do you scale ${ctx.pillar} for high concurrency?`],
      requiredConcepts: ["caching", "indexing", "concurrency"],
      evidenceNeeded: true,
      exampleNeeded: true,
      codeNeeded: true,
      comparisonNeeded: false,
      estimatedDepth: "deep",
    });
    structure.forEach((s, idx) => { s.order = idx + 1; });
  }

  return {
    version: "1.0.0",
    topicPlanId: ctx.topicPlanId || null,
    articleType: ctx.articleType || "supporting",
    contentCategory: ctx.contentCategory || "core_web_engineering",
    clusterKey: ctx.clusterKey || "",
    clusterTitle: ctx.clusterTitle || ctx.pillar || "Engineering Architecture",
    titleDirection: title,
    primaryIntent: (ctx.searchIntent || "informational").toLowerCase().includes("commercial") ? "commercial" : "informational",
    secondaryIntents: ["informational"],
    audience: {
      primary: ctx.audienceProfile?.label || "Founders and senior developers",
      secondary: "Technical teams and engineering leads",
      expertiseLevel: "intermediate_to_advanced",
      businessContext: ctx.businessProblem?.label || "Scaling web systems cleanly",
    },
    readerProblem: ctx.problem || "Technical friction and performance bottlenecks in web architecture",
    desiredOutcome: ctx.businessValue || "High-performance, maintainable web systems",
    uniqueAngle: ctx.solutionAngle || "Practical production engineering with honest trade-offs",
    searchCoverage: {
      primaryQuery: ctx.focusKeyword || title,
      secondaryQueries: [ctx.focusKeyword ? `${ctx.focusKeyword} best practices` : "web engineering guide"],
      relatedQuestions: [`How to optimize ${ctx.subtopic || ctx.pillar}?`],
      entities: [ctx.pillar, ctx.subtopic, "Next.js", "Node.js"].filter(Boolean),
      subtopics: [ctx.subtopic || "web performance"],
      terminology: [ctx.pillar, "Architecture", "Latency", "Optimization"].filter(Boolean),
    },
    structure,
    requiredElements: {
      introduction: "Hook readers with the concrete problem, business stakes, and exact engineering solution.",
      practicalExample: "Real-world production scenario demonstrating the architectural bottleneck and fix.",
      codeExample: "Clean, documented, TypeScript/JavaScript code snippet with error handling.",
      comparison: "Trade-off analysis comparing traditional naive approach vs modern optimized pattern.",
      table: "Key performance metrics or feature matrix comparison table.",
      checklist: "Actionable 5-point deployment verification checklist.",
      faq: "3 to 4 technical FAQs addressing common edge cases.",
      conclusion: "Practical summary reinforcing business value and next steps.",
    },
    researchMap: [],
    internalLinkPlan: [
      {
        targetType: "service",
        targetSlug: primaryService,
        reason: "Contextual connection to related engineering services.",
        anchorDirection: `Professional ${primaryService.replace(/-/g, " ")} services`,
      },
    ],
    serviceAlignment: {
      serviceSlug: primaryService,
      reason: "Natural commercial relevance for scaling custom web infrastructure.",
      relevance: 0.85,
      ctaDirection: "Soft educational invitation to discuss custom web engineering.",
    },
    conversionStrategy: {
      intent: "educational_trust",
      ctaType: "soft_consultation",
      ctaPlacement: "end_of_article",
      valueProposition: "Engineering guidance for scaling modern web infrastructure.",
    },
    differentiation: {
      existingOverlap: [],
      avoidTopics: ["Basic beginner definitions without engineering depth"],
      uniqueCoverage: ["Production-level edge cases and trade-offs"],
      competitiveGap: "Hands-on engineering details and code examples omitted in generic tutorials.",
      cannibalizationRisk: "low",
    },
    editorialRules: {
      tone: "Senior engineering leadership — practical, honest, direct.",
      depth: "deep",
      firstHandPerspective: true,
      technicalDepth: "intermediate_to_advanced",
      businessDepth: "connects code to maintenance and performance outcomes",
      limitationsRequired: true,
      tradeoffsRequired: true,
    },
    generationMeta: {
      source: "fallback_blueprint_engine",
      generatedAt: new Date().toISOString(),
      durationMs: 10,
      researchPackageUsed: Boolean(researchPackage),
      aiRetries: 0,
      warnings: ["Generated via robust fallback engine."],
    },
  };
}

/**
 * Formats a valid Article Blueprint into a compact, high-impact ARTICLE BLUEPRINT CONTEXT string for the AI Writer.
 * 
 * @param {Object} blueprint - Valid Article Blueprint object
 * @returns {string} Formatted writer context block
 */
export function formatBlueprintForWriter(blueprint = {}) {
  if (!blueprint || typeof blueprint !== "object" || !blueprint.titleDirection) {
    return "";
  }

  const parts = [
    "==================================================",
    "ARTICLE BLUEPRINT CONTEXT (Mandatory Editorial Plan)",
    "==================================================",
    `EDITORIAL OBJECTIVE: Execute the article according to this structured blueprint.`,
    `TITLE DIRECTION: "${blueprint.titleDirection}"`,
    `PRIMARY SEARCH INTENT: ${String(blueprint.primaryIntent || "informational").toUpperCase()}`,
    `TARGET AUDIENCE: ${blueprint.audience?.primary || "Founders and developers"} (${blueprint.audience?.expertiseLevel || "intermediate_to_advanced"})`,
    `READER PAIN POINT: ${blueprint.readerProblem || "Unresolved engineering trade-off"}`,
    `DESIRED OUTCOME: ${blueprint.desiredOutcome || "Actionable implementation strategy"}`,
    `UNIQUE ANGLE: ${blueprint.uniqueAngle || "Pragmatic engineering perspective"}`,
  ];

  if (blueprint.searchCoverage?.primaryQuery) {
    parts.push(`PRIMARY QUERY: ${blueprint.searchCoverage.primaryQuery}`);
  }
  if (Array.isArray(blueprint.searchCoverage?.entities) && blueprint.searchCoverage.entities.length) {
    parts.push(`KEY ENTITIES TO COVER: ${blueprint.searchCoverage.entities.join(", ")}`);
  }

  // Section Architecture
  const structure = Array.isArray(blueprint.structure) ? blueprint.structure : [];
  if (structure.length) {
    parts.push("\nPLANNED SECTION ARCHITECTURE:");
    structure.forEach((sec, idx) => {
      const level = String(sec.headingLevel || "h2").toUpperCase();
      const reqs = [
        sec.codeNeeded && "Code snippet required",
        sec.exampleNeeded && "Practical example required",
        sec.comparisonNeeded && "Comparison required",
        sec.evidenceNeeded && "Evidence cite required",
      ].filter(Boolean).join(", ");

      parts.push(`  ${idx + 1}. [${level}] "${sec.heading}"`);
      if (sec.purpose) parts.push(`     Purpose: ${sec.purpose}`);
      if (Array.isArray(sec.keyQuestions) && sec.keyQuestions.length) {
        parts.push(`     Answers: ${sec.keyQuestions.join(" | ")}`);
      }
      if (Array.isArray(sec.requiredConcepts) && sec.requiredConcepts.length) {
        parts.push(`     Concepts: ${sec.requiredConcepts.join(", ")}`);
      }
      if (reqs) parts.push(`     Requirements: ${reqs}`);
    });
  }

  // Required Elements
  if (blueprint.requiredElements) {
    const req = blueprint.requiredElements;
    parts.push("\nREQUIRED ARTICLE ELEMENTS:");
    if (req.practicalExample) parts.push(`  - Practical Example: ${req.practicalExample}`);
    if (req.codeExample) parts.push(`  - Code Example: ${req.codeExample}`);
    if (req.table) parts.push(`  - Table: ${req.table}`);
    if (req.checklist) parts.push(`  - Checklist: ${req.checklist}`);
    if (req.faq) parts.push(`  - FAQ Section: ${req.faq}`);
  }

  // Service Alignment & CTA
  if (blueprint.serviceAlignment?.serviceSlug) {
    parts.push(`\nSERVICE ALIGNMENT: Link to /services/${blueprint.serviceAlignment.serviceSlug} naturally.`);
    if (blueprint.serviceAlignment.ctaDirection) {
      parts.push(`CTA DIRECTION: ${blueprint.serviceAlignment.ctaDirection}`);
    }
  }

  // Differentiation & Avoidance
  if (blueprint.differentiation) {
    const diff = blueprint.differentiation;
    parts.push("\nDIFFERENTIATION & CANNIBALIZATION BOUNDARIES:");
    if (Array.isArray(diff.avoidTopics) && diff.avoidTopics.length) {
      parts.push(`  - DO NOT COVER (Already covered elsewhere): ${diff.avoidTopics.join(" | ")}`);
    }
    if (diff.competitiveGap) {
      parts.push(`  - COMPETITIVE GAP TO FILL: ${diff.competitiveGap}`);
    }
  }

  // Editorial Rules
  if (blueprint.editorialRules) {
    const ed = blueprint.editorialRules;
    parts.push("\nEDITORIAL RULES:");
    parts.push(`  - Tone: ${ed.tone || "Senior engineering leadership"}`);
    if (ed.tradeoffsRequired) parts.push(`  - MUST discuss real engineering trade-offs explicitly.`);
    if (ed.limitationsRequired) parts.push(`  - MUST acknowledge limitations and edge cases.`);
  }

  parts.push("==================================================\n");

  return parts.join("\n");
}
