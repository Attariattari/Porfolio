const SERVICE_CATALOG = {
  "custom-website-development": {
    title: "Custom Website Development in Lahore",
    description: "Build a responsive, conversion-focused business website around your customers and goals.",
  },
  "mern-stack-web-development": {
    title: "MERN Stack Development",
    description: "Build MongoDB, Express.js, React.js, and Node.js applications with one connected stack.",
  },
  "nextjs-website-development": {
    title: "Next.js Developer in Lahore",
    description: "Create fast, server-rendered React websites with clean routing and SEO foundations.",
  },
  "full-stack-web-app-development": {
    title: "Full-Stack Web App Development",
    description: "Connect frontend, backend, database, authentication, and deployment in one application.",
  },
  "admin-dashboard-development": {
    title: "Admin Dashboard Development",
    description: "Manage content, users, leads, bookings, products, and workflows from one dashboard.",
  },
  "e-commerce-website-development": {
    title: "E-commerce Website Development",
    description: "Plan product discovery, cart, checkout, orders, and store management around real buyers.",
  },
  "portfolio-website-development": {
    title: "Portfolio Website Development",
    description: "Present services, experience, projects, and professional proof through a credible portfolio.",
  },
  "landing-page-design": {
    title: "Landing Page Design",
    description: "Give one campaign or offer a focused message, proof, and conversion journey.",
  },
  "website-redesign": {
    title: "Website Redesign Services",
    description: "Improve navigation, mobile usability, trust, performance, and conversion without careless migration.",
  },
  "api-integration": {
    title: "API Integration Development",
    description: "Connect payments, CRM, email, authentication, storage, analytics, AI, and webhooks reliably.",
  },
  "database-integration": {
    title: "Database Integration Services",
    description: "Structure users, content, products, leads, and operational data for dependable applications.",
  },
  "seo-friendly-website-setup": {
    title: "SEO-Friendly Website Setup",
    description: "Improve crawlability, metadata, canonicals, schema, sitemaps, internal links, and indexing readiness.",
  },
  "website-speed-optimization": {
    title: "Website Speed Optimization",
    description: "Reduce image, JavaScript, rendering, caching, and Core Web Vitals performance problems.",
  },
  "maintenance-support": {
    title: "Website Maintenance & Support",
    description: "Keep websites dependable with fixes, updates, monitoring, reviews, and planned improvements.",
  },
};

export const BLOG_LEGACY_REDIRECTS = {
  "why-we-retired-custom-auth-systems":
    "why-we-stopped-building-our-own-authentication-systems",
  "why-we-finally-sharded-our-database":
    "database-sharding-when-and-why-we-finally-pulled-the-trigger",
  "mongodb-aggregation-real-world-performance":
    "mongodb-aggregation-complex-data-production",
  "how-we-cured-post-merge-panic-devops-automation":
    "deployment-anxiety-devops-automation",
};

export const isLegacyBlogSlug = (slug = "") =>
  Object.prototype.hasOwnProperty.call(BLOG_LEGACY_REDIRECTS, slug);

export const getCanonicalBlogSlug = (slug = "") =>
  BLOG_LEGACY_REDIRECTS[slug] || slug;

const TOPIC_SERVICE_RULES = [
  {
    terms: ["seo", "search", "google", "index", "crawl", "metadata", "core web vital", "performance", "speed"],
    slugs: ["seo-friendly-website-setup", "website-speed-optimization", "nextjs-website-development"],
  },
  {
    terms: ["next.js", "nextjs", "react", "frontend", "server component", "web design", "website"],
    slugs: ["nextjs-website-development", "custom-website-development", "landing-page-design"],
  },
  {
    terms: ["mongodb", "database", "mongoose", "aggregation", "query", "data model"],
    slugs: ["database-integration", "mern-stack-web-development", "full-stack-web-app-development"],
  },
  {
    terms: ["api", "webhook", "integration", "oauth", "authentication", "auth", "payment"],
    slugs: ["api-integration", "full-stack-web-app-development", "database-integration"],
  },
  {
    terms: ["dashboard", "admin", "cms", "analytics", "operations", "workflow"],
    slugs: ["admin-dashboard-development", "database-integration", "full-stack-web-app-development"],
  },
  {
    terms: ["ecommerce", "e-commerce", "store", "checkout", "product catalog", "order"],
    slugs: ["e-commerce-website-development", "api-integration", "admin-dashboard-development"],
  },
  {
    terms: ["portfolio", "freelance", "personal brand", "case study", "designer"],
    slugs: ["portfolio-website-development", "custom-website-development", "landing-page-design"],
  },
  {
    terms: ["redesign", "conversion", "landing page", "user experience", "ux", "interface"],
    slugs: ["website-redesign", "landing-page-design", "custom-website-development"],
  },
  {
    terms: ["devops", "deployment", "cloud", "vercel", "aws", "infrastructure", "monitoring", "security"],
    slugs: ["maintenance-support", "website-speed-optimization", "full-stack-web-app-development"],
  },
  {
    terms: ["ai", "llm", "automation", "gemini", "openai"],
    slugs: ["api-integration", "full-stack-web-app-development", "admin-dashboard-development"],
  },
];

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "because", "before", "being", "between",
  "build", "building", "but", "can", "could", "does", "for", "from", "had", "has", "have",
  "how", "into", "its", "more", "most", "not", "our", "out", "over", "should", "than", "that",
  "the", "their", "then", "there", "these", "they", "this", "through", "using", "very", "was",
  "web", "website", "were", "what", "when", "where", "which", "why", "will", "with", "without",
  "your",
]);

