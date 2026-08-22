/**
 * Official Documentation Research Provider
 * 
 * Prioritizes official documentation and standards (React, Next.js, Node.js, MongoDB, MDN, Vercel, TypeScript).
 * Assigns official documentation sources the highest authority level (1.0).
 */

import { BaseResearchProvider } from "./baseProvider.js";
import { generateGeminiResponse } from "../../../../geminiService.js";

const OFFICIAL_DOMAINS = Object.freeze([
  { keywords: ["next", "next.js", "server action", "app router", "rsc"], name: "Next.js Documentation", url: "https://nextjs.org/docs", domain: "nextjs.org" },
  { keywords: ["react", "useeffect", "usestate", "hook", "component"], name: "React Documentation", url: "https://react.dev", domain: "react.dev" },
  { keywords: ["node", "express", "backend", "event loop", "stream"], name: "Node.js Documentation", url: "https://nodejs.org/docs", domain: "nodejs.org" },
  { keywords: ["mongo", "mongodb", "mongoose", "aggregation", "index"], name: "MongoDB Manual", url: "https://www.mongodb.com/docs", domain: "mongodb.com" },
  { keywords: ["web", "html", "css", "javascript", "browser", "dom", "api"], name: "MDN Web Docs", url: "https://developer.mozilla.org", domain: "developer.mozilla.org" },
  { keywords: ["typescript", "ts", "type", "interface"], name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs", domain: "typescriptlang.org" },
  { keywords: ["vercel", "deployment", "edge"], name: "Vercel Documentation", url: "https://vercel.com/docs", domain: "vercel.com" },
]);

export class DocumentationResearchProvider extends BaseResearchProvider {
  constructor(options = {}) {
    super({ name: "documentation_research_provider", timeoutMs: options.timeoutMs || 3500 });
  }

  async conductResearch(request = {}) {
    return this.executeBounded(async (signal) => {
      const topicTitle = request.topicTitle || request.focusKeyword || "Web Technology";
      const focusKeyword = request.focusKeyword || topicTitle;
      const text = `${topicTitle} ${focusKeyword}`.toLowerCase();

      // Find matching official documentation domains
      const matchedDocs = OFFICIAL_DOMAINS.filter((doc) =>
        doc.keywords.some((kw) => text.includes(kw))
      );

      const docsToUse = matchedDocs.length > 0 ? matchedDocs : [OFFICIAL_DOMAINS[0], OFFICIAL_DOMAINS[4]];

      const prompt = `
        You are a Technical Documentation Specialist retrieving official documentation guidance.
        
        TOPIC: "${topicTitle}"
        PRIMARY KEYWORD: "${focusKeyword}"
        OFFICIAL DOMAINS: ${docsToUse.map((d) => d.name).join(", ")}
        
        Synthesize the core official architectural patterns, official best practices, and official version standards for this technical topic.
        
        OUTPUT STRICT JSON ONLY:
        {
          "officialSources": [
            {
              "title": "Official Doc Section Title",
              "url": "https://official-domain.org/docs/section",
              "domain": "official-domain.org",
              "sourceType": "official_documentation",
              "authorityLevel": 1.0,
              "summary": "Core official guideline or architecture decision."
            }
          ],
          "officialStandards": ["Standard or best practice 1", "Standard or best practice 2"],
          "officialDeprecations": ["Deprecation or obsolete pattern to avoid"]
        }
      `;

      const response = await generateGeminiResponse(prompt, {
        temperature: 0.1,
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
        thinkingBudget: 0,
        timeoutMs: Math.min(this.timeoutMs, 3500),
      });

      const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const officialSources = (Array.isArray(parsed.officialSources) ? parsed.officialSources : []).map((s) => ({
        url: s.url || docsToUse[0].url,
        title: s.title || docsToUse[0].name,
        domain: s.domain || docsToUse[0].domain,
        sourceType: "official_documentation",
        authorityLevel: 1.0,
        relevanceScore: 0.95,
        freshnessScore: 0.9,
        confidence: 0.95,
      }));

      return {
        officialSources: officialSources.slice(0, 4),
        officialStandards: Array.isArray(parsed.officialStandards) ? parsed.officialStandards.slice(0, 4) : [],
        officialDeprecations: Array.isArray(parsed.officialDeprecations) ? parsed.officialDeprecations.slice(0, 3) : [],
      };
    });
  }
}
