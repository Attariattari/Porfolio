/**
 * Reverse Service → Blog Index & Authority Engine (Phase 8)
 * 
 * Computes reverse Service → Blog relationships, authority role assignments,
 * topic coverage metrics, missing content gap detection, and orphan detection.
 */

import { evaluateBlogServiceRelevance } from "../blogServiceRelevanceEngine.js";
import { getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";

/**
 * Assigns an authority role to a blog supporting a given service.
 */
export function assignBlogAuthorityRole(blog = {}, service = {}) {
  const text = [blog.title, blog.category, blog.content, blog.primaryTopic].filter(Boolean).join(" ").toLowerCase();

  if (/ultimate guide|complete guide|mastering|everything you need to know|handbook/i.test(text)) {
    return "PILLAR";
  }
  if (/vs|comparison|alternative|which is better|choose/i.test(text)) {
    return "COMPARISON";
  }
  if (/how to fix|error|problem|issue|troubleshoot|bottleneck|why is/i.test(text)) {
    return "PROBLEM";
  }
  if (/how to build|implementation|tutorial|step by step|code|setup/i.test(text)) {
    return "IMPLEMENTATION";
  }
  if (/cost|pricing|roi|why hire|agency|services|buy/i.test(text)) {
    return "COMMERCIAL";
  }
  if (/faq|questions|answers/i.test(text)) {
    return "FAQ";
  }

  return "SUPPORTING";
}

/**
 * Finds all supporting blogs for a target service.
 */
export function getServiceSupportingBlogs(serviceSlug = "", blogs = []) {
  const supporting = [];

  for (const blog of blogs) {
    const rel = evaluateBlogServiceRelevance(blog);
    const isExplicit = Array.isArray(blog.relatedServiceSlugs) && blog.relatedServiceSlugs.includes(serviceSlug);
    const isPrimary = rel.primaryService?.slug === serviceSlug;
    const isSecondary = (rel.secondaryServices || []).some((s) => s.slug === serviceSlug);

    if (isExplicit || isPrimary || (isSecondary && rel.relevanceScore >= 50)) {
      const role = assignBlogAuthorityRole(blog, { slug: serviceSlug });
      supporting.push({
        blogId: blog._id ? blog._id.toString() : blog.slug,
        title: blog.title,
        slug: blog.slug,
        relevanceScore: isExplicit ? 95 : rel.relevanceScore,
        category: rel.category,
        isExplicit,
        isPrimary,
        authorityRole: role,
      });
    }
  }

  return supporting.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calculates topic coverage score (0-100) for a service.
 */
export function evaluateServiceTopicCoverage(serviceSlug = "", blogs = []) {
  const snapshot = getServiceIntelligenceSnapshotSync();
  const service = snapshot.find((s) => s.slug === serviceSlug) || { slug: serviceSlug, title: serviceSlug };
  const supportingBlogs = getServiceSupportingBlogs(serviceSlug, blogs);

  const subTopics = [
    { key: "fundamentals", label: "Core Fundamentals & Overview" },
    { key: "implementation", label: "Technical Implementation & Architecture" },
    { key: "problems", label: "Problem Solving & Troubleshooting" },
    { key: "performance", label: "Performance & Optimization" },
    { key: "commercial", label: "Commercial Value & ROI" },
  ];

  const breakdown = [];
  let coveredCount = 0;

  for (const topic of subTopics) {
    const matchingBlogs = supportingBlogs.filter((b) => {
      const role = b.authorityRole;
      if (topic.key === "fundamentals" && (role === "PILLAR" || role === "SUPPORTING")) return true;
      if (topic.key === "implementation" && role === "IMPLEMENTATION") return true;
      if (topic.key === "problems" && role === "PROBLEM") return true;
      if (topic.key === "commercial" && role === "COMMERCIAL") return true;
      return false;
    });

    let status = "MISSING";
    if (matchingBlogs.length >= 2) {
      status = "COVERED";
      coveredCount += 1;
    } else if (matchingBlogs.length === 1) {
      status = "PARTIALLY_COVERED";
      coveredCount += 0.5;
    }

    breakdown.push({
      topicKey: topic.key,
      label: topic.label,
      status,
      supportingBlogCount: matchingBlogs.length,
    });
  }

  const coverageScore = Math.round((coveredCount / subTopics.length) * 100);

  return {
    serviceSlug,
    serviceTitle: service.title,
    coverageScore,
    totalSupportingBlogs: supportingBlogs.length,
    breakdown,
    supportingBlogs,
  };
}

/**
 * Detects missing topic gaps and returns recommended topic opportunities for the Topic Queue.
 */
export function detectServiceContentGapsAndOpportunities(serviceSlug = "", blogs = [], existingTopicPlans = []) {
  const coverage = evaluateServiceTopicCoverage(serviceSlug, blogs);
  const opportunities = [];

  const existingTitles = new Set([
    ...blogs.map((b) => (b.title || "").toLowerCase()),
    ...existingTopicPlans.map((p) => (p.title || p.topicTitle || "").toLowerCase()),
  ]);

  for (const item of coverage.breakdown) {
    if (item.status === "MISSING" || item.status === "PARTIALLY_COVERED") {
      const proposedTitle = `${coverage.serviceTitle}: ${item.label} Guide`;
      if (!existingTitles.has(proposedTitle.toLowerCase())) {
        opportunities.push({
          suggestedTopic: proposedTitle,
          serviceSlug,
          serviceTitle: coverage.serviceTitle,
          gapCategory: item.topicKey,
          priority: item.status === "MISSING" ? "HIGH" : "MEDIUM",
          reason: `Coverage for '${item.label}' is currently ${item.status}.`,
        });
      }
    }
  }

  return opportunities;
}

/**
 * Detects orphan services (0 supporting blogs) and orphan blogs.
 */
export function detectOrphanServicesAndBlogs(services = [], blogs = []) {
  const catalog = services.length > 0 ? services : getServiceIntelligenceSnapshotSync();
  const orphanServices = [];
  const orphanBlogs = [];

  for (const service of catalog) {
    const supporting = getServiceSupportingBlogs(service.slug, blogs);
    if (supporting.length === 0) {
      orphanServices.push({ slug: service.slug, title: service.title, reason: "Zero supporting blogs found." });
    }
  }

  for (const blog of blogs) {
    const rel = evaluateBlogServiceRelevance(blog);
    if (rel.category === "none" || rel.category === "weak" || rel.relevanceScore < 40) {
      orphanBlogs.push({ slug: blog.slug, title: blog.title, relevanceScore: rel.relevanceScore, category: rel.category });
    }
  }

  return {
    orphanServices,
    orphanBlogs,
  };
}