export function stripBlogHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const truncateAtWord = (value = "", maxLength = 155) => {
  const text = stripBlogHtml(value);
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength);
  const boundary = shortened.lastIndexOf(" ");
  const limit = Math.max(1, maxLength - 1);
  const end = boundary > maxLength * 0.7 ? Math.min(boundary, limit) : limit;
  return `${shortened.slice(0, end).trim()}…`;
};

export const getBlogWordCount = (blog = {}) => {
  const content = stripBlogHtml(blog.content || "");
  return content ? content.split(/\s+/).filter(Boolean).length : 0;
};

export const getBlogSeoTitle = (blog = {}) =>
  truncateAtWord(
    String(blog.seoTitle || blog.title || "Muhyo Tech Engineering Insight")
      .replace(/\s*\|\s*Muhyo Tech\s*$/i, "")
      .trim(),
    55,
  );

export const getBlogSeoDescription = (blog = {}) => {
  const preferred = blog.seoDescription || blog.summary;
  if (stripBlogHtml(preferred).length >= 80) return truncateAtWord(preferred, 155);
  return truncateAtWord(blog.content || preferred, 155);
};

export const toIsoBlogDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const getBlogPublishedDate = (blog = {}) =>
  toIsoBlogDate(blog.createdAt || blog.generatedAt || blog.date);

export const getBlogModifiedDate = (blog = {}) =>
  toIsoBlogDate(blog.updatedAt || blog.createdAt || blog.generatedAt || blog.date);

export const isBlogIndexable = (blog = {}) => {
  const status = blog.publishStatus ?? blog.status ?? "published";
  if (status !== "published" || blog.qualityStatus === "failed") return false;
  if (!blog.slug || stripBlogHtml(blog.title).length < 20) return false;
  if (getBlogSeoDescription(blog).length < 70) return false;
  return getBlogWordCount(blog) >= 450;
};

const searchableBlogText = (blog = {}) =>
  [blog.title, blog.summary, blog.category, blog.focusKeyword, ...(blog.tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export function getBlogServiceLinks(blog = {}, limit = 3) {
  const explicit = Array.isArray(blog.relatedServiceSlugs)
    ? blog.relatedServiceSlugs.filter((slug) => SERVICE_CATALOG[slug])
    : [];
  const text = searchableBlogText(blog);
  const scored = TOPIC_SERVICE_RULES.map((rule) => ({
    slugs: rule.slugs,
    score: rule.terms.filter((term) => text.includes(term)).length,
  }))
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score)
    .flatMap((rule) => rule.slugs);
  const fallback = ["custom-website-development", "full-stack-web-app-development", "maintenance-support"];
  const slugs = [...new Set([...explicit, ...scored, ...fallback])].slice(0, limit);

  return slugs.map((slug) => ({
    slug,
    href: `/services/${slug}`,
    ...SERVICE_CATALOG[slug],
  }));
}

const meaningfulTokens = (value = "") =>
  new Set(
    stripBlogHtml(value)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.replace(/^-+|-+$/g, ""))
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );

const tokenSimilarity = (left = "", right = "") => {
  const leftTokens = meaningfulTokens(left);
  const rightTokens = meaningfulTokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 0;
};

const blogTimestamp = (blog = {}) =>
  new Date(blog.createdAt || blog.generatedAt || blog.date || 0).getTime() || 0;

export function getRelatedBlogs(currentBlog = {}, blogs = [], limit = 3) {
  const currentTags = new Set((currentBlog.tags || []).map((tag) => String(tag).toLowerCase()));
  const currentText = searchableBlogText(currentBlog);

  return blogs
    .filter((blog) => blog?.slug && blog.slug !== currentBlog.slug)
    .map((blog) => {
      const sharedTags = (blog.tags || []).filter((tag) => currentTags.has(String(tag).toLowerCase())).length;
      const sameCategory = blog.category && currentBlog.category &&
        String(blog.category).toLowerCase() === String(currentBlog.category).toLowerCase();
      const semanticScore = tokenSimilarity(currentText, searchableBlogText(blog));
      return { blog, score: sharedTags * 4 + Number(sameCategory) * 5 + semanticScore * 8 };
    })
    .sort((a, b) => b.score - a.score || blogTimestamp(b.blog) - blogTimestamp(a.blog))
    .slice(0, limit)
    .map(({ blog }) => blog);
}

export function findNearDuplicateBlog(candidate = {}, blogs = [], threshold = 0.62) {
  const candidateText = searchableBlogText(candidate);
  return blogs.find((blog) => {
    if (!blog || blog.slug === candidate.slug) return false;
    const similarity = tokenSimilarity(candidateText, searchableBlogText(blog));
    const sameFocusKeyword = candidate.focusKeyword && blog.focusKeyword &&
      String(candidate.focusKeyword).toLowerCase() === String(blog.focusKeyword).toLowerCase();
    return sameFocusKeyword || similarity >= threshold;
  });
}
