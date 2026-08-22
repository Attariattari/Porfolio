/**
 * Dynamic Cluster Depth & Cluster Health Replacement Planner
 * 
 * Replaces rigid fixed cluster sizes (Pillar = 2 supporting) with dynamic depth calculation (0 to 8+).
 * Evaluates cluster health after failures/rejections and safely generates replacement supporting topics.
 */

import { generateGeminiResponse } from "../../geminiService.js";

const normalize = (val = "") => String(val).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();

export function calculateDynamicClusterDepth(topic = {}) {
  // Standalone authority, verified trend, or simple technical articles get 0 depth
  if (topic.articleType === "standalone_authority" || topic.articleType === "verified_trend" || topic.topicType === "standalone_authority") {
    return 0;
  }

  let depth = 2; // Baseline

  const text = [topic.title, topic.subtopic, topic.problem, topic.businessProblem, topic.focusKeyword]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Factors that expand cluster depth
  if (topic.topicType === "commercial_pillar" || topic.topicType === "industry_pillar") {
    depth += 3;
  }
  if (topic.industry && topic.industry !== "general_technology") {
    depth += 2;
  }
  if (topic.serviceSlug || topic.serviceRelevance > 0.6) {
    depth += 1;
  }
  if (/production|enterprise|architecture|scaling|security|migration|full-stack/i.test(text)) {
    depth += 1;
  }

  // Upper bound safety cap (Max 8 supporting articles per cluster)
  return Math.min(8, Math.max(0, depth));
}

export function evaluateClusterHealth(clusterKey = "", clusterTopics = [], clusterBlogs = []) {
  if (!clusterKey) return { healthScore: 0, status: "empty" };

  const planned = clusterTopics.filter((t) => t.status === "planned" || t.status === "ready").length;
  const processing = clusterTopics.filter((t) => t.status === "processing").length;
  const used = clusterTopics.filter((t) => t.status === "used").length;
  const failed = clusterTopics.filter((t) => t.status === "failed" || t.status === "rejected").length;
  const publishedBlogs = clusterBlogs.length;

  const totalAttempted = clusterTopics.length;
  const successRate = totalAttempted > 0 ? (used / totalAttempted) : 0;

  let healthScore = Math.round(successRate * 100);
  if (failed > 0 && planned === 0 && used === 0) healthScore = 20;

  return {
    clusterKey,
    planned,
    processing,
    used,
    failed,
    publishedBlogs,
    healthScore,
    needsReplacement: failed > 0 && used < 2,
  };
}

export async function generateReplacementSupportingTopic({ pillar = {}, failedTopic = {}, existingTopics = [] }) {
  const avoid = existingTopics.map((t) => `${t.title} | ${t.focusKeyword || ""}`).join("\n");
  
  const prompt = `A supporting topic in the content cluster "${pillar.title}" failed generation or was duplicate-blocked.
  
PILLAR CONTEXT:
Title: ${pillar.title}
Pillar Category: ${pillar.pillar || pillar.contentCategory}
Problem: ${pillar.problem}
Avoid existing topics:
${avoid || "None"}

Generate EXACTLY ONE replacement supporting topic that covers a distinct, practical engineering or business subproblem for this cluster.

Return strict JSON only:
{
  "title": "Clear actionable supporting guide title",
  "pillar": "${pillar.pillar || "Web Development"}",
  "subtopic": "specific subtopic",
  "problem": "specific practical problem",
  "solutionAngle": "engineering or business solution angle",
  "businessValue": "concrete value",
  "audience": "Founders and developers",
  "focusKeyword": "unique focus keyword",
  "searchIntent": "informational",
  "format": "Focused supporting guide",
  "priority": 65
}`;

  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.6,
      responseMimeType: "application/json",
      maxOutputTokens: 2000,
      thinkingBudget: 0,
      timeoutMs: 25000,
    });

    const parsed = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
    if (!parsed.title || !parsed.focusKeyword || !parsed.problem) return null;

    return {
      ...parsed,
      articleType: "supporting",
      clusterKey: pillar.clusterKey,
      clusterTitle: pillar.clusterTitle || pillar.title,
      parentTopicId: pillar._id,
      status: "ready",
      replacementForId: failedTopic._id || null,
    };
  } catch (error) {
    console.warn("[ClusterPlanner] Replacement supporting generation fallback:", error.message);
    return null;
  }
}
