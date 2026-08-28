/**
 * Service Controlled Taxonomy System (Phase 2)
 * 
 * Defines standard controlled enumerations for categories, industries, audiences,
 * target roles, problem types, use cases, commercial intents, confidence levels, and data sources.
 */

export const SERVICE_CATEGORIES = Object.freeze({
  WEB_DEVELOPMENT: "Web Development",
  FULL_STACK_DEVELOPMENT: "Full-Stack Development",
  FRONTEND_ENGINEERING: "Frontend Engineering",
  BACKEND_ENGINEERING: "Backend Engineering",
  PRODUCT_DEVELOPMENT: "Product Development",
  COMMERCE: "Commerce",
  ADMIN_SYSTEMS: "Admin Systems",
  PERFORMANCE: "Performance",
  SEO: "SEO",
  BACKEND_INTEGRATION: "Backend Integration",
  DATA_SYSTEMS: "Data Systems",
  ONGOING_SUPPORT: "Ongoing Support",
  CONVERSION_DESIGN: "Conversion Design",
});

export const SERVICE_INDUSTRIES = Object.freeze({
  ai_saas_tools: { key: "ai_saas_tools", label: "AI SaaS & Micro-SaaS Platforms" },
  home_services_contractors: { key: "home_services_contractors", label: "Home Services & Contractors" },
  edtech_coaching: { key: "edtech_coaching", label: "EdTech & Online Course Platforms" },
  legal_tech: { key: "legal_tech", label: "Law Firms & Legal Tech" },
  b2b_wholesale: { key: "b2b_wholesale", label: "B2B Wholesale & Inventory Portals" },
  ecommerce: { key: "ecommerce", label: "E-Commerce & Retail" },
  real_estate: { key: "real_estate", label: "Real Estate & Property" },
  healthcare: { key: "healthcare", label: "Healthcare & Telehealth" },
  seo_digital_marketing: { key: "seo_digital_marketing", label: "SEO & Digital Marketing Agencies" },
  developer_portfolios: { key: "developer_portfolios", label: "Developer & Career Portfolios" },
  student_fyps: { key: "student_fyps", label: "Academic Projects & BSCS FYP" },
  beauty_wellness: { key: "beauty_wellness", label: "Beauty, Salons & Wellness" },
  fitness_gyms: { key: "fitness_gyms", label: "Fitness & Gyms" },
  automotive: { key: "automotive", label: "Automotive & Dealerships" },
  travel_tourism: { key: "travel_tourism", label: "Travel & Tourism" },
  education: { key: "education", label: "Education & EdTech" },
  hospitality: { key: "hospitality", label: "Hospitality & Booking" },
  restaurants: { key: "restaurants", label: "Restaurants & Dining" },
  professional_services: { key: "professional_services", label: "Professional Services & Consulting" },
  logistics: { key: "logistics", label: "Logistics & Supply Chain" },
  finance: { key: "finance", label: "Fintech & Financial Services" },
  saas: { key: "saas", label: "SaaS & Subscription Platforms" },
  startups: { key: "startups", label: "Startups & Emerging Tech" },
  local_business: { key: "local_business", label: "Local Businesses & Stores" },
  general_technology: { key: "general_technology", label: "Core Software & Web Engineering" },
});

export const SERVICE_AUDIENCES = Object.freeze({
  startups: { key: "startups", label: "Startups & Product Teams" },
  small_business: { key: "small_business", label: "Small Businesses" },
  growing_business: { key: "growing_business", label: "Growing Companies & Brands" },
  enterprise: { key: "enterprise", label: "Enterprise & Scale-Ups" },
  saas_companies: { key: "saas_companies", label: "SaaS Companies" },
  ecommerce_stores: { key: "ecommerce_stores", label: "E-Commerce Stores" },
  agencies: { key: "agencies", label: "Agencies & Partners" },
  personal_brands: { key: "personal_brands", label: "Personal Brands & Freelancers" },
  developers: { key: "developers", label: "Developer & Tech Teams" },
});

