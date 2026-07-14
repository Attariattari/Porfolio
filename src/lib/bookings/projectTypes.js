const DEFAULT_PROJECT_TYPES = [
  "New project from scratch",
  "Improve an existing project",
  "Fix or complete an existing project",
  "Consultation and planning",
];

const PROJECT_TYPES_BY_SLUG = {
  "custom-website-development": [
    "Business website",
    "Corporate website",
    "Service-based website",
    "Startup website",
    "Custom multi-page website",
  ],
  "mern-stack-web-development": [
    "New MERN web application",
    "Customer or client portal",
    "Internal business system",
    "Existing MERN app improvement",
    "MERN bug fixing and completion",
  ],
  "nextjs-website-development": [
    "New Next.js website",
    "SEO-focused marketing website",
    "Dynamic content website",
    "Existing site migration to Next.js",
    "Next.js website improvement",
  ],
  "full-stack-web-app-development": [
    "SaaS or subscription platform",
    "Business workflow application",
    "Customer portal",
    "Marketplace or directory",
    "Custom product MVP",
  ],
  "admin-dashboard-development": [
    "Content management dashboard",
    "Analytics and reporting dashboard",
    "Bookings or lead management dashboard",
    "User and role management dashboard",
    "Custom operations dashboard",
  ],
  "e-commerce-website-development": [
    "New online store",
    "Product catalog website",
    "Single-vendor e-commerce store",
    "Existing store redesign",
    "Custom ordering system",
  ],
  "portfolio-website-development": [
    "Developer portfolio",
    "Freelancer portfolio",
    "Creative professional portfolio",
    "Founder or personal brand website",
    "Agency portfolio",
  ],
  "landing-page-design": [
    "Lead generation landing page",
    "Product launch landing page",
    "Service landing page",
    "Event or campaign landing page",
    "Waitlist or pre-launch page",
  ],
  "website-redesign": [
    "Complete visual redesign",
    "Mobile and responsive redesign",
    "Conversion-focused redesign",
    "Navigation and content restructure",
    "Modern frontend rebuild",
  ],
  "api-integration": [
    "Payment gateway integration",
    "Authentication or OAuth integration",
    "CRM or email integration",
    "AI service integration",
    "Custom third-party API integration",
  ],
  "database-integration": [
    "New database setup",
    "Existing database integration",
    "Database schema and API design",
    "Data migration or cleanup",
    "Admin CRUD workflow",
  ],
  "seo-friendly-website-setup": [
    "Technical SEO setup",
    "On-page SEO structure",
    "Local business SEO foundation",
    "SEO migration and preservation",
    "SEO audit and fixes",
  ],
  "website-speed-optimization": [
    "Core Web Vitals improvement",
    "Image and media optimization",
    "Next.js performance optimization",
    "Mobile speed improvement",
    "Complete performance audit and fixes",
  ],
  "maintenance-support": [
    "One-time fixes and updates",
    "Monthly website maintenance",
    "Content and feature updates",
    "Security and dependency maintenance",
    "Post-launch technical support",
  ],
};

const LEGACY_SLUGS = {
  "web-development": "custom-website-development",
  "mobile-app-development": "full-stack-web-app-development",
  "ui-ux-design": "landing-page-design",
  "api-development": "api-integration",
  "seo-digital-growth": "seo-friendly-website-setup",
  "cloud-devops": "maintenance-support",
};

export function getProjectTypesForService(service = {}) {
  const rawSlug = typeof service === "string" ? service : service.slug;
  const slug = LEGACY_SLUGS[rawSlug] || rawSlug;

  return PROJECT_TYPES_BY_SLUG[slug] || DEFAULT_PROJECT_TYPES;
}

