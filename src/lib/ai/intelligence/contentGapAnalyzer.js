/**
 * Content Gap Analyzer & Post-Publication Pillar Expansion Engine
 * 
 * Inspects existing published Blog records and queued BlogTopicPlan items to identify:
 * 1. Content gaps (missing subtopics, weakly covered categories, orphan pillars).
 * 2. Post-publication expansion opportunities for established published Pillars.
 */

import { generateGeminiResponse } from "../../geminiService.js";

const normalize = (val = "") => String(val).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();

export function analyzeContentGaps({ blogs = [], topicPlans = [] } = {}) {
  const categoryCounts = {};
  const pillarClusters = new Set();
  const supportingByCluster = {};

  for (const blog of blogs) {
    const cat = blog.contentCategory || "core_web_engineering";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    if (blog.clusterKey) {
      if (blog.articleType === "pillar") pillarClusters.add(blog.clusterKey);
      else if (blog.articleType === "supporting") {
        supportingByCluster[blog.clusterKey] = (supportingByCluster[blog.clusterKey] || 0) + 1;
      }
    }
  }

  // Identify Orphan Pillars (Pillars with 0 published supporting content)
  const orphanPillars = [];
  for (const clusterKey of pillarClusters) {
    if (!supportingByCluster[clusterKey] || supportingByCluster[clusterKey] === 0) {
      const pillarBlog = blogs.find((b) => b.clusterKey === clusterKey && b.articleType === "pillar");
      if (pillarBlog) {
        orphanPillars.push({
          pillarBlogId: pillarBlog._id,
          clusterKey,
          title: pillarBlog.title,
        });
      }
    }
  }

  // Identify Expansion Candidates (Pillars with >= 2 supporting that have potential for 2+ more)
  const expansionCandidates = [];
  for (const clusterKey of pillarClusters) {
    const count = supportingByCluster[clusterKey] || 0;
    if (count >= 1 && count < 6) {
      const pillarBlog = blogs.find((b) => b.clusterKey === clusterKey && b.articleType === "pillar");
      if (pillarBlog) {
        expansionCandidates.push({
          pillarBlogId: pillarBlog._id,
          clusterKey,
          title: pillarBlog.title,
          currentSupportingCount: count,
        });
      }
    }
  }

  return {
    totalBlogsAnalyzed: blogs.length,
    categoryDistribution: categoryCounts,
    orphanPillars,
    expansionCandidates,
  };
}

export async function evaluatePillarExpansion({ pillarBlog = {}, existingChildren = [] } = {}) {
  if (!pillarBlog || !pillarBlog.title) return { eligible: false, reason: "Invalid pillar blog supplied." };

  const avoidText = existingChildren.map((child) => `${child.title} | ${child.focusKeyword || ""}`).join("\n");

  const prompt = `Assess this published engineering pillar article for topical expansion:
PILLAR: ${pillarBlog.title}
SUMMARY: ${pillarBlog.summary || ""}
CATEGORY: ${pillarBlog.category || pillarBlog.contentCategory}
EXISTING SUPPORTING ARTICLES:
${avoidText || "None"}

Has industry technology, production best-practice, security, performance, or business intent evolved to warrant 1 to 2 NEW unique supporting topics for this established pillar?

Return strict JSON only:
{
  "eligible": true,
  "reason": "Clear strategic reason for expanding this pillar",
  "proposedTopics": [
    {
      "title": "New practical supporting guide title",
      "subtopic": "specific subtopic",
      "problem": "new production or business problem",
      "solutionAngle": "practical solution",
      "businessValue": "concrete value",
      "audience": "Founders and developers",
      "focusKeyword": "unique focus keyword",
      "searchIntent": "informational",
      "format": "Focused supporting guide",
      "priority": 70
    }
  ]
}`;

  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.6,
      responseMimeType: "application/json",
      maxOutputTokens: 3000,
      thinkingBudget: 0,
      timeoutMs: 30000,
    });

    const parsed = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
    if (!parsed.eligible || !Array.isArray(parsed.proposedTopics) || !parsed.proposedTopics.length) {
      return { eligible: false, reason: parsed.reason || "No new expansion topics required." };
    }

    const validTopics = parsed.proposedTopics
      .filter((t) => t.title && t.focusKeyword && t.problem)
      .map((t, idx) => ({
        ...t,
        articleType: "supporting",
        contentCategory: pillarBlog.contentCategory || "core_web_engineering",
        clusterKey: pillarBlog.clusterKey,
        clusterTitle: pillarBlog.title,
        clusterOrder: existingChildren.length + idx + 1,
        parentTopicId: pillarBlog.topicPlanId || null,
        parentPillarBlogId: pillarBlog._id,
        status: "ready",
        clusterStrategy: "expansion",
        expansionEligible: true,
        expansionReason: parsed.reason,
      }));

    return {
      eligible: true,
      reason: parsed.reason,
      topics: validTopics,
    };
  } catch (error) {
    console.warn("[ContentGap] Pillar expansion evaluation fallback:", error.message);
    return { eligible: false, reason: `Evaluation failed: ${error.message}` };
  }
}