export const SERVICE_TARGET_ROLES = Object.freeze({
  founder: "Founder & Co-Founder",
  business_owner: "Business Owner",
  cto: "CTO & Technical Director",
  product_manager: "Product Manager",
  marketing_manager: "Marketing Manager",
  developer: "Senior Web Developer",
  engineering_team: "Engineering Team",
});

export const SERVICE_PROBLEM_TYPES = Object.freeze({
  "slow-website": { key: "slow-website", label: "Slow Loading & Poor Core Web Vitals", category: "performance" },
  "poor-seo-visibility": { key: "poor-seo-visibility", label: "Weak SEO Visibility & Indexing Issues", category: "seo" },
  "outdated-website": { key: "outdated-website", label: "Outdated Design & Unprofessional UI", category: "branding" },
  "poor-conversion": { key: "poor-conversion", label: "Low Conversion Rates & High Bounce Rates", category: "conversion" },
  "scalability-bottlenecks": { key: "scalability-bottlenecks", label: "Platform Scalability Bottlenecks", category: "architecture" },
  "api-integration-friction": { key: "api-integration-friction", label: "Unreliable Third-Party API Integrations", category: "backend" },
  "database-performance": { key: "database-performance", label: "Slow Database Queries & Unstructured Data", category: "data" },
  "security-concerns": { key: "security-concerns", label: "Data Security & Auth Vulnerabilities", category: "security" },
  "technical-debt": { key: "technical-debt", label: "Technical Debt & Maintenance Overhead", category: "maintenance" },
  "poor-ux": { key: "poor-ux", label: "Complex Navigation & Friction-full UX", category: "design" },
  "manual-operational-workload": { key: "manual-operational-workload", label: "High Manual Operational Workload", category: "operations" },
  "booking-bottlenecks": { key: "booking-bottlenecks", label: "Manual Booking & Appointment Bottlenecks", category: "operations" },
  "inventory-complexity": { key: "inventory-complexity", label: "Complex Product & Inventory Tracking", category: "commerce" },
  "content-management-delays": { key: "content-management-delays", label: "Rigid & Slow Content Publishing", category: "cms" },
});

export const SERVICE_USE_CASES = Object.freeze({
  "build-new-website": { key: "build-new-website", label: "Build New Modern Website" },
  "redesign-existing-website": { key: "redesign-existing-website", label: "Redesign & Rebuild Existing Website" },
  "migrate-application": { key: "migrate-application", label: "Migrate Application to Next.js / Cloud" },
  "improve-performance": { key: "improve-performance", label: "Optimize Speed & Core Web Vitals" },
  "build-saas-platform": { key: "build-saas-platform", label: "Build SaaS Platform / Custom MVP" },
  "build-online-store": { key: "build-online-store", label: "Build E-Commerce Online Store" },
  "build-admin-dashboard": { key: "build-admin-dashboard", label: "Build Operational Admin Dashboard" },
  "integrate-third-party-api": { key: "integrate-third-party-api", label: "Integrate Third-Party APIs & Payments" },
  "integrate-mongodb-database": { key: "integrate-mongodb-database", label: "Integrate MongoDB & Database APIs" },
  "technical-seo-setup": { key: "technical-seo-setup", label: "Setup Technical SEO & Schema Markup" },
  "ongoing-website-maintenance": { key: "ongoing-website-maintenance", label: "Provide Ongoing Technical Support & Updates" },
});

export const COMMERCIAL_INTENT_LEVELS = Object.freeze({
  INFORMATIONAL: "INFORMATIONAL",
  COMMERCIAL_INVESTIGATION: "COMMERCIAL_INVESTIGATION",
  SERVICE_EVALUATION: "SERVICE_EVALUATION",
  TRANSACTIONAL: "TRANSACTIONAL",
  HIGH_COMMERCIAL: "HIGH_COMMERCIAL",
});

export const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
});

export const PROVENANCE_SOURCES = Object.freeze({
  ADMIN: "admin",
  SEED: "seed",
  KNOWLEDGE_BASE: "knowledge-base",
  RULE: "rule",
  INFERRED: "inferred",
  AI: "ai",
  TOPIC_INTELLIGENCE: "topic-intelligence",
});
