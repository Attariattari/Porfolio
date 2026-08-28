/**
 * Industry Taxonomy & Commercial Service Relevance Engine
 * 
 * Maps topic candidates to legitimate business industries and Muhyo Tech digital services.
 * Prevents arbitrary industry matching (e.g. "React for Salons") while accurately surfacing 
 * commercial opportunities (e.g. "Custom E-commerce Website Cost" -> "custom-ecommerce-development").
 */

export const INDUSTRY_TAXONOMY = Object.freeze({
  "ai_saas_tools": { label: "AI SaaS & Micro-SaaS Platforms", keywords: [/ai saas/i, /micro-?saas/i, /ai tool/i, /ai app/i, /rag/i, /llm integration/i, /openai api/i, /gemini api/i, /ai wrapper/i, /ai assistant/i] },
  "home_services_contractors": { label: "Home Services & Contractors", keywords: [/contractor/i, /solar/i, /roofing/i, /hvac/i, /plumbing/i, /construction/i, /remodeling/i, /instant quote/i, /cost calculator/i] },
  "edtech_coaching": { label: "EdTech & Online Course Platforms", keywords: [/course portal/i, /lms platform/i, /coaching/i, /online academy/i, /video course/i, /tutor/i, /learning management/i] },
  "legal_tech": { label: "Law Firms & Legal Tech", keywords: [/law firm/i, /legal/i, /lawyer/i, /attorney/i, /client intake/i, /case management/i, /legal tech/i] },
  "b2b_wholesale": { label: "B2B Wholesale & Inventory Portals", keywords: [/b2b wholesale/i, /bulk ordering/i, /wholesale portal/i, /distributor/i, /supplier/i, /inventory dashboard/i, /invoice automation/i] },
  "ecommerce": { label: "E-Commerce", keywords: [/e-?commerce/i, /online store/i, /shopping cart/i, /checkout/i, /retail/i, /fashion/i] },
  "real_estate": { label: "Real Estate", keywords: [/real estate/i, /property/i, /realtor/i, /mls/i, /listing/i] },
  "healthcare": { label: "Healthcare", keywords: [/health/i, /medical/i, /telehealth/i, /hipaa/i, /clinic/i, /patient/i] },
  "seo_digital_marketing": { label: "SEO & Digital Marketing Agencies", keywords: [/seo/i, /search engine optimization/i, /technical seo/i, /digital marketing/i, /serp/i, /link building/i, /organic traffic/i, /keyword research/i, /google ranking/i] },
  "developer_portfolios": { label: "Developer & Career Portfolios", keywords: [/portfolio/i, /developer portfolio/i, /resume website/i, /engineer portfolio/i, /designer portfolio/i, /portfolio website/i, /personal branding/i] },
  "student_fyps": { label: "Academic Projects & BSCS FYP", keywords: [/final year project/i, /fyp/i, /capstone/i, /bscs/i, /student project/i, /semester project/i, /university project/i, /academic project/i] },
  "beauty_wellness": { label: "Beauty, Salons & Wellness", keywords: [/salon/i, /spa/i, /beauty/i, /skincare/i, /barber/i, /wellness/i, /hair salon/i, /nail salon/i, /esthetician/i, /appointment booking/i] },
  "fitness_gyms": { label: "Fitness & Gyms", keywords: [/gym/i, /fitness/i, /workout/i, /personal trainer/i, /crossfit/i, /membership portal/i, /yoga studio/i] },
  "automotive": { label: "Automotive & Dealerships", keywords: [/automotive/i, /dealership/i, /car rental/i, /vehicle inventory/i, /auto repair/i, /auto parts/i] },
  "travel_tourism": { label: "Travel & Tourism", keywords: [/travel/i, /tourism/i, /tour operator/i, /flight booking/i, /vacation/i, /tour guide/i, /travel agency/i] },
  "education": { label: "Education", keywords: [/education/i, /edtech/i, /lms/i, /e-learning/i, /course/i, /student/i] },
  "hospitality": { label: "Hospitality", keywords: [/hospitality/i, /hotel/i, /resort/i, /booking engine/i, /lodging/i] },
  "restaurants": { label: "Restaurants & Dining", keywords: [/restaurant/i, /dining/i, /food delivery/i, /menu/i, /catering/i] },
  "professional_services": { label: "Professional Services", keywords: [/agency/i, /consulting/i, /law firm/i, /accounting/i, /b2b services/i] },
  "logistics": { label: "Logistics & Supply Chain", keywords: [/logistics/i, /supply chain/i, /fleet/i, /inventory/i, /tracking/i, /shipping/i] },
  "finance": { label: "Fintech & Financial Services", keywords: [/fintech/i, /finance/i, /payment/i, /banking/i, /stripe/i, /invoice/i] },
  "saas": { label: "SaaS", keywords: [/saas/i, /subscription/i, /multi-tenant/i, /b2b software/i, /cloud platform/i] },
  "startups": { label: "Startups & Emerging Tech", keywords: [/startup/i, /mvp/i, /venture/i, /early stage/i, /bootstrap/i] },
  "local_business": { label: "Local Business", keywords: [/local business/i, /storefront/i, /brick and mortar/i, /local service/i] },
  "general_technology": { label: "Core Software & Web Engineering", keywords: [/web development/i, /software/i, /next\.js/i, /react/i, /node\.js/i, /mongodb/i, /api/i] },
});

