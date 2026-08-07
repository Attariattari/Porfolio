import { generateGeminiResponse } from "@/lib/geminiService";

export const CONTENT_CATEGORIES = Object.freeze({
  core_web_engineering: { label: "Core Web Engineering", targetPercent: 30, articleType: "cluster" },
  software_architecture: { label: "Software Architecture", targetPercent: 15, articleType: "standalone_authority" },
  saas_product_engineering: { label: "SaaS & Product Engineering", targetPercent: 15, articleType: "standalone_authority" },
  cloud_devops_reliability: { label: "Cloud, DevOps & Reliability", targetPercent: 10, articleType: "standalone_authority" },
  ai_software_development: { label: "AI for Software Development", targetPercent: 10, articleType: "standalone_authority" },
  technical_seo_growth: { label: "Technical SEO & Web Growth", targetPercent: 8, articleType: "standalone_authority" },
  uiux_accessibility: { label: "UI/UX & Accessibility", targetPercent: 7, articleType: "standalone_authority" },
  verified_trend: { label: "Verified Technology Trends", targetPercent: 5, articleType: "verified_trend" },
});

export const AUTHORITY_CATEGORY_KEYS = Object.freeze(
  Object.keys(CONTENT_CATEGORIES).filter((key) => CONTENT_CATEGORIES[key].articleType === "standalone_authority"),
);

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export function scoreProfessionalTopic(candidate = {}, coverageBoost = 0) {
  const breakdown = {
    audienceRelevance: clamp(candidate.audienceRelevance),
    practicalUsefulness: clamp(candidate.practicalUsefulness),
    expertiseFit: clamp(candidate.expertiseFit),
    searchOpportunity: clamp(candidate.searchOpportunity),
    originalAngle: clamp(candidate.originalAngle),
    coverageNeed: clamp(candidate.coverageNeed ?? coverageBoost),
    serviceConnection: clamp(candidate.serviceConnection),
  };
  const score = Math.round(
    breakdown.audienceRelevance * 0.25 +
    breakdown.practicalUsefulness * 0.20 +
    breakdown.expertiseFit * 0.20 +
    breakdown.searchOpportunity * 0.15 +
    breakdown.originalAngle * 0.10 +
    breakdown.coverageNeed * 0.05 +
    breakdown.serviceConnection * 0.05,
  );
  return { score, breakdown };
}

export async function generateAuthorityCandidates({ count = 14, avoid = "", coverage = {} } = {}) {
  const categoryBrief = AUTHORITY_CATEGORY_KEYS.map((key) => {
    const config = CONTENT_CATEGORIES[key];
    return `- ${key}: ${config.label}; rolling target ${config.targetPercent}%; current coverage ${Number(coverage[key] || 0)}%.`;
  }).join("\n");
  const raw = await generateGeminiResponse(`Create ${count + 2} candidate standalone authority article plans for Muhyo Tech, a professional web engineering and software brand.

These are NOT Core Web Engineering clusters. Every accepted plan becomes exactly one complete, deeply useful authority article with no supporting children.

CATEGORIES:
${categoryBrief}

Choose professional topics for founders, developers, product teams and technical decision-makers. Prefer real engineering or business decisions, production problems, trade-offs and implementation guidance. Rotate categories, audiences and formats. Reject gadget news, rumours, crypto speculation, generic AI hype, consumer troubleshooting, clickbait, unsupported predictions and topics without a credible connection to Muhyo Tech's expertise.

Every candidate must have a concrete problem, a distinct solution/decision angle, practical value, and truthful language without guaranteed outcomes or invented statistics. Scores are 0-100 assessments; do not inflate weak ideas. Only candidates whose weighted professional score should genuinely reach 70 may be returned.

EXISTING OR QUEUED CONTENT TO AVOID:
${avoid || "None supplied."}

Return strict JSON only:
{"topics":[{"title":"","contentCategory":"software_architecture","topicFamily":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"","focusKeyword":"","searchIntent":"informational","format":"Decision framework","relatedServiceSlugs":[],"priority":70,"selectionReason":"","audienceRelevance":0,"practicalUsefulness":0,"expertiseFit":0,"searchOpportunity":0,"originalAngle":0,"coverageNeed":0,"serviceConnection":0}]}`,
  { temperature: 0.6, responseMimeType: "application/json", maxOutputTokens: 8000, thinkingBudget: 0, timeoutMs: 60000 });
  const parsed = JSON.parse(String(raw).replace(/```json/gi, "").replace(/```/g, "").trim());
  return (Array.isArray(parsed.topics) ? parsed.topics : [])
    .filter((topic) => AUTHORITY_CATEGORY_KEYS.includes(topic.contentCategory))
    .map((topic) => ({ ...topic, ...scoreProfessionalTopic(topic, 0) }))
    .filter((topic) => topic.score >= 70)
    .slice(0, count);
}

export function getRollingCategoryCoverage(blogs = []) {
  const counts = Object.fromEntries(Object.keys(CONTENT_CATEGORIES).map((key) => [key, 0]));
  for (const blog of blogs) {
    const category = blog.contentCategory || (blog.articleType === "pillar" || blog.articleType === "supporting" ? "core_web_engineering" : null);
    if (category && Object.hasOwn(counts, category)) counts[category] += 1;
  }
  const total = Math.max(1, Object.values(counts).reduce((sum, value) => sum + value, 0));
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, Math.round((value / total) * 100)]));
}

export function categoryDeficit(contentCategory, coverage = {}) {
  const target = CONTENT_CATEGORIES[contentCategory]?.targetPercent || 0;
  return target - Number(coverage[contentCategory] || 0);
}
