import { generateGeminiResponse } from "@/lib/geminiService";
import { sanitizeTopicTitle } from "./titleSanitizer";

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

function parseTopicsSafe(raw) {
  const cleaned = String(raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed?.topics)) return parsed.topics;
  } catch (err) {
    const matches = cleaned.match(/\{\s*"title"[\s\S]*?"contentCategory"[\s\S]*?"focusKeyword"[\s\S]*?\}/g);
    if (matches && matches.length > 0) {
      const recovered = [];
      for (const m of matches) {
        try {
          const item = JSON.parse(m);
          if (item?.title && item?.contentCategory) recovered.push(item);
        } catch {}
      }
      if (recovered.length > 0) return recovered;
    }
    throw err;
  }
  return [];
}

export async function generateAuthorityCandidates({ count = 14, avoid = "", coverage = {} } = {}) {
  const categoryBrief = AUTHORITY_CATEGORY_KEYS.map((key) => {
    const config = CONTENT_CATEGORIES[key];
    return `- ${key}: ${config.label}; rolling target ${config.targetPercent}%; current coverage ${Number(coverage[key] || 0)}%.`;
  }).join("\n");
  const raw = await generateGeminiResponse(`Create ${count + 2} candidate standalone authority article plans for Muhyo Tech, a professional web engineering and digital services brand.

These are NOT Core Web Engineering clusters. Every accepted plan becomes exactly one complete, deeply useful authority guide with no supporting children.

AUDIENCE SPLIT & CLIENT ACQUISITION MANDATE:
- Target 70% Business Decision-Makers & Founders (Small Business Owners, Startup Founders, E-Commerce Operators, Service Contractors) facing real digital bottlenecks, and 30% Senior Technical Leaders (CTOs, Tech Leads).
- Connect technical depth directly to business ROI, client conversion, operational reliability, and Muhyo Tech digital services.

SUPPORTED INDUSTRIES TO ROTATE ACROSS:
ai_saas_tools, home_services_contractors, edtech_coaching, legal_tech, b2b_wholesale, ecommerce, real_estate, healthcare, seo_digital_marketing, developer_portfolios, student_fyps, beauty_wellness, fitness_gyms, automotive, travel_tourism, education, hospitality, restaurants, professional_services, logistics, finance, saas, startups, local_business, general_technology.

ALLOWED SERVICES FOR SERVICE INTENT:
custom-website-development, mern-stack-web-development, nextjs-website-development, full-stack-web-app-development, admin-dashboard-development, e-commerce-website-development, portfolio-website-development, landing-page-design, website-redesign, api-integration, database-integration, seo-friendly-website-setup, website-speed-optimization, maintenance-support.

CATEGORIES:
${categoryBrief}

DYNAMIC HEADLINE CRAFTING MANDATE:
- CONTEXT-DRIVEN TITLES: Every title MUST be dynamically engineered to reflect the exact technical problem, technology stack, industry context, and real-world business outcome.
- NO ROBOTIC TEMPLATES OR FIXED FORMULAS: Write organic, authentic, high-impact headlines just like top engineering & business publications write.
- STRICTLY FORBIDDEN STOCK OPENERS: NEVER start titles with repetitive stock prefixes like "Beyond...", "Beyond the...", "Engineering for...", "Engineering [Topic]...", "Architecting for...", "Architecting...", "Mastering...", "AI in...", "AI's Role in...", "An Engineering Guide to...", "The Complete Guide to...", or "A Deep Dive into...".
- Focus the headline on the actual technical mechanism, business bottleneck, trade-off, or practical commercial outcome.

CRITICAL FIELD CONSTRAINTS (MANDATORY FOR VALID JSON):
- "problem": 1-2 clear, specific sentences defining the technical/business problem (max 30 words).
- "solutionAngle": 1-2 concise sentences outlining the decision or solution (max 30 words).
- "businessValue": 1 concise sentence describing the practical business value (max 20 words).
- Keep each plan compact and punchy.

Every candidate must have a concrete problem, a distinct solution/decision angle, practical value, and truthful language. Scores are 0-100 assessments; do not inflate weak ideas. Only candidates whose weighted professional score should genuinely reach 70 may be returned.

EXISTING OR QUEUED CONTENT TO AVOID:
${avoid || "None supplied."}

Return strict JSON only:
{"topics":[{"title":"","contentCategory":"software_architecture","topicFamily":"","pillar":"","subtopic":"","problem":"","solutionAngle":"","businessValue":"","audience":"Business owners and technical founders","audienceProfile":{"type":"business_owner|founder|cto","label":"Small Business Owner | Founder | CTO"},"industry":{"key":"ecommerce","label":"E-Commerce"} or null,"businessProblem":{"key":"cart_abandonment","label":"High Checkout Abandonment"} or null,"solutionType":"custom_web_app|architecture_decision|framework","serviceIntent":{"relevant":true,"serviceKey":"e-commerce-website-development","confidence":0.85},"geoContext":{"type":"global"},"focusKeyword":"","searchIntent":"commercial|informational|transactional","format":"Decision framework","relatedServiceSlugs":["e-commerce-website-development"],"priority":75,"selectionReason":"","audienceRelevance":80,"practicalUsefulness":80,"expertiseFit":80,"searchOpportunity":75,"originalAngle":75,"coverageNeed":70,"serviceConnection":80}]}`,
  { temperature: 0.65, responseMimeType: "application/json", maxOutputTokens: 8000, thinkingBudget: 0, timeoutMs: 35000 });
  const topics = parseTopicsSafe(raw);
  return topics
    .filter((topic) => AUTHORITY_CATEGORY_KEYS.includes(topic.contentCategory))
    .map((topic) => ({ ...topic, title: sanitizeTopicTitle(topic.title, topic) }))
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
