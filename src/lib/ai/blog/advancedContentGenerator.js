/**
 * Advanced Content Generation Engine Master Orchestrator (Phase 4 Upgrade)
 * 
 * Generates high-density, authoritative technical articles by consuming complete
 * Content Generation Context (Topic Intelligence + Research + Article Blueprint + SEO + Brand Rules + Critic Feedback).
 * 
 * ADVANCED FEATURES:
 * - Anti-Repetition Rules (Prevents repeated intros, re-definitions, and formulaic headings).
 * - Section-Level Depth (Enforces section purpose, key questions, code blocks, comparison tables, and FAQs).
 * - Fact & EEAT Protection (Respects research evidence, cites official standards, avoids fake clients/metrics).
 * - Article-Type Adaptive Modes (Pillar, Supporting, Standalone Authority, Verified Trend).
 * 
 * FAIL-SAFE GUARANTEE:
 * - Bounded timeout.
 * - Auto-repair for JSON formatting errors.
 * - On failure/timeout/validation error, catches safely and returns null.
 * - NEVER throws uncaught errors; NEVER halts topic queue or daily cron execution.
 */

import { generateGeminiResponse } from "../../geminiService.js";
import { getBlogSeoDescription, getBlogWordCount, getInvalidBlogServiceSlugs, normalizeBlogServiceLinks } from "../../blogSeo.js";
import { formatBlueprintForWriter } from "./articleBlueprintEngine.js";
import { buildContentGenerationContext } from "./contentGenerationContext.js";

const ALLOWED_RELATED_SERVICE_SLUGS = new Set([
  "custom-website-development",
  "mern-stack-web-development",
  "nextjs-website-development",
  "full-stack-web-app-development",
  "admin-dashboard-development",
  "e-commerce-website-development",
  "portfolio-website-development",
  "landing-page-design",
  "website-redesign",
  "api-integration",
  "database-integration",
  "seo-friendly-website-setup",
  "website-speed-optimization",
  "maintenance-support",
]);

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
 * Formats Research Package into a high-impact writer directive string.
 */
function formatResearchForWriter(research = {}) {
  if (!research || !research.hasResearch) return "";

  const parts = [
    `VERIFIED TECHNICAL RESEARCH EVIDENCE (Confidence: ${Math.round((research.confidence || 0.8) * 100)}%):`,
  ];

  if (Array.isArray(research.questions) && research.questions.length > 0) {
    parts.push(`- Key Developer & User Questions to Answer: ${research.questions.slice(0, 5).join(" | ")}`);
  }

  if (Array.isArray(research.entities) && research.entities.length > 0) {
    parts.push(`- Key Technical Entities & Concepts: ${research.entities.join(", ")}`);
  }

  if (Array.isArray(research.claims) && research.claims.length > 0) {
    parts.push(`- Verified Technical Facts & Standards: ${research.claims.map((c) => c.claim || c).join(" | ")}`);
  }

  if (research.contentGaps?.opportunityAreas && research.contentGaps.opportunityAreas.length > 0) {
    parts.push(`- Critical Content Gaps to Fulfill: ${research.contentGaps.opportunityAreas.join(" | ")}`);
  }

  parts.push(`RULE: Use research as technical grounding. Never invent unsupported benchmark numbers or fake release dates.`);

  return parts.join("\n");
}

/**
 * Generates an advanced article using the full Generation Context.
 * 
 * @param {Object} contextInput - Raw parameters or normalized Generation Context
 * @param {Object} [options={}] - Custom options ({ timeoutMs, retryCount })
 * @returns {Promise<Object|null>} Standardized blogData object or null on failure
 */
