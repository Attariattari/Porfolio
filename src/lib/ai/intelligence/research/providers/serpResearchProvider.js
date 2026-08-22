/**
 * SERP / Search Research Provider
 * 
 * Conducts structured search landscape research for a given topic.
 * Gathers relevant search result snippets, competitor coverage patterns,
 * recurring developer questions, and domain authority signals.
 */

import { BaseResearchProvider } from "./baseProvider.js";
import { generateGeminiResponse } from "../../../../geminiService.js";

export class SerpResearchProvider extends BaseResearchProvider {
  constructor(options = {}) {
    super({ name: "serp_research_provider", timeoutMs: options.timeoutMs || 4000 });
  }

  async conductResearch(request = {}) {
    return this.executeBounded(async (signal) => {
      const focusKeyword = request.focusKeyword || request.topicTitle || "Web Development";
      const topicTitle = request.topicTitle || focusKeyword;
      const category = request.contentCategory || "core_web_engineering";

      const prompt = `
        You are a Search Intelligence Analyst evaluating the search landscape for a web engineering topic.
        
        TOPIC TITLE: "${topicTitle}"
        FOCUS KEYWORD: "${focusKeyword}"
        CATEGORY: ${category}
        
        Analyze the current search engine results page (SERP) landscape for this exact technical topic.
        
        Extract:
        1. 3-4 top ranking representative search results (realistic titles, URLs, snippets, and domains like nextjs.org, react.dev, developer.mozilla.org, vercel.com, mdn, stackoverflow, or reputable engineering blogs).
        2. Observed search intent (informational, commercial_investigation, problem_solving, pricing, comparison).
        3. 3-4 recurring questions developers or business owners search for regarding this topic.
        4. Key technical subtopics and recurring terminology.
        
        OUTPUT STRICT JSON ONLY:
        {
          "observedIntent": "informational|commercial_investigation|problem_solving",
          "intentConfidence": 0.85,
          "serpResults": [
            {
              "title": "Representative Search Result Title",
              "url": "https://official-or-reputable-domain.com/path",
              "domain": "official-or-reputable-domain.com",
              "snippet": "Concise search result description snippet focusing on implementation or architecture."
            }
          ],
          "questions": ["Question 1?", "Question 2?", "Question 3?"],
          "recurringThemes": ["Theme 1", "Theme 2", "Theme 3"]
        }
      `;

      const response = await generateGeminiResponse(prompt, {
        temperature: 0.2,
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
        thinkingBudget: 0,
        timeoutMs: Math.min(this.timeoutMs, 4000),
      });

      const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        observedIntent: parsed.observedIntent || "informational",
        intentConfidence: Math.min(1, Math.max(0, Number(parsed.intentConfidence) || 0.8)),
        serpResults: Array.isArray(parsed.serpResults) ? parsed.serpResults.slice(0, 5) : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : [],
        recurringThemes: Array.isArray(parsed.recurringThemes) ? parsed.recurringThemes.slice(0, 6) : [],
      };
    });
  }
}
