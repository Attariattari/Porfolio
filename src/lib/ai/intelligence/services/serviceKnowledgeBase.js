/**
 * Service Knowledge Base Registry & Engine
 * 
 * Provides a structured 360-degree knowledge profile for each Muhyo Tech service:
 * - What it is & Core definition
 * - Primary business problems solved
 * - Who needs it (Target Buyer Profiles)
 * - When they need it (Trigger Events)
 * - Benefits & Tangible Deliverables
 * - Delivery Process & Tech Stack
 * - Common Buyer Objections & Objections Handling
 * - High-Intent FAQs & Related Services
 * - Conversion Strategy & Contextual CTA triggers
 */

import { servicesSeedData } from "../../../../data/services.seed.js";

export const SERVICE_KNOWLEDGE_PROFILES = {
  "custom-website-development": {
    slug: "custom-website-development",
    title: "Custom Website Development",
    category: "Web Development",
    whatItIs: "Bespoke business websites engineered around brand positioning, responsive UX, fast page delivery, and qualified lead conversion.",
    problemsSolved: [
      "Outdated brand presence damaging online credibility",
      "Low lead conversion rates from generic website templates",
      "Poor mobile performance causing customer drop-offs",
      "Rigid CMS structure limiting business growth"
    ],
    whoNeedsIt: [
      { role: "Local Businesses", label: "Local Service Providers in Lahore & Pakistan needing stronger local lead flow." },
      { role: "Professional Services", label: "Consultants, law firms, clinics, agencies needing credibility-first web presentation." },
      { role: "Growing Startups", label: "Founders needing a clean, scalable web foundation ready for future feature expansion." }
    ],
    whenTheyNeedIt: [
      "Launching a new business or re-branding existing operations",
      "Preparing paid marketing/ad campaigns that require high conversion rates",
      "When an existing template website fails to rank or generate enquiries"
    ],
    commonObjections: [
      { objection: "Why not use a cheap website template or page builder?", response: "Templates introduce code bloat, slow page load speeds, weak security, and generic layouts. Custom web development gives full control over performance, SEO, integrations, and lead conversion." },
      { objection: "How long will a custom website build take?", response: "Typical builds range from 2 to 4 weeks depending on page scope, custom content, and specific feature integrations." }
    ],
    conversionStrategy: {
      primaryCtaText: "Book a Custom Web Strategy Call",
      secondaryCtaText: "Explore Custom Web Work",
      anchorTextOptions: ["custom website development in Lahore", "build a custom business website", "custom web development services"],
      idealSearchIntents: ["commercial", "transactional", "pricing"]
    }
  },

  "mern-stack-web-development": {
    slug: "mern-stack-web-development",
    title: "MERN Stack Web Development",
    category: "Full-Stack Development",
    whatItIs: "Full-stack web applications built with MongoDB, Express.js, React.js, and Node.js for custom workflows, APIs, and business portals.",
    problemsSolved: [
      "Fragmented software tools causing manual data entry overhead",
      "Lack of a centralized customer or operational portal",
      "Inability to handle complex relational business data efficiently"
    ],
    whoNeedsIt: [
      { role: "SaaS Platforms", label: "B2B SaaS founders requiring multi-tenant accounts, subscription workflows, and APIs." },
      { role: "Operational Teams", label: "Businesses replacing spreadsheets with custom web applications." }
    ],
    whenTheyNeedIt: [
      "When off-the-shelf software doesn't support custom business processes",
      "When building an MVP product for market validation"
    ],
    commonObjections: [
      { objection: "Is MERN stack scalable for long-term growth?", response: "Yes. JavaScript across the full stack enables fast API throughput, flexible MongoDB schemas, and modular React component architectures." }
    ],
    conversionStrategy: {
      primaryCtaText: "Consult with MERN Stack Engineers",
      secondaryCtaText: "View Full-Stack Projects",
      anchorTextOptions: ["MERN stack web application development", "hire MERN stack developers", "custom React & Node.js application"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "nextjs-website-development": {
    slug: "nextjs-website-development",
    title: "Next.js Website Development",
    category: "Frontend Engineering",
    whatItIs: "High-performance Next.js applications featuring Server Components, App Router, SSR/ISR rendering, and search-optimized technical architecture.",
    problemsSolved: [
      "Slow client-side React rendering hurting SEO rankings",
      "Complex routing and image delivery performance bottlenecks",
      "Weak Core Web Vitals scores in Google Search Console"
    ],
    whoNeedsIt: [
      { role: "SEO-Driven Brands", label: "Content platforms and service businesses competing for high Google rankings." },
      { role: "Modern Tech Brands", label: "Companies requiring fast React interactions without compromising search crawlability." }
    ],
    whenTheyNeedIt: [
      "Migrating from legacy React SPAs or WordPress to modern Next.js App Router",
      "Building a content-rich application that requires fast page loads and ISR"
    ],
    commonObjections: [
      { objection: "Isn't Next.js over-engineered for a business website?", response: "Next.js provides automatic image optimization, server rendering, route caching, and zero-bundle overhead for static content, making it ideal for competitive SEO." }
    ],
    conversionStrategy: {
      primaryCtaText: "Book Next.js Architecture Call",
      secondaryCtaText: "View Next.js Case Studies",
      anchorTextOptions: ["custom Next.js website development", "Next.js engineering services", "hire Next.js developers"],
      idealSearchIntents: ["commercial", "transactional", "technical"]
    }
  },

  "full-stack-web-app-development": {
    slug: "full-stack-web-app-development",
    title: "Full-Stack Web App Development",
    category: "Product Development",
    whatItIs: "End-to-end product engineering combining frontend UI, secure backend endpoints, database design, authentication, and deployment automation.",
    problemsSolved: [
      "Disconnected frontend and backend development teams",
      "Security vulnerabilities in user authentication and data access",
      "Manual deployment processes prone to production downtime"
    ],
    whoNeedsIt: [
      { role: "Product Founders", label: "Teams launching new digital web products from concept to launch." },
      { role: "Enterprise Teams", label: "Companies digitizing customer-facing operational tools." }
    ],
    whenTheyNeedIt: [
      "Building a complex custom platform with user roles, payments, and dashboards",
      "Upgrading fragile legacy software to modern cloud architecture"
    ],
    commonObjections: [
      { objection: "Can we build an MVP first?", response: "Yes. We prioritize a lean core MVP focusing on essential user journeys while maintaining clean architecture for future feature scaling." }
    ],
    conversionStrategy: {
      primaryCtaText: "Discuss Web App Scope",
      secondaryCtaText: "Review Product Portfolio",
      anchorTextOptions: ["full-stack web app development", "custom web application engineering", "build a scalable web product"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "admin-dashboard-development": {
    slug: "admin-dashboard-development",
    title: "Admin Dashboard Development",
    category: "Admin Systems",
    whatItIs: "Custom operational administrative dashboards for managing users, content, leads, bookings, analytics, permissions, and internal workflows.",
    problemsSolved: [
      "Time-consuming manual database edits and developer dependencies for content updates",
      "Lack of real-time visibility into business leads, orders, or user activities",
      "Security risks from un-gated staff access to raw database systems"
    ],
    whoNeedsIt: [
      { role: "Operations Managers", label: "Teams needing clear data tables, status workflows, and audit logging." },
      { role: "Content & Marketing Teams", label: "Staff publishing and managing services, projects, and media." }
    ],
    whenTheyNeedIt: [
      "When business lead volume exceeds manual tracking capabilities",
      "When role-based access control is required for staff operations"
    ],
    commonObjections: [
      { objection: "Can an admin dashboard connect to our existing database?", response: "Yes. We integrate custom dashboards with existing MongoDB, REST APIs, and authentication providers safely." }
    ],
    conversionStrategy: {
      primaryCtaText: "Build Custom Admin Panel",
      secondaryCtaText: "Explore Dashboard Features",
      anchorTextOptions: ["custom admin dashboard development", "build a business management panel", "Next.js admin dashboard"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "e-commerce-website-development": {
    slug: "e-commerce-website-development",
    title: "E-commerce Website Development",
    category: "Commerce",
    whatItIs: "Custom online stores engineered for fast product discovery, seamless cart & checkout journeys, secure payment gateway integrations, and order management.",
    problemsSolved: [
      "High checkout abandonment caused by slow or complex purchasing steps",
      "Inflexible product catalog filtering and search options",
      "Difficulty connecting local and international payment gateways"
    ],
    whoNeedsIt: [
      { role: "Retail Brands", label: "Merchants expanding physical product lines into direct-to-consumer online stores." },
      { role: "Digital Brands", label: "E-commerce stores needing fast custom storefronts." }
    ],
    whenTheyNeedIt: [
      "Outgrowing basic store platforms that restrict custom checkout workflows",
      "Preparing for high-volume promotional or holiday sales traffic"
    ],
    commonObjections: [
      { objection: "Can local payment methods like JazzCash, EasyPaisa, or Stripe be integrated?", response: "Yes. We connect approved local and international payment gateways with secure checkout validation." }
    ],
    conversionStrategy: {
      primaryCtaText: "Discuss E-commerce Store Scope",
      secondaryCtaText: "View E-commerce Projects",
      anchorTextOptions: ["e-commerce website development", "build a custom online store", "scalable e-commerce platform"],
      idealSearchIntents: ["commercial", "transactional", "pricing"]
    }
  },

  "portfolio-website-development": {
    slug: "portfolio-website-development",
    title: "Portfolio Website Development",
    category: "Personal Branding",
    whatItIs: "Credibility-focused personal portfolio websites for freelancers, founders, creators, and agency specialists seeking higher-value clients.",
    problemsSolved: [
      "Scattered project proof hurting professional credibility",
      "Difficulty standing out in competitive client bidding environments",
      "Lack of a direct, high-trust client enquiry channel"
    ],
    whoNeedsIt: [
      { role: "Freelancers & Consultants", label: "Independent professionals needing a high-trust digital presentation." },
      { role: "Founders & Executives", label: "Leaders building personal brand authority and media presence." }
    ],
    whenTheyNeedIt: [
      "Transitioning to high-ticket consulting or enterprise freelancing",
      "Updating personal brand assets for public speaking or investor outreach"
    ],
    commonObjections: [
      { objection: "Can I add new projects myself after launch?", response: "Yes. Portfolios can include an easy content management panel or structured data update workflow." }
    ],
    conversionStrategy: {
      primaryCtaText: "Build Your Portfolio Website",
      secondaryCtaText: "See Portfolio Designs",
      anchorTextOptions: ["custom portfolio website development", "professional personal portfolio", "freelancer portfolio site"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "landing-page-design": {
    slug: "landing-page-design",
    title: "Landing Page Design",
    category: "Conversion Design",
    whatItIs: "High-converting, single-offer landing pages designed to maximize ad campaign ROI, lead generation, product launches, or consultation bookings.",
    problemsSolved: [
      "Wasted ad spend from sending traffic to generic homepages",
      "Confusing page messaging leading to low submission rates",
      "Slow landing page load speeds increasing bounce rates"
    ],
    whoNeedsIt: [
      { role: "Campaign Managers", label: "Businesses running Google/Social ad campaigns needing focused conversion destinations." },
      { role: "Product Managers", label: "Teams launching new product waitlists or promotional offers." }
    ],
    whenTheyNeedIt: [
      "Launching a paid advertising campaign",
      "Testing value propositions for a new product or service offer"
    ],
    commonObjections: [
      { objection: "Can landing pages integrate with our CRM or email software?", response: "Yes. Webhook, CRM, Nodemailer, and analytics event tracking are built directly into the page." }
    ],
    conversionStrategy: {
      primaryCtaText: "Design a High-Converting Landing Page",
      secondaryCtaText: "View Landing Page Case Studies",
      anchorTextOptions: ["landing page design in Lahore", "build a high-converting landing page", "lead generation landing page"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "website-redesign": {
    slug: "website-redesign",
    title: "Website Redesign",
    category: "Website Improvement",
    whatItIs: "Modernization of outdated websites to improve visuals, mobile responsiveness, performance, and lead conversion while protecting existing SEO value.",
    problemsSolved: [
      "Dated website design creating negative initial impressions",
      "Poor mobile user experience frustrating smartphone visitors",
      "Loss of search engine traffic due to improper site migrations in the past"
    ],
    whoNeedsIt: [
      { role: "Established Businesses", label: "Companies with sites built 3-5+ years ago needing modern frontend UI." },
      { role: "Brands Re-positioning", label: "Businesses shifting towards higher-value client tiers." }
    ],
    whenTheyNeedIt: [
      "When mobile visitors abandon key pages due to bad UX",
      "When re-branding or updating core service offerings"
    ],
    commonObjections: [
      { objection: "Will a website redesign destroy our current Google rankings?", response: "No. We perform strict SEO preservation, inventorying existing URLs, maintaining canonical paths, and setting up proper 301 redirects." }
    ],
    conversionStrategy: {
      primaryCtaText: "Plan a Website Redesign",
      secondaryCtaText: "See Before/After Transformations",
      anchorTextOptions: ["website redesign services in Lahore", "modernize your website UX", "conversion-focused website redesign"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "api-integration": {
    slug: "api-integration",
    title: "API Integration",
    category: "Backend Integration",
    whatItIs: "Dependable connection of web apps with third-party APIs, payment gateways, CRMs, webhooks, authentication providers, and internal software.",
    problemsSolved: [
      "Unreliable data sync between website forms and internal CRMs",
      "Failed payment callbacks and missing webhook events",
      "Security vulnerabilities from exposed API keys or un-validated inputs"
    ],
    whoNeedsIt: [
      { role: "Operations & Product Teams", label: "Companies connecting third-party platforms (Stripe, Cloudinary, OpenAI, Mailchimp)." }
    ],
    whenTheyNeedIt: [
      "Automating manual data flows between disconnected business tools",
      "Integrating AI services or cloud storage into existing applications"
    ],
    commonObjections: [
      { objection: "What if third-party APIs experience downtime?", response: "We implement defensive error handling, request retries, rate-limiting safeguards, and logging mechanisms." }
    ],
    conversionStrategy: {
      primaryCtaText: "Book API Integration Consult",
      secondaryCtaText: "View Integration Scope",
      anchorTextOptions: ["API integration developer in Pakistan", "third-party API integration", "Next.js API integration"],
      idealSearchIntents: ["commercial", "transactional", "technical"]
    }
  },

  "database-integration": {
    slug: "database-integration",
    title: "Database Integration",
    category: "Data Systems",
    whatItIs: "Architecture, indexing, CRUD endpoints, and secure Mongoose/MongoDB data integration for reliable content and user workflows.",
    problemsSolved: [
      "Slow database queries causing sluggish website response times",
      "Poor schema design leading to duplicated data and inconsistencies",
      "Risky manual data manipulation without proper validation"
    ],
    whoNeedsIt: [
      { role: "Data-Driven Web Apps", label: "Platforms storing user accounts, content catalogs, bookings, or analytics." }
    ],
    whenTheyNeedIt: [
      "Scaling database performance for growing traffic",
      "Migrating legacy static content into a structured database"
    ],
    commonObjections: [
      { objection: "Can MongoDB handle relational data structure needs?", response: "Yes. With proper Mongoose schema modeling, references, and indexed queries, MongoDB delivers exceptional speed and flexibility." }
    ],
    conversionStrategy: {
      primaryCtaText: "Consult Database Engineers",
      secondaryCtaText: "View Database Services",
      anchorTextOptions: ["database integration services in Pakistan", "MongoDB database developer", "custom database integration"],
      idealSearchIntents: ["commercial", "transactional", "technical"]
    }
  },

  "seo-friendly-website-setup": {
    slug: "seo-friendly-website-setup",
    title: "SEO-Friendly Website Setup",
    category: "SEO",
    whatItIs: "Technical SEO setup ensuring search engine crawlability, clean metadata, canonical tags, sitemaps, Schema.org JSON-LD, and Google Search Console readiness.",
    problemsSolved: [
      "Pages not indexing properly in Google Search Console",
      "Duplicate content issues due to missing canonical tags",
      "Weak search result snippet previews on search engines and social platforms"
    ],
    whoNeedsIt: [
      { role: "New Website Launches", label: "Businesses launching new sites needing search-ready technical setup." },
      { role: "Next.js Applications", label: "React platforms fixing SSR metadata and rendering issues." }
    ],
    whenTheyNeedIt: [
      "Launching a new domain or web platform",
      "Fixing indexing and Core Web Vitals warnings in Search Console"
    ],
    commonObjections: [
      { objection: "Does technical SEO guarantee #1 rankings?", response: "Technical SEO removes crawl barriers and establishes search engine understanding. High rankings also depend on content quality, intent match, and topical authority." }
    ],
    conversionStrategy: {
      primaryCtaText: "Get Technical SEO Setup",
      secondaryCtaText: "View Technical SEO Services",
      anchorTextOptions: ["SEO-friendly website setup in Lahore", "technical SEO setup", "Next.js SEO foundation"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  },

  "website-speed-optimization": {
    slug: "website-speed-optimization",
    title: "Website Speed Optimization",
    category: "Performance",
    whatItIs: "Comprehensive audit and performance optimization targeting heavy media, JavaScript bundles, rendering delays, and Core Web Vitals (LCP, CLS, INP).",
    problemsSolved: [
      "High bounce rates caused by slow loading page speed",
      "Failed Core Web Vitals benchmarks hurting mobile rankings",
      "Large un-optimized image assets delaying main content delivery"
    ],
    whoNeedsIt: [
      { role: "Image-Heavy Portfolios", label: "Designers, agencies, and e-commerce platforms with large media catalogs." },
      { role: "Slow Web Platforms", label: "Companies losing leads due to sluggish site performance." }
    ],
    whenTheyNeedIt: [
      "Failing Google PageSpeed Insights benchmarks",
      "Experiencing high mobile bounce rates on key service pages"
    ],
    commonObjections: [
      { objection: "Will optimization alter the visual design of our website?", response: "No. Speed optimization focuses on asset compression, code splitting, caching, and lazy loading without changing your visual design." }
    ],
    conversionStrategy: {
      primaryCtaText: "Book a Speed Optimization Audit",
      secondaryCtaText: "View Performance Results",
      anchorTextOptions: ["website speed optimization in Pakistan", "Core Web Vitals optimization", "optimize Next.js website speed"],
      idealSearchIntents: ["commercial", "transactional", "technical"]
    }
  },

  "maintenance-support": {
    slug: "maintenance-support",
    title: "Maintenance & Support",
    category: "Ongoing Support",
    whatItIs: "Ongoing technical support, bug fixing, dependency updates, performance monitoring, content updates, and post-launch technical assistance.",
    problemsSolved: [
      "Un-monitored website bugs causing silent lead losses",
      "Outdated software dependencies creating security vulnerabilities",
      "Lack of an in-house developer for routine updates and enhancements"
    ],
    whoNeedsIt: [
      { role: "Busy Business Owners", label: "Companies wanting a reliable developer contact for ongoing site maintenance." },
      { role: "Active Web Platforms", label: "Sites requiring continuous updates and security checks." }
    ],
    whenTheyNeedIt: [
      "Immediately after launching a new website",
      "When experiencing frequent technical issues without developer support"
    ],
    commonObjections: [
      { objection: "Can you maintain a website built by another developer?", response: "Yes, following an initial code audit to review architecture, security, dependencies, and hosting setup." }
    ],
    conversionStrategy: {
      primaryCtaText: "Get Ongoing Maintenance Support",
      secondaryCtaText: "View Maintenance Plans",
      anchorTextOptions: ["website maintenance and support in Pakistan", "ongoing web support", "Next.js technical support"],
      idealSearchIntents: ["commercial", "transactional"]
    }
  }
};

/**
 * Returns Knowledge Base profile for a given service slug.
 */
export function getServiceKnowledgeProfile(slug = "") {
  if (!slug) return null;
  return SERVICE_KNOWLEDGE_PROFILES[slug] || null;
}

/**
 * Returns all Service Knowledge Base profiles.
 */
export function getAllServiceKnowledgeProfiles() {
  return Object.values(SERVICE_KNOWLEDGE_PROFILES);
}