export const ALLOWED_SERVICES = Object.freeze({
  "custom-website-development": { title: "Custom Website Development", category: "Web Engineering", keywords: [/custom website/i, /web development/i, /business website/i] },
  "mern-stack-web-development": { title: "MERN Stack Development", category: "Full-Stack", keywords: [/mern/i, /mongodb/i, /express/i, /react/i, /node/i] },
  "nextjs-website-development": { title: "Next.js Development", category: "Frontend & SSR", keywords: [/next\.?js/i, /server components/i, /ssr/i, /app router/i] },
  "full-stack-web-app-development": { title: "Full-Stack Web App Development", category: "Web Apps", keywords: [/web app/i, /full-?stack/i, /custom platform/i] },
  "admin-dashboard-development": { title: "Admin Dashboard Development", category: "Internal Tools", keywords: [/admin/i, /dashboard/i, /internal tool/i, /control panel/i] },
  "e-commerce-website-development": { title: "E-Commerce Development", category: "E-Commerce", keywords: [/e-?commerce/i, /online store/i, /shopping/i, /shopify/i] },
  "portfolio-website-development": { title: "Portfolio Website Development", category: "Showcase", keywords: [/portfolio/i, /showcase/i, /personal site/i] },
  "landing-page-design": { title: "Landing Page Design", category: "Design & Lead Gen", keywords: [/landing page/i, /lead generation/i, /high converting/i] },
  "website-redesign": { title: "Website Redesign", category: "Optimization", keywords: [/redesign/i, /modernize/i, /revamp/i, /rebuild/i] },
  "api-integration": { title: "API Integration", category: "Backend", keywords: [/api/i, /webhook/i, /rest/i, /graphql/i, /third-party/i] },
  "database-integration": { title: "Database Integration & Optimization", category: "Data", keywords: [/database/i, /mongodb/i, /indexing/i, /migration/i, /schema/i] },
  "seo-friendly-website-setup": { title: "SEO Friendly Website Setup", category: "SEO", keywords: [/technical seo/i, /seo setup/i, /schema/i, /indexation/i] },
  "website-speed-optimization": { title: "Website Speed Optimization", category: "Performance", keywords: [/speed/i, /performance/i, /core web vitals/i, /lcp/i] },
  "maintenance-support": { title: "Maintenance & Support", category: "DevOps", keywords: [/maintenance/i, /support/i, /security/i, /updates/i] },
});

export function detectIndustry(topic = {}) {
  const text = [topic.title, topic.subtopic, topic.problem, topic.businessProblem, topic.focusKeyword, topic.audience]
    .filter(Boolean)
    .join(" ");

  for (const [key, def] of Object.entries(INDUSTRY_TAXONOMY)) {
    if (key === "general_technology") continue;
    if (def.keywords.some((pattern) => pattern.test(text))) {
      return key;
    }
  }
  return "general_technology";
}

export function getIndustryDefinition(key) {
  if (!key || typeof key !== "string") return null;
  const cleanKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (INDUSTRY_TAXONOMY[cleanKey]) {
    return { key: cleanKey, label: INDUSTRY_TAXONOMY[cleanKey].label };
  }
  return null;
}

export function normalizeIndustry(input) {
  if (!input) return null;
  if (typeof input === "object" && input.key) {
    const def = getIndustryDefinition(input.key);
    if (def) return def;
    return { key: String(input.key).trim().toLowerCase(), label: String(input.label || input.key).trim() };
  }
  if (typeof input === "string") {
    const def = getIndustryDefinition(input);
    if (def && def.key !== "general_technology") return def;
    if (input === "general_technology" || input === "none" || input === "null") return null;
  }
  return null;
}

export function evaluateServiceRelevance(topic = {}) {
  const text = [topic.title, topic.subtopic, topic.problem, topic.solutionAngle, topic.focusKeyword, topic.businessValue]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  // Explicit related service slugs take priority
  if (Array.isArray(topic.relatedServiceSlugs) && topic.relatedServiceSlugs.length > 0) {
    const firstSlug = topic.relatedServiceSlugs[0];
    if (ALLOWED_SERVICES[firstSlug]) {
      return {
        serviceSlug: firstSlug,
        serviceRelevance: 0.95,
        conversionOpportunity: "high",
        serviceTitle: ALLOWED_SERVICES[firstSlug].title,
      };
    }
  }

  for (const [slug, def] of Object.entries(ALLOWED_SERVICES)) {
    let score = 0;
    for (const pattern of def.keywords) {
      if (pattern.test(text)) {
        score += 0.35;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = slug;
    }
  }

  const normalizedScore = Math.min(0.95, Math.round(highestScore * 100) / 100);

  if (bestMatch && normalizedScore >= 0.3) {
    return {
      serviceSlug: bestMatch,
      serviceRelevance: normalizedScore,
      conversionOpportunity: normalizedScore >= 0.7 ? "high" : "medium",
      serviceTitle: ALLOWED_SERVICES[bestMatch].title,
    };
  }

  return {
    serviceSlug: null,
    serviceRelevance: 0,
    conversionOpportunity: "low",
    serviceTitle: null,
  };
}
