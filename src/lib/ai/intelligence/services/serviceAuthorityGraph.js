/**
 * Service Topic Authority Graph & Scoring Engine
 * 
 * Computes a normalized Service Authority Score (0-100) across 6 weighted pillars:
 * 1. Topic Coverage Score (30%)
 * 2. Content Depth Score (20%)
 * 3. Internal Links Score (20%)
 * 4. Commercial Coverage Score (15%)
 * 5. SERP Signal Coverage (15%)
 * 
 * Identifies covered vs missing topics per service and generates Content Gap Recommendations.
 */

import { getAllServiceKnowledgeProfiles, getServiceKnowledgeProfile } from "./serviceKnowledgeBase.js";

const EXPECTED_TOPIC_CLUSTERS = {
  "nextjs-website-development": [
    "Next.js App Router Architecture",
    "Next.js vs React for Business",
    "Next.js Core Web Vitals Performance",
    "Next.js SEO & Metadata Engineering",
    "Next.js Server Components vs Client Components",
    "Next.js Deployment & ISR Caching",
    "When to Hire a Next.js Developer"
  ],
  "mern-stack-web-development": [
    "MERN Stack Application Architecture",
    "MongoDB Schema Design for SaaS",
    "Express.js & Node.js REST API Best Practices",
    "React State Management & Performance",
    "MERN Stack Authentication & Security",
    "MERN Stack vs Traditional CMS"
  ],
  "custom-website-development": [
    "Custom Website vs Template Builders",
    "Business Website Lead Conversion Architecture",
    "Mobile Responsive Design Principles",
    "Website Security & Maintenance Essentials"
  ],
  "website-speed-optimization": [
    "Core Web Vitals Optimization Guide",
    "Reducing Next.js JavaScript Bundle Size",
    "Image Compression & Responsive Delivery",
    "Caching Strategies for High-Traffic Sites"
  ]
};

const DEFAULT_EXPECTED_TOPICS = [
  "Comprehensive Architecture Guide",
  "Business Cost & Scope Evaluation",
  "Performance & Speed Best Practices",
  "Security & Integration Considerations",
  "When to Hire Professional Engineers"
];

/**
 * Calculates the Service Authority Metrics and overall score (0-100) for a service.
 * 
 * @param {string} serviceSlug - Canonical service slug
 * @param {Array<Object>} [blogsPool=[]] - Array of blog documents
 * @returns {Object} Service Authority Score Breakdown & Content Gap Suggestions
 */
export function calculateServiceAuthorityScore(serviceSlug = "", blogsPool = []) {
  const profile = getServiceKnowledgeProfile(serviceSlug);
  if (!profile) {
    return {
      serviceSlug,
      overallAuthorityScore: 50,
      breakdown: { topicCoverageScore: 50, contentDepthScore: 50, internalLinksScore: 50, commercialCoverageScore: 50, serpCoverageScore: 50 },
      suggestedTopics: []
    };
  }

  const expectedTopics = EXPECTED_TOPIC_CLUSTERS[serviceSlug] || DEFAULT_EXPECTED_TOPICS;

  // Filter blogs linked to this service
  const relatedBlogs = blogsPool.filter((blog) => {
    const slugs = Array.isArray(blog.relatedServiceSlugs) ? blog.relatedServiceSlugs : [];
    if (slugs.includes(serviceSlug)) return true;
    const text = `${blog.title || ""} ${blog.summary || ""} ${blog.focusKeyword || ""}`.toLowerCase();
    return text.includes(serviceSlug.replace(/-/g, " ")) || text.includes(profile.title.toLowerCase());
  });

  // 1. Topic Coverage Score (30%)
  const coveredTopics = [];
  const missingTopics = [];

  for (const expectedTopic of expectedTopics) {
    const expectedTokens = expectedTopic.toLowerCase().split(" ").filter((w) => w.length > 3);
    const isCovered = relatedBlogs.some((blog) => {
      const blogText = `${blog.title || ""} ${blog.focusKeyword || ""}`.toLowerCase();
      return expectedTokens.some((token) => blogText.includes(token));
    });

    if (isCovered) {
      coveredTopics.push(expectedTopic);
    } else {
      missingTopics.push(expectedTopic);
    }
  }

  const topicCoverageRatio = expectedTopics.length > 0 ? coveredTopics.length / expectedTopics.length : 0.5;
  const topicCoverageScore = Math.min(100, Math.max(20, Math.round(topicCoverageRatio * 100)));

  // 2. Content Depth Score (20%)
  const totalWordCount = relatedBlogs.reduce((sum, blog) => {
    const content = String(blog.content || blog.summary || "");
    const words = content.split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);
  const avgWordCount = relatedBlogs.length > 0 ? totalWordCount / relatedBlogs.length : 0;
  const contentDepthScore = Math.min(100, Math.max(30, Math.round((avgWordCount / 1200) * 80)));

  // 3. Internal Links Score (20%)
  const blogsWithLinks = relatedBlogs.filter((blog) =>
    Array.isArray(blog.relatedServiceSlugs) && blog.relatedServiceSlugs.includes(serviceSlug)
  ).length;
  const internalLinkRatio = relatedBlogs.length > 0 ? blogsWithLinks / relatedBlogs.length : 0.5;
  const internalLinksScore = Math.min(100, Math.max(40, Math.round(internalLinkRatio * 100)));

  // 4. Commercial Coverage Score (15%)
  const commercialCount = relatedBlogs.filter((b) =>
    ["commercial", "pricing", "transactional"].includes(b.searchIntent || b.intent)
  ).length;
  const commercialRatio = relatedBlogs.length > 0 ? commercialCount / relatedBlogs.length : 0.3;
  const commercialCoverageScore = Math.min(100, Math.max(30, Math.round(commercialRatio * 150)));

  // 5. SERP Signal Coverage (15%)
  const serpCoverageScore = relatedBlogs.length >= 3 ? 85 : 60;

  // Weighted Overall Score
  const overallAuthorityScore = Math.round(
    topicCoverageScore * 0.30 +
    contentDepthScore * 0.20 +
    internalLinksScore * 0.20 +
    commercialCoverageScore * 0.15 +
    serpCoverageScore * 0.15
  );

  const suggestedTopics = missingTopics.map((title, idx) => ({
    title: `${profile.title}: ${title}`,
    intent: idx % 2 === 0 ? "commercial" : "informational",
    priority: Math.max(60, 90 - idx * 5),
    reason: `Missing topic cluster item for service '${profile.title}' authority graph.`
  }));

  return {
    serviceSlug,
    serviceTitle: profile.title,
    overallAuthorityScore: Math.min(100, Math.max(0, overallAuthorityScore)),
    breakdown: {
      topicCoverageScore,
      contentDepthScore,
      internalLinksScore,
      commercialCoverageScore,
      serpCoverageScore
    },
    coveredTopicCount: coveredTopics.length,
    missingTopicCount: missingTopics.length,
    coveredTopics,
    missingTopics,
    suggestedTopics,
    lastEvaluatedAt: new Date().toISOString()
  };
}

/**
 * Calculates Authority Scores for all 14 canonical services.
 */
export function calculateAllServiceAuthorityScores(blogsPool = []) {
  const profiles = getAllServiceKnowledgeProfiles();
  return profiles.map((p) => calculateServiceAuthorityScore(p.slug, blogsPool));
}
