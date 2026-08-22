/**
 * Service Classification & Market Positioning Engine (Phase 2)
 * 
 * Transforms Service Knowledge Base profiles into machine-readable commercial
 * intelligence profiles.
 * 
 * Provides server-side query interfaces:
 * - classifyService(serviceOrSlug)
 * - getServicesByIndustry(industryKey)
 * - getServicesByProblem(problemKey)
 * - getServicesByUseCase(useCaseKey)
 * - getServicesByAudience(audienceKey)
 * - getServicesByCommercialIntent(intentKey)
 * - getServicesByCategory(categoryName)
 */

import {
  SERVICE_CATEGORIES,
  SERVICE_INDUSTRIES,
  SERVICE_AUDIENCES,
  SERVICE_PROBLEM_TYPES,
  SERVICE_USE_CASES,
  COMMERCIAL_INTENT_LEVELS,
  CONFIDENCE_LEVELS,
  PROVENANCE_SOURCES,
} from "./serviceTaxonomy.js";
import { getServiceKnowledgeProfile, getAllServiceKnowledgeProfiles } from "./serviceKnowledgeBase.js";

const CLASSIFICATION_PROFILES = {
  "custom-website-development": {
    serviceSlug: "custom-website-development",
    serviceTitle: "Custom Website Development",
    primaryCategory: SERVICE_CATEGORIES.WEB_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.CONVERSION_DESIGN, SERVICE_CATEGORIES.PRODUCT_DEVELOPMENT],
    industries: [
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "local_business", label: SERVICE_INDUSTRIES.local_business.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "real_estate", label: SERVICE_INDUSTRIES.real_estate.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED },
      { key: "education", label: SERVICE_INDUSTRIES.education.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }
    ],
    businessTypes: ["Local Businesses", "Professional Agencies", "Growing Companies"],
    audienceTypes: ["small_business", "growing_business", "agencies", "personal_brands"],
    targetRoles: ["Business Owner", "Founder & Co-Founder", "Marketing Manager"],
    problems: [
      { key: "outdated-website", label: SERVICE_PROBLEM_TYPES["outdated-website"].label, relevanceScore: 95, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-ux", label: SERVICE_PROBLEM_TYPES["poor-ux"].label, relevanceScore: 85, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Custom Web Architecture", "Responsive Mobile UX", "SEO-Ready Page Structure"],
    useCases: [
      { key: "build-new-website", label: SERVICE_USE_CASES["build-new-website"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "redesign-existing-website", label: SERVICE_USE_CASES["redesign-existing-website"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Responsive UX Layouts", "Lead Capture Forms", "SEO Structured HTML", "Deployment Support"],
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Node.js", "MongoDB", "Vercel"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "Professional custom website development for businesses requiring credibility, mobile performance, clean structure, and qualified lead conversion.",
    relatedServiceSlugs: ["nextjs-website-development", "seo-friendly-website-setup", "website-speed-optimization", "maintenance-support"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "mern-stack-web-development": {
    serviceSlug: "mern-stack-web-development",
    serviceTitle: "MERN Stack Web Development",
    primaryCategory: SERVICE_CATEGORIES.FULL_STACK_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.BACKEND_ENGINEERING, SERVICE_CATEGORIES.DATA_SYSTEMS],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "finance", label: SERVICE_INDUSTRIES.finance.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED },
      { key: "logistics", label: SERVICE_INDUSTRIES.logistics.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }
    ],
    businessTypes: ["SaaS Founders", "Digital Product Companies", "Operational Teams"],
    audienceTypes: ["saas_companies", "startups", "developers", "enterprise"],
    targetRoles: ["CTO & Technical Director", "Founder & Co-Founder", "Product Manager"],
    problems: [
      { key: "manual-operational-workload", label: SERVICE_PROBLEM_TYPES["manual-operational-workload"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "scalability-bottlenecks", label: SERVICE_PROBLEM_TYPES["scalability-bottlenecks"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "database-performance", label: SERVICE_PROBLEM_TYPES["database-performance"].label, relevanceScore: 85, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Full-Stack MERN Architecture", "MongoDB Data Modeling", "REST API Development"],
    useCases: [
      { key: "build-saas-platform", label: SERVICE_USE_CASES["build-saas-platform"].label, relevanceScore: 96, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "build-admin-dashboard", label: SERVICE_USE_CASES["build-admin-dashboard"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["MongoDB Modeling", "Express REST APIs", "React SPAs", "JWT Auth", "Cloud Uploads"],
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js", "JWT", "Socket.io"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "Full-stack MERN web application development delivering connected JavaScript software for SaaS platforms, dashboards, and operational web products.",
    relatedServiceSlugs: ["full-stack-web-app-development", "api-integration", "database-integration", "admin-dashboard-development"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "nextjs-website-development": {
    serviceSlug: "nextjs-website-development",
    serviceTitle: "Next.js Website Development",
    primaryCategory: SERVICE_CATEGORIES.FRONTEND_ENGINEERING,
    secondaryCategories: [SERVICE_CATEGORIES.WEB_DEVELOPMENT, SERVICE_CATEGORIES.SEO],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["SEO-Driven Brands", "Modern React Products", "Fast Business Websites"],
    audienceTypes: ["saas_companies", "startups", "growing_business", "developers"],
    targetRoles: ["CTO & Technical Director", "Founder & Co-Founder", "Marketing Manager"],
    problems: [
      { key: "slow-website", label: SERVICE_PROBLEM_TYPES["slow-website"].label, relevanceScore: 94, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-seo-visibility", label: SERVICE_PROBLEM_TYPES["poor-seo-visibility"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "scalability-bottlenecks", label: SERVICE_PROBLEM_TYPES["scalability-bottlenecks"].label, relevanceScore: 86, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Next.js App Router Architecture", "Server Components (SSR/ISR)", "Image & Asset Optimization"],
    useCases: [
      { key: "build-new-website", label: SERVICE_USE_CASES["build-new-website"].label, relevanceScore: 96, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "build-saas-platform", label: SERVICE_USE_CASES["build-saas-platform"].label, relevanceScore: 94, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "migrate-application", label: SERVICE_USE_CASES["migrate-application"].label, relevanceScore: 94, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "improve-performance", label: SERVICE_USE_CASES["improve-performance"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Server Side Rendering", "Incremental Static Regeneration", "Dynamic Routing", "Metadata Control"],
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Server Components", "Vercel"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "Fast, crawlable Next.js website development for serious businesses requiring React interactions, server rendering, SEO metadata, and scalable performance.",
    relatedServiceSlugs: ["custom-website-development", "full-stack-web-app-development", "seo-friendly-website-setup", "website-speed-optimization"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "full-stack-web-app-development": {
    serviceSlug: "full-stack-web-app-development",
    serviceTitle: "Full-Stack Web App Development",
    primaryCategory: SERVICE_CATEGORIES.PRODUCT_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.FULL_STACK_DEVELOPMENT, SERVICE_CATEGORIES.BACKEND_ENGINEERING],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "finance", label: SERVICE_INDUSTRIES.finance.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "logistics", label: SERVICE_INDUSTRIES.logistics.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }
    ],
    businessTypes: ["Startup MVPs", "Customer Platforms", "Custom Software Products"],
    audienceTypes: ["startups", "saas_companies", "enterprise", "developers"],
    targetRoles: ["Founder & Co-Founder", "CTO & Technical Director", "Product Manager"],
    problems: [
      { key: "manual-operational-workload", label: SERVICE_PROBLEM_TYPES["manual-operational-workload"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "scalability-bottlenecks", label: SERVICE_PROBLEM_TYPES["scalability-bottlenecks"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "security-concerns", label: SERVICE_PROBLEM_TYPES["security-concerns"].label, relevanceScore: 85, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["End-to-End Product Architecture", "Secure User Auth & APIs", "Scalable Database Schema"],
    useCases: [
      { key: "build-saas-platform", label: SERVICE_USE_CASES["build-saas-platform"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "integrate-third-party-api", label: SERVICE_USE_CASES["integrate-third-party-api"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Full-Stack Architecture", "User Auth & Roles", "REST APIs", "Automated Workflows"],
    technologies: ["Next.js", "React.js", "Node.js", "MongoDB", "Mongoose", "Redis"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Full-stack web application development turning product ideas into scalable web platforms with clean frontend UI, secure backend logic, and admin controls.",
    relatedServiceSlugs: ["mern-stack-web-development", "api-integration", "database-integration", "admin-dashboard-development"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "admin-dashboard-development": {
    serviceSlug: "admin-dashboard-development",
    serviceTitle: "Admin Dashboard Development",
    primaryCategory: SERVICE_CATEGORIES.ADMIN_SYSTEMS,
    secondaryCategories: [SERVICE_CATEGORIES.DATA_SYSTEMS, SERVICE_CATEGORIES.BACKEND_ENGINEERING],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "logistics", label: SERVICE_INDUSTRIES.logistics.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Content Teams", "Operations Teams", "Product Owners"],
    audienceTypes: ["saas_companies", "ecommerce_stores", "small_business", "growing_business"],
    targetRoles: ["Business Owner", "CTO & Technical Director", "Product Manager"],
    problems: [
      { key: "content-management-delays", label: SERVICE_PROBLEM_TYPES["content-management-delays"].label, relevanceScore: 94, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "manual-operational-workload", label: SERVICE_PROBLEM_TYPES["manual-operational-workload"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "security-concerns", label: SERVICE_PROBLEM_TYPES["security-concerns"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Role-Based Admin Panel", "Data Table & CRUD Tools", "Analytics & Reporting Dashboards"],
    useCases: [
      { key: "build-admin-dashboard", label: SERVICE_USE_CASES["build-admin-dashboard"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "integrate-mongodb-database", label: SERVICE_USE_CASES["integrate-mongodb-database"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Data Tables & Filters", "CRUD Interfaces", "Role Permissions", "Realtime Updates"],
    technologies: ["Next.js", "MongoDB", "Mongoose", "Zustand", "Recharts"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Custom admin dashboard development providing teams with one secure place to manage content, bookings, users, products, analytics, and operational data.",
    relatedServiceSlugs: ["full-stack-web-app-development", "api-integration", "database-integration", "maintenance-support"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "e-commerce-website-development": {
    serviceSlug: "e-commerce-website-development",
    serviceTitle: "E-commerce Website Development",
    primaryCategory: SERVICE_CATEGORIES.COMMERCE,
    secondaryCategories: [SERVICE_CATEGORIES.WEB_DEVELOPMENT, SERVICE_CATEGORIES.CONVERSION_DESIGN],
    industries: [
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "restaurants", label: SERVICE_INDUSTRIES.restaurants.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED },
      { key: "local_business", label: SERVICE_INDUSTRIES.local_business.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Retail Brands", "Direct-to-Consumer Stores", "Catalog Merchants"],
    audienceTypes: ["ecommerce_stores", "small_business", "growing_business"],
    targetRoles: ["Business Owner", "Marketing Manager", "Founder & Co-Founder"],
    problems: [
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 94, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "inventory-complexity", label: SERVICE_PROBLEM_TYPES["inventory-complexity"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "slow-website", label: SERVICE_PROBLEM_TYPES["slow-website"].label, relevanceScore: 86, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Custom Storefront", "Payment Gateway Integration", "Product Catalog Filtering"],
    useCases: [
      { key: "build-online-store", label: SERVICE_USE_CASES["build-online-store"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "redesign-existing-website", label: SERVICE_USE_CASES["redesign-existing-website"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Product Catalog Filters", "Cart & Checkout Flow", "Payment Integrations", "Order Management"],
    technologies: ["Next.js", "React.js", "MongoDB", "Stripe", "Cloudinary"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "E-commerce website development engineered for fast product discovery, seamless checkout journeys, secure payment gateways, and store management.",
    relatedServiceSlugs: ["custom-website-development", "admin-dashboard-development", "database-integration", "maintenance-support"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "portfolio-website-development": {
    serviceSlug: "portfolio-website-development",
    serviceTitle: "Portfolio Website Development",
    primaryCategory: SERVICE_CATEGORIES.WEB_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.CONVERSION_DESIGN],
    industries: [
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "general_technology", label: SERVICE_INDUSTRIES.general_technology.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Freelancers", "Designers & Developers", "Consultants & Founders"],
    audienceTypes: ["personal_brands", "developers", "agencies"],
    targetRoles: ["Founder & Co-Founder", "Senior Web Developer", "Business Owner"],
    problems: [
      { key: "outdated-website", label: SERVICE_PROBLEM_TYPES["outdated-website"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 86, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Credibility Case Studies", "Personal Brand Showcase", "Direct Lead Journey"],
    useCases: [
      { key: "build-new-website", label: SERVICE_USE_CASES["build-new-website"].label, relevanceScore: 95, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Animated Case Studies", "Project Galleries", "Contact Journey", "SEO Meta Setup"],
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Framer Motion", "Cloudinary"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Portfolio website development presenting your services, projects, story, and proof in a polished experience designed to build trust quickly.",
    relatedServiceSlugs: ["custom-website-development", "landing-page-design", "seo-friendly-website-setup", "website-speed-optimization"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "landing-page-design": {
    serviceSlug: "landing-page-design",
    serviceTitle: "Landing Page Design",
    primaryCategory: SERVICE_CATEGORIES.CONVERSION_DESIGN,
    secondaryCategories: [SERVICE_CATEGORIES.WEB_DEVELOPMENT],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "startups", label: SERVICE_INDUSTRIES.startups.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }
    ],
    businessTypes: ["Ad Campaign Managers", "Product Launch Teams", "Service Providers"],
    audienceTypes: ["saas_companies", "startups", "small_business", "agencies"],
    targetRoles: ["Marketing Manager", "Founder & Co-Founder", "Business Owner"],
    problems: [
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-ux", label: SERVICE_PROBLEM_TYPES["poor-ux"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "slow-website", label: SERVICE_PROBLEM_TYPES["slow-website"].label, relevanceScore: 84, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["High-Converting Hero & Offer Sections", "Ad Campaign Landing Pages", "Lead Capture Automation"],
    useCases: [
      { key: "build-new-website", label: SERVICE_USE_CASES["build-new-website"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "redesign-existing-website", label: SERVICE_USE_CASES["redesign-existing-website"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Single Offer Layouts", "Fast Load Times", "Lead Forms", "Analytics Tracking"],
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Analytics", "SEO Metadata"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Focused landing page design for campaigns, products, and offers with clear messaging, strong trust signals, and high conversion paths.",
    relatedServiceSlugs: ["custom-website-development", "seo-friendly-website-setup", "website-speed-optimization", "website-redesign"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "website-redesign": {
    serviceSlug: "website-redesign",
    serviceTitle: "Website Redesign",
    primaryCategory: SERVICE_CATEGORIES.WEB_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.CONVERSION_DESIGN, SERVICE_CATEGORIES.PERFORMANCE],
    industries: [
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "local_business", label: SERVICE_INDUSTRIES.local_business.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Established Companies", "Low-Converting Sites", "Fragile Legacy Builds"],
    audienceTypes: ["small_business", "growing_business", "saas_companies", "ecommerce_stores"],
    targetRoles: ["Business Owner", "Marketing Manager", "CTO & Technical Director"],
    problems: [
      { key: "outdated-website", label: SERVICE_PROBLEM_TYPES["outdated-website"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 92, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-ux", label: SERVICE_PROBLEM_TYPES["poor-ux"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Modern Visual Rebuild", "SEO Value Preservation", "Mobile UX Overhaul"],
    useCases: [
      { key: "redesign-existing-website", label: SERVICE_USE_CASES["redesign-existing-website"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "improve-performance", label: SERVICE_USE_CASES["improve-performance"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Modern UI Rebuild", "301 Redirect Preservation", "Mobile Refinement", "CTA Optimization"],
    technologies: ["Next.js", "React.js", "Tailwind CSS", "SEO Audit", "Cloudinary"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Website redesign services improving visuals, structure, usability, and trust of an existing website while safely preserving SEO value.",
    relatedServiceSlugs: ["custom-website-development", "seo-friendly-website-setup", "website-speed-optimization", "maintenance-support"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "api-integration": {
    serviceSlug: "api-integration",
    serviceTitle: "API Integration",
    primaryCategory: SERVICE_CATEGORIES.BACKEND_INTEGRATION,
    secondaryCategories: [SERVICE_CATEGORIES.BACKEND_ENGINEERING, SERVICE_CATEGORIES.DATA_SYSTEMS],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "finance", label: SERVICE_INDUSTRIES.finance.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "logistics", label: SERVICE_INDUSTRIES.logistics.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["SaaS Operations", "E-commerce Platforms", "Product Companies"],
    audienceTypes: ["saas_companies", "developers", "enterprise", "ecommerce_stores"],
    targetRoles: ["CTO & Technical Director", "Product Manager", "Senior Web Developer"],
    problems: [
      { key: "api-integration-friction", label: SERVICE_PROBLEM_TYPES["api-integration-friction"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "manual-operational-workload", label: SERVICE_PROBLEM_TYPES["manual-operational-workload"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "security-concerns", label: SERVICE_PROBLEM_TYPES["security-concerns"].label, relevanceScore: 86, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Payment & Webhook Connections", "Automated CRM/Email Sync", "Third-Party OAuth & AI APIs"],
    useCases: [
      { key: "integrate-third-party-api", label: SERVICE_USE_CASES["integrate-third-party-api"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["REST API Endpoints", "Webhook Listeners", "Error Handling & Retries", "Env Security"],
    technologies: ["REST APIs", "Node.js", "Next.js API Routes", "Webhooks", "OAuth"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "API integration connecting applications with third-party payment, CRM, email, storage, authentication, AI, and internal services reliably.",
    relatedServiceSlugs: ["full-stack-web-app-development", "mern-stack-web-development", "database-integration", "admin-dashboard-development"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "database-integration": {
    serviceSlug: "database-integration",
    serviceTitle: "Database Integration",
    primaryCategory: SERVICE_CATEGORIES.DATA_SYSTEMS,
    secondaryCategories: [SERVICE_CATEGORIES.BACKEND_ENGINEERING],
    industries: [
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "finance", label: SERVICE_INDUSTRIES.finance.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "education", label: SERVICE_INDUSTRIES.education.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }
    ],
    businessTypes: ["Content Platforms", "Customer Portals", "Operational Reporting Systems"],
    audienceTypes: ["developers", "saas_companies", "enterprise", "growing_business"],
    targetRoles: ["CTO & Technical Director", "Senior Web Developer", "Product Manager"],
    problems: [
      { key: "database-performance", label: SERVICE_PROBLEM_TYPES["database-performance"].label, relevanceScore: 98, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "scalability-bottlenecks", label: SERVICE_PROBLEM_TYPES["scalability-bottlenecks"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "technical-debt", label: SERVICE_PROBLEM_TYPES["technical-debt"].label, relevanceScore: 86, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Mongoose Schema Modeling", "Database Indexing & Query Optimization", "CRUD API Integration"],
    useCases: [
      { key: "integrate-mongodb-database", label: SERVICE_USE_CASES["integrate-mongodb-database"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Mongoose Models", "Query Optimization", "Data Validation", "Safe Serialization"],
    technologies: ["MongoDB", "Mongoose", "Indexes", "Next.js", "Node.js"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "Database integration structuring, optimizing, and securing MongoDB business data models and API access for scalable applications.",
    relatedServiceSlugs: ["api-integration", "full-stack-web-app-development", "mern-stack-web-development", "admin-dashboard-development"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "seo-friendly-website-setup": {
    serviceSlug: "seo-friendly-website-setup",
    serviceTitle: "SEO-Friendly Website Setup",
    primaryCategory: SERVICE_CATEGORIES.SEO,
    secondaryCategories: [SERVICE_CATEGORIES.WEB_DEVELOPMENT, SERVICE_CATEGORIES.FRONTEND_ENGINEERING],
    industries: [
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "local_business", label: SERVICE_INDUSTRIES.local_business.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["New Website Launches", "Next.js Sites Fixing Meta Issues", "Service Businesses"],
    audienceTypes: ["small_business", "growing_business", "saas_companies", "personal_brands"],
    targetRoles: ["Marketing Manager", "Business Owner", "Founder & Co-Founder"],
    problems: [
      { key: "poor-seo-visibility", label: SERVICE_PROBLEM_TYPES["poor-seo-visibility"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "slow-website", label: SERVICE_PROBLEM_TYPES["slow-website"].label, relevanceScore: 82, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Technical SEO Infrastructure", "Schema.org Structured Data", "Clean URL & Sitemap Generation"],
    useCases: [
      { key: "technical-seo-setup", label: SERVICE_USE_CASES["technical-seo-setup"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Metadata Control", "Canonical Tags", "Schema.org JSON-LD", "Sitemap & Robots Setup"],
    technologies: ["Next.js Metadata", "Sitemap", "Robots.txt", "Schema.org", "Core Web Vitals"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "SEO-friendly website setup establishing technical search foundations with crawl controls, metadata, canonicals, schema, and indexing readiness.",
    relatedServiceSlugs: ["custom-website-development", "nextjs-website-development", "website-speed-optimization", "landing-page-design"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "website-speed-optimization": {
    serviceSlug: "website-speed-optimization",
    serviceTitle: "Website Speed Optimization",
    primaryCategory: SERVICE_CATEGORIES.PERFORMANCE,
    secondaryCategories: [SERVICE_CATEGORIES.FRONTEND_ENGINEERING, SERVICE_CATEGORIES.SEO],
    industries: [
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "general_technology", label: SERVICE_INDUSTRIES.general_technology.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Slow Business Sites", "Image-Heavy Portfolios", "Next.js Web Platforms"],
    audienceTypes: ["ecommerce_stores", "saas_companies", "small_business", "developers"],
    targetRoles: ["CTO & Technical Director", "Marketing Manager", "Business Owner"],
    problems: [
      { key: "slow-website", label: SERVICE_PROBLEM_TYPES["slow-website"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-conversion", label: SERVICE_PROBLEM_TYPES["poor-conversion"].label, relevanceScore: 88, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "poor-seo-visibility", label: SERVICE_PROBLEM_TYPES["poor-seo-visibility"].label, relevanceScore: 85, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Core Web Vitals Optimization", "Image Delivery Optimization", "Bundle & Render Optimization"],
    useCases: [
      { key: "improve-performance", label: SERVICE_USE_CASES["improve-performance"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Image Compression", "Code Splitting", "Layout Shift Reduction", "Cache Review"],
    technologies: ["Next.js Image", "Caching", "Lazy Loading", "Bundle Review", "Core Web Vitals"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL, COMMERCIAL_INTENT_LEVELS.SERVICE_EVALUATION],
    positioningStatement: "Website speed optimization auditing and fixing loading delays, heavy assets, JavaScript overhead, and Core Web Vitals for better user experience.",
    relatedServiceSlugs: ["seo-friendly-website-setup", "nextjs-website-development", "website-redesign", "maintenance-support"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  },

  "maintenance-support": {
    serviceSlug: "maintenance-support",
    serviceTitle: "Maintenance & Support",
    primaryCategory: SERVICE_CATEGORIES.ONGOING_SUPPORT,
    secondaryCategories: [SERVICE_CATEGORIES.WEB_DEVELOPMENT],
    industries: [
      { key: "professional_services", label: SERVICE_INDUSTRIES.professional_services.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "local_business", label: SERVICE_INDUSTRIES.local_business.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "saas", label: SERVICE_INDUSTRIES.saas.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE },
      { key: "ecommerce", label: SERVICE_INDUSTRIES.ecommerce.label, confidence: CONFIDENCE_LEVELS.HIGH, source: PROVENANCE_SOURCES.KNOWLEDGE_BASE }
    ],
    businessTypes: ["Business Websites", "Next.js Platforms", "Teams Without In-House Developers"],
    audienceTypes: ["small_business", "growing_business", "personal_brands"],
    targetRoles: ["Business Owner", "Marketing Manager", "Founder & Co-Founder"],
    problems: [
      { key: "technical-debt", label: SERVICE_PROBLEM_TYPES["technical-debt"].label, relevanceScore: 96, confidence: CONFIDENCE_LEVELS.HIGH },
      { key: "security-concerns", label: SERVICE_PROBLEM_TYPES["security-concerns"].label, relevanceScore: 90, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    solutionTypes: ["Ongoing Bug Fixes", "Dependency Updates", "Monitoring & Health Checks"],
    useCases: [
      { key: "ongoing-website-maintenance", label: SERVICE_USE_CASES["ongoing-website-maintenance"].label, relevanceScore: 99, confidence: CONFIDENCE_LEVELS.HIGH }
    ],
    capabilities: ["Issue Triage", "Dependency Awareness", "Form Checks", "Deployment Support"],
    technologies: ["Next.js", "MongoDB", "Vercel", "Cloudinary", "Monitoring"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL, COMMERCIAL_INTENT_LEVELS.TRANSACTIONAL],
    positioningStatement: "Website maintenance and support providing planned updates, bug fixes, dependency reviews, and technical assistance to keep web systems dependable.",
    relatedServiceSlugs: ["website-speed-optimization", "website-redesign", "seo-friendly-website-setup", "custom-website-development"],
    provenance: { source: PROVENANCE_SOURCES.KNOWLEDGE_BASE, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  }
};

/**
 * Returns structured classification profile for a service slug or document.
 */
export function classifyService(serviceOrSlug) {
  const slug = typeof serviceOrSlug === "string" ? serviceOrSlug : serviceOrSlug?.slug;
  if (!slug) return null;
  
  const existingProfile = CLASSIFICATION_PROFILES[slug];
  if (existingProfile) {
    return { ...existingProfile };
  }

  // Fallback for custom or unknown service
  const title = typeof serviceOrSlug === "object" ? serviceOrSlug.title || slug : slug;
  return {
    serviceSlug: slug,
    serviceTitle: title,
    primaryCategory: SERVICE_CATEGORIES.WEB_DEVELOPMENT,
    secondaryCategories: [SERVICE_CATEGORIES.PRODUCT_DEVELOPMENT],
    industries: [{ key: "general_technology", label: SERVICE_INDUSTRIES.general_technology.label, confidence: CONFIDENCE_LEVELS.MEDIUM, source: PROVENANCE_SOURCES.INFERRED }],
    businessTypes: ["Growing Business"],
    audienceTypes: ["growing_business"],
    targetRoles: ["Business Owner"],
    problems: [{ key: "outdated-website", label: SERVICE_PROBLEM_TYPES["outdated-website"].label, relevanceScore: 80, confidence: CONFIDENCE_LEVELS.MEDIUM }],
    solutionTypes: ["Custom Solution"],
    useCases: [{ key: "build-new-website", label: SERVICE_USE_CASES["build-new-website"].label, relevanceScore: 80, confidence: CONFIDENCE_LEVELS.MEDIUM }],
    capabilities: ["Custom Implementation"],
    technologies: ["Next.js", "React.js"],
    commercialIntents: [COMMERCIAL_INTENT_LEVELS.HIGH_COMMERCIAL],
    positioningStatement: `Professional ${title} solutions built around client requirements and scalable digital growth.`,
    relatedServiceSlugs: ["custom-website-development"],
    provenance: { source: PROVENANCE_SOURCES.INFERRED, verifiedByAdmin: false, updatedAt: "2026-08-22" }
  };
}

/**
 * Returns all service classifications.
 */
export function getAllServiceClassifications() {
  return Object.keys(CLASSIFICATION_PROFILES).map((slug) => classifyService(slug));
}

/**
 * Filters services by Industry key.
 */
export function getServicesByIndustry(industryKey) {
  if (!industryKey) return [];
  const cleanKey = String(industryKey).trim().toLowerCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.industries.some((ind) => ind.key === cleanKey)
  );
}

/**
 * Filters services by Problem key.
 */
export function getServicesByProblem(problemKey) {
  if (!problemKey) return [];
  const cleanKey = String(problemKey).trim().toLowerCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.problems.some((prob) => prob.key === cleanKey)
  );
}

/**
 * Filters services by Use Case key.
 */
export function getServicesByUseCase(useCaseKey) {
  if (!useCaseKey) return [];
  const cleanKey = String(useCaseKey).trim().toLowerCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.useCases.some((uc) => uc.key === cleanKey)
  );
}

/**
 * Filters services by Audience key.
 */
export function getServicesByAudience(audienceKey) {
  if (!audienceKey) return [];
  const cleanKey = String(audienceKey).trim().toLowerCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.audienceTypes.includes(cleanKey)
  );
}

/**
 * Filters services by Commercial Intent level.
 */
export function getServicesByCommercialIntent(intent) {
  if (!intent) return [];
  const cleanIntent = String(intent).trim().toUpperCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.commercialIntents.includes(cleanIntent)
  );
}

/**
 * Filters services by Primary Category.
 */
export function getServicesByCategory(category) {
  if (!category) return [];
  const cleanCat = String(category).trim().toLowerCase();
  return getAllServiceClassifications().filter((svc) =>
    svc.primaryCategory.toLowerCase() === cleanCat ||
    svc.secondaryCategories.some((sc) => sc.toLowerCase() === cleanCat)
  );
}
