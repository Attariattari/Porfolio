/**
 * Topical Authority Graph Engine
 * 
 * Builds a graph representation of Muhyo Tech's content hierarchy:
 * Services -> Industries -> Pillars -> Supporting Topics -> Technical Details.
 * 
 * Identifies coverage gaps, orphan pages, weak clusters, and missing internal links.
 */

import { INDUSTRY_TAXONOMY, ALLOWED_SERVICES } from "../intelligence/industryTaxonomy.js";

export function buildTopicalAuthorityGraph({ blogs = [], topicPlans = [] } = {}) {
  const categoryNodes = {};
  const industryNodes = {};
  const serviceNodes = {};
  const clusterNodes = {};
  const orphanPages = [];
  const internalLinkGaps = [];

  // Initialize Category Nodes
  const categories = [
    "core_web_engineering",
    "software_architecture",
    "saas_product_engineering",
    "cloud_devops_reliability",
    "ai_software_development",
    "technical_seo_growth",
    "uiux_accessibility",
    "verified_trend",
  ];
  categories.forEach((cat) => {
    categoryNodes[cat] = { key: cat, count: 0, percentage: 0 };
  });

  // Initialize Industry Nodes
  Object.keys(INDUSTRY_TAXONOMY).forEach((ind) => {
    industryNodes[ind] = { key: ind, count: 0 };
  });

  // Initialize Service Nodes
  Object.keys(ALLOWED_SERVICES).forEach((srv) => {
    serviceNodes[srv] = { key: srv, linkedBlogsCount: 0 };
  });

  // Process Published Blogs
  for (const blog of blogs) {
    const cat = blog.contentCategory || "core_web_engineering";
    if (categoryNodes[cat]) categoryNodes[cat].count++;

    const ind = blog.industry || "general_technology";
    if (industryNodes[ind]) industryNodes[ind].count++;

    if (Array.isArray(blog.relatedServiceSlugs)) {
      blog.relatedServiceSlugs.forEach((slug) => {
        if (serviceNodes[slug]) serviceNodes[slug].linkedBlogsCount++;
      });
    }

    if (blog.clusterKey) {
      if (!clusterNodes[blog.clusterKey]) {
        clusterNodes[blog.clusterKey] = {
          clusterKey: blog.clusterKey,
          pillarId: null,
          pillarTitle: null,
          supportingCount: 0,
          blogs: [],
        };
      }
      if (blog.articleType === "pillar") {
        clusterNodes[blog.clusterKey].pillarId = blog._id;
        clusterNodes[blog.clusterKey].pillarTitle = blog.title;
      } else {
        clusterNodes[blog.clusterKey].supportingCount++;
      }
      clusterNodes[blog.clusterKey].blogs.push(blog._id);
    } else {
      // Blog has no cluster key -> check if orphan
      if (blog.articleType !== "standalone_authority" && blog.articleType !== "verified_trend") {
        orphanPages.push({ id: blog._id, title: blog.title, slug: blog.slug });
      }
    }

    // Check internal link gaps
    if (!blog.content || !/href=["']\/blog\//i.test(blog.content)) {
      internalLinkGaps.push({ id: blog._id, title: blog.title, slug: blog.slug });
    }
  }

  // Calculate percentages
  const totalBlogs = Math.max(1, blogs.length);
  Object.keys(categoryNodes).forEach((cat) => {
    categoryNodes[cat].percentage = Math.round((categoryNodes[cat].count / totalBlogs) * 100);
  });

  // Find Weak Clusters (Pillar exists but 0 supporting)
  const weakClusters = Object.values(clusterNodes).filter(
    (c) => c.pillarId && c.supportingCount === 0
  );

  // Find Unlinked Services
  const unlinkedServices = Object.values(serviceNodes).filter((s) => s.linkedBlogsCount === 0);

  return {
    totalBlogsAnalyzed: blogs.length,
    categoryNodes,
    industryNodes,
    serviceNodes,
    clusterNodesCount: Object.keys(clusterNodes).length,
    orphanPages,
    weakClusters,
    unlinkedServices,
    internalLinkGaps,
    timestamp: new Date().toISOString(),
  };
}