export async function generateAdvancedArticleContent(contextInput = {}, options = {}) {
  const opts = options || {};
  
  const hasTopicTitle = Boolean(
    contextInput?.topic?.title ||
    contextInput?.topicPlan?.title ||
    contextInput?.title ||
    contextInput?.topicTitle
  );

  if (!contextInput || typeof contextInput !== "object" || !hasTopicTitle) {
    console.warn("[Advanced-Generator] Invalid or empty topic input provided.");
    return null;
  }

  const startedAt = Date.now();
  const retryCount = Number(opts.retryCount || contextInput?.refinement?.retryCount || 0);

  const genCtx = contextInput.topic
    ? contextInput
    : buildContentGenerationContext({ ...contextInput, options: opts });

  const topic = genCtx.topic;
  const articleType = topic.articleType;
  const contentCategory = topic.contentCategory;
  const isPillar = articleType === "pillar";
  const isAuthority = isPillar || articleType === "standalone_authority" || articleType === "verified_trend";
  const officialSourceUrls = Array.isArray(topic.trendPlan?.officialSources)
    ? topic.trendPlan.officialSources.map((s) => s?.url).filter(Boolean)
    : [];

  const targetWords = genCtx.seo.targetWords;
  const minimumWords = genCtx.seo.minimumWords;
  const minimumSections = genCtx.seo.minimumSections;

  // Build blueprint prompt block if blueprint exists
  const blueprintBlock = genCtx.blueprint.hasBlueprint ? formatBlueprintForWriter(genCtx.blueprint) : "";
  const researchBlock = formatResearchForWriter(genCtx.research);

  const prompt = `
TASK: ${genCtx.refinement.previousDraft ? "REFINE and ELEVATE" : "GENERATE"} a high-density, expert ${articleType.toUpperCase()} engineering article for Muhyo Tech.

ARTICLE TYPE: ${articleType.toUpperCase()}
PROFESSIONAL CATEGORY: ${contentCategory}
CATEGORY-SPECIFIC GUIDANCE: ${genCtx.brandRules.categoryGuidance}
PRIMARY TOPIC DIRECTION: "${topic.title}"
FOCUS KEYWORD: "${topic.focusKeyword}"
SEARCH INTENT: "${topic.searchIntent}"
AUDIENCE: ${topic.audience}

BRAND AND WEBSITE REPRESENTATION:
${genCtx.brandRules.positioning}

PROBLEM-SOLUTION EDITORIAL MODE:
${genCtx.brandRules.problemSolutionMode}

${blueprintBlock ? `${blueprintBlock}\n` : ""}
${researchBlock ? `${researchBlock}\n` : ""}

${genCtx.refinement.retryFeedback ? `CRITICAL FEEDBACK FROM PREVIOUS ATTEMPT: "${genCtx.refinement.retryFeedback}"\n` : ""}
${genCtx.refinement.previousDraft ? `PREVIOUS DRAFT TO IMPROVE: \nTitle: ${genCtx.refinement.previousDraft.title}\nContent: ${genCtx.refinement.previousDraft.content}\n` : ""}

CRITICAL GENERATION RULES (Follow strictly to pass Quality Review):
1. SENIOR ENGINEERING VOICE: Write like a Principal Engineer / Founder sharing real architectural lessons. Short, punchy paragraphs (2-3 sentences max).
2. DEPTH & NON-REPETITION:
   - Target ${targetWords}.
   - MUST include at least ${minimumSections} distinct <h2> sections in the HTML content.
   - DO NOT repeat identical intro hooks, restate the definition of terms already explained, or reuse identical section formulas.
   - Each section must answer a specific technical or business decision question.
${isAuthority ? `3. AUTHORITY & COMPLETE COVERAGE:
   - Direct summary upfront, followed by logical progression from fundamentals to advanced decisions.
   - MANDATORY FAQ SECTION: Include an <h2> titled "<h2>Frequently Asked Questions</h2>" or "<h2>Frequently Asked Questions (FAQs)</h2>" near the end with 3-4 direct Q&As.
   - MANDATORY PRACTICAL ELEMENTS: Include useful <h3> subsections, a real comparison <table>, a practical checklist, explicit pros/cons, common pitfalls, trade-offs, and final decision criteria.
   ${articleType === "verified_trend" ? `- Stay inside the supplied official evidence; clearly qualify uncertainty and cite official source URLs: ${officialSourceUrls.join(" | ") || "none supplied"}.` : ""}` : "3. FOCUS: Keep the scope focused on the specific subtopic without unnecessary pillar bloat."}
4. TECHNICAL REALISM & CODE:
   - Include clear, realistic engineering scenarios and practical code snippets (<pre><code>) where relevant.
   - Do NOT invent fake client names, fake revenue numbers, or fabricated case studies. Frame scenarios as standard production challenges.
5. SERVICE LINKING:
   - Contextually reference 1 to 3 relevant Muhyo Tech services using canonical URLs in the exact format /services/allowed-slug.
   - Allowed service slugs ONLY: custom-website-development, mern-stack-web-development, nextjs-website-development, full-stack-web-app-development, admin-dashboard-development, e-commerce-website-development, portfolio-website-development, landing-page-design, website-redesign, api-integration, database-integration, seo-friendly-website-setup, website-speed-optimization, maintenance-support.
6. HEADLINE & TITLE DIVERSITY (STRICT):
   - The article "title" must be natural, punchy, engaging, and unique.
   - NEVER start the title with formulaic clichés like "Engineering for...", "Engineering [X]", "Architecting...", "AI in...", "AI's Role in...", "An Engineering Guide to...", or "The Ultimate Guide...".
   - Use diverse, high-CTR developer styles (e.g. "How We Solved...", "Solving [Problem] in Production", "X vs Y: The Real Architectural Trade-offs", "4 [Topic] Mistakes That Break Web Apps at Scale", "Practical [Pattern] for Modern Next.js").

TOPIC UNIQUENESS:
Avoid structures or hooks similar to these recent articles: ${genCtx.seo.recentTopics.join(", ")}.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "title": "Human, engaging, unique, and punchy title (NO 'Engineering for...' or 'Architecting...')",
  "slug": "url-friendly-slug",
  "summary": "Compelling editorial summary (150-160 chars).",
  "seoTitle": "Search title, ideally 45-65 characters.",
  "seoDescription": "Search description between 120 and 155 characters.",
  "focusKeyword": "Primary search query",
  "searchIntent": "informational | commercial | transactional | navigational",
  "relatedServiceSlugs": ["1 to 3 allowed service slugs"],
  "category": "Engineering | Architecture | Technology | Backend | SEO | Security | Infrastructure",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Full HTML article body with <p>, <h2>, <h3>, <ul>/<ol>/<li>${isAuthority ? ", <table>/<thead>/<tbody>/<tr>/<th>/<td>" : ""} where useful. ${targetWords}. 2-3 sentences per paragraph ONLY. Keep HTML attributes simple.",
  "author": "Pir Ghulam Muhyo Din",
  "authorRole": "Founder",
  "readTime": "e.g. 7 min read",
  "image_prompt": "Realistic, editorial visual scene. Engineering focused. NO TEXT. NO NEON."
}
`;

  const timeoutMs = Number(
    opts.timeoutMs ||
    (isAuthority ? process.env.AI_PILLAR_DRAFT_TIMEOUT_MS || 40000 : process.env.AI_DRAFT_TIMEOUT_MS || 35000)
  );

  try {
    console.log(`[Advanced-Generator] Generating ${articleType.toUpperCase()} content for: "${topic.title}" (Timeout: ${timeoutMs}ms)`);

    const rawResponse = await generateGeminiResponse(prompt, {
      systemInstruction: `${genCtx.brandRules.positioning}\n${genCtx.brandRules.problemSolutionMode}`,
      temperature: 0.85,
      responseMimeType: "application/json",
      maxOutputTokens: isAuthority ? 16384 : 8192,
      thinkingBudget: 0,
      timeoutMs,
    });

    const cleanedResponse = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleanedResponse.indexOf("{");
    const jsonEnd = cleanedResponse.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      throw new SyntaxError("Gemini returned truncated JSON without a complete article object.");
    }

    const cleanedJson = cleanedResponse.slice(jsonStart, jsonEnd + 1);
    let parsed;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch (parseErr) {
      try {
        parsed = JSON.parse(repairUnescapedJsonQuotes(cleanedJson));
        console.warn("[Advanced-Generator] Repaired malformed JSON quotes safely.");
      } catch {
        throw parseErr;
      }
    }

    const content = typeof parsed.content === "string" ? parsed.content.trim() : "";
    parsed.seoDescription = getBlogSeoDescription({ ...parsed, content });

    const hasHtmlBlocks = /<(p|h2|h3|ul|ol|blockquote)\b/i.test(content);
    const sectionCount = (content.match(/<h2\b/gi) || []).length;
    const subsectionCount = (content.match(/<h3\b/gi) || []).length;
    const hasList = /<(ul|ol)\b/i.test(content);
    const hasTable = /<table\b/i.test(content);
    const hasFaq = /frequently asked|<h[23][^>]*>\s*faqs?\b/i.test(content);
    const wordCount = getBlogWordCount({ content });
    const seoDescriptionLength = String(parsed.seoDescription || "").trim().length;
    const summaryLength = String(parsed.summary || "").trim().length;
    const validSearchIntent = ["informational", "commercial", "transactional", "navigational"].includes(parsed.searchIntent);

    const validationIssues = [
      wordCount < minimumWords && `article has only ${wordCount} words (minimum ${minimumWords} for ${articleType})`,
      !hasHtmlBlocks && "article body is missing valid HTML blocks",
      sectionCount < minimumSections && `article has only ${sectionCount} H2 sections (minimum ${minimumSections})`,
      isAuthority && subsectionCount < 3 && `authority article has only ${subsectionCount} H3 subsections (minimum 3)`,
      isAuthority && !hasList && "authority article is missing a practical list or checklist",
      isPillar && !hasTable && "pillar is missing a useful comparison table",
      isAuthority && !hasFaq && "authority article is missing a clear FAQ section",
      articleType === "verified_trend" && !officialSourceUrls.length && "verified trend has no official source URL",
      articleType === "verified_trend" && officialSourceUrls.length && !officialSourceUrls.some((url) => content.includes(url)) && "verified trend does not cite its official source",
      !parsed.title && "title is missing",
      !parsed.slug && "slug is missing",
      summaryLength < 100 && `summary has only ${summaryLength} characters`,
      !parsed.focusKeyword && "focus keyword is missing",
      !parsed.seoTitle && "SEO title is missing",
      seoDescriptionLength < 120 && `SEO description has only ${seoDescriptionLength} characters`,
      seoDescriptionLength > 155 && `SEO description has ${seoDescriptionLength} characters (maximum 155)`,
      !validSearchIntent && "search intent is invalid",
    ].filter(Boolean);

    if (validationIssues.length) {
      if (retryCount < 2) {
        console.warn(`[Advanced-Generator] Validation issues detected (Retry #${retryCount + 1}): ${validationIssues.join("; ")}`);
        return generateAdvancedArticleContent(contextInput, {
          ...options,
          retryCount: retryCount + 1,
          retryFeedback: `Correct these exact validation problems: ${validationIssues.join("; ")}. Return a complete ${targetWords} ${articleType} article with at least ${minimumSections} useful H2 sections including an <h2>Frequently Asked Questions</h2> section.`,
        });
      }
      throw new Error(`Advanced article failed validation: ${validationIssues.join("; ")}.`);
    }

    parsed.slug = String(parsed.slug || parsed.title || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    parsed.tags = Array.isArray(parsed.tags)
      ? [...new Set(parsed.tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 8)
      : [];

    parsed.relatedServiceSlugs = Array.isArray(parsed.relatedServiceSlugs)
      ? [...new Set(parsed.relatedServiceSlugs)].filter((slug) => ALLOWED_RELATED_SERVICE_SLUGS.has(slug)).slice(0, 3)
      : [];

    parsed.seoTitle = String(parsed.seoTitle).trim();
    parsed.seoDescription = String(parsed.seoDescription).trim();
    parsed.focusKeyword = String(parsed.focusKeyword).trim();
    parsed.content = normalizeBlogServiceLinks(parsed.content);

    const durationMs = Date.now() - startedAt;
    console.log(`[Advanced-Generator] Article generated successfully in ${durationMs}ms. Word count: ${wordCount}, H2s: ${sectionCount}`);

    return parsed;
  } catch (err) {
    console.warn(`[Advanced-Generator] Safe fallback catch: ${err.message}`);
    return null;
  }
}
