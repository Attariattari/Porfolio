import { generateGeminiResponse } from "../../geminiService.js";

/**
 * Robust JSON Repair & Parsing Helper
 * Prevents JSON syntax errors from unescaped quotes, control chars, or token truncations.
 */
function parseFlexibleJson(text = "") {
  let cleaned = String(text || "").trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  cleaned = cleaned.trim();

  // Step 1: Standard JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    console.warn("[blogAuditEngine] Standard JSON parse failed, attempting sanitization...", err1.message);
  }

  // Step 2: Sanitize raw unescaped newlines inside strings
  let sanitized = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
    if (match === "\n") return "\\n";
    if (match === "\r") return "\\r";
    if (match === "\t") return "\\t";
    return "";
  });

  try {
    return JSON.parse(sanitized);
  } catch (err2) {
    console.warn("[blogAuditEngine] Sanitized JSON parse failed, using Regex extraction fallback...", err2.message);
  }

  // Step 3: Regex Extraction Fallback if JSON was truncated by token limits
  const extractString = (key) => {
    const regex = new RegExp(`"${key}"\\s*:\\s*"(.*?)"(?=\\s*,\\s*"|\\s*})`, "s");
    const match = cleaned.match(regex);
    if (match && match[1]) {
      return match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    return null;
  };

  const extractArray = (key) => {
    const regex = new RegExp(`"${key}"\\s*:\\s*\\[(.*?)\\]`, "s");
    const match = cleaned.match(regex);
    if (!match || !match[1]) return [];
    return match[1]
      .split(",")
      .map((item) => item.replace(/["\r\n]/g, "").trim())
      .filter(Boolean);
  };

  return {
    optimizedTitle: extractString("optimizedTitle"),
    optimizedSummary: extractString("optimizedSummary"),
    optimizedContent: extractString("optimizedContent"),
    optimizedSeoTitle: extractString("optimizedSeoTitle"),
    optimizedSeoDescription: extractString("optimizedSeoDescription"),
    spellingFixes: extractArray("spellingFixes"),
    syntaxFixes: extractArray("syntaxFixes"),
    keywordsAdded: extractArray("keywordsAdded"),
  };
}

/**
 * Calculates a lightweight readability & SEO quality score (0-100).
 */
export function calculateBlogSeoScore({ title = "", summary = "", content = "", focusKeyword = "" }) {
  let score = 50;

  const titleLength = title.trim().length;
  if (titleLength >= 30 && titleLength <= 70) score += 10;
  else if (titleLength > 0) score += 5;

  const summaryLength = summary.trim().length;
  if (summaryLength >= 80 && summaryLength <= 160) score += 10;
  else if (summaryLength > 0) score += 5;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 1000) score += 15;
  else if (wordCount >= 500) score += 10;
  else if (wordCount >= 200) score += 5;

  if (focusKeyword && focusKeyword.trim().length > 0) {
    const keywordLower = focusKeyword.toLowerCase().trim();
    if (title.toLowerCase().includes(keywordLower)) score += 5;
    if (summary.toLowerCase().includes(keywordLower)) score += 5;
    if (content.toLowerCase().includes(keywordLower)) score += 5;
  }

  // Check heading structure in content
  if (/#+\s+|<h[1-6]/i.test(content)) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Main AI Proofreader & SEO Enhancer Engine
 */
export async function auditAndFixBlogContent({
  title = "",
  summary = "",
  content = "",
  seoTitle = "",
  seoDescription = "",
  focusKeyword = "",
  contentCategory = "core_web_engineering",
}) {
  const originalScore = calculateBlogSeoScore({ title, summary, content, focusKeyword });

  const systemInstruction = `You are a Senior Editor and Technical SEO Master for Muhyo Tech.
Your task is to strictly review, proofread, and optimize a blog post for web publication.

CRITICAL RULES:
1. SPELLING & GRAMMAR: Fix all spelling mistakes, typos, awkward phrasing, and syntax errors.
2. CODE SAFETY: DO NOT alter, translate, or break any markdown code blocks (\`\`\`javascript ... \`\`\` or similar), HTML tags, URLs, or function names. Keep them EXACTLY intact.
3. SEO KEYWORDS: Insert high-ranking search-intent keywords relevant to category (${contentCategory}) naturally into paragraphs without keyword stuffing.
4. BRAND TONE: Keep the tone professional, practical, founder-friendly, and engaging.
5. PRESERVE MEANING: Do NOT invent fake client names or false statistics.

Return ONLY a valid JSON object matching this schema:
{
  "optimizedTitle": "string",
  "optimizedSummary": "string",
  "optimizedContent": "string",
  "optimizedSeoTitle": "string",
  "optimizedSeoDescription": "string",
  "spellingFixes": ["misspelled -> correct"],
  "syntaxFixes": ["brief description of fixed sentences"],
  "keywordsAdded": ["SEO keyword enhanced"]
}`;

  const prompt = `Review and proofread this blog post:

---
FOCUS KEYWORD: ${focusKeyword || "Web Engineering Best Practices"}
CATEGORY: ${contentCategory}

ORIGINAL TITLE:
${title}

ORIGINAL SUMMARY:
${summary}

ORIGINAL SEO TITLE:
${seoTitle || title}

ORIGINAL SEO DESCRIPTION:
${seoDescription || summary}

ORIGINAL CONTENT:
${content}
---

Return the JSON object now.`;

  try {
    const rawAiResponse = await generateGeminiResponse(prompt, {
      temperature: 0.2, // Low temperature for high precision editing
      responseMimeType: "application/json",
      systemInstruction,
      maxOutputTokens: 8192, // High token limit to prevent truncation on long blogs
      timeoutMs: 60000,
    });

    const result = parseFlexibleJson(rawAiResponse);

    const optimizedTitle = result.optimizedTitle || title;
    const optimizedSummary = result.optimizedSummary || summary;
    const optimizedContent = result.optimizedContent || content;
    const optimizedSeoTitle = result.optimizedSeoTitle || seoTitle || title;
    const optimizedSeoDescription = result.optimizedSeoDescription || seoDescription || summary;

    const spellingFixes = Array.isArray(result.spellingFixes) ? result.spellingFixes : [];
    const syntaxFixes = Array.isArray(result.syntaxFixes) ? result.syntaxFixes : [];
    const keywordsAdded = Array.isArray(result.keywordsAdded) ? result.keywordsAdded : [];

    const errorsFixedCount = spellingFixes.length + syntaxFixes.length;
    const optimizedScore = Math.max(
      originalScore + Math.min(25, errorsFixedCount * 3 + keywordsAdded.length * 2),
      calculateBlogSeoScore({
        title: optimizedTitle,
        summary: optimizedSummary,
        content: optimizedContent,
        focusKeyword,
      })
    );

    return {
      success: true,
      original: { title, summary, content, seoTitle, seoDescription },
      optimized: {
        title: optimizedTitle,
        summary: optimizedSummary,
        content: optimizedContent,
        seoTitle: optimizedSeoTitle,
        seoDescription: optimizedSeoDescription,
      },
      metrics: {
        originalScore,
        optimizedScore,
        errorsFixedCount,
        spellingFixes,
        syntaxFixes,
        keywordsAdded,
      },
    };
  } catch (error) {
    console.error("[blogAuditEngine] Error during AI audit:", error);
    return {
      success: false,
      error: error.message || "Failed to audit blog content.",
      original: { title, summary, content, seoTitle, seoDescription },
      optimized: { title, summary, content, seoTitle, seoDescription },
      metrics: {
        originalScore,
        optimizedScore: originalScore,
        errorsFixedCount: 0,
        spellingFixes: [],
        syntaxFixes: [],
        keywordsAdded: [],
      },
    };
  }
}
