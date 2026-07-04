const quoteNote =
  "Pricing depends on project requirements, features, timeline, and scope. Book a call to discuss your project and receive a custom quote.";

const defaultProcessSteps = [
  {
    step: 1,
    title: "Requirement Discussion",
    description:
      "We clarify your goals, audience, current challenges, and the result your business needs.",
  },
  {
    step: 2,
    title: "Project Planning",
    description:
      "We map pages, features, integrations, content needs, and the practical build direction.",
  },
  {
    step: 3,
    title: "Design Direction",
    description:
      "We shape the visual structure, user flow, and interface style around your brand and audience.",
  },
  {
    step: 4,
    title: "Development",
    description:
      "We build the approved solution with responsive layouts, clean code, and scalable foundations.",
  },
  {
    step: 5,
    title: "Testing and Optimization",
    description:
      "We review mobile behavior, performance, forms, content, SEO basics, and key user flows.",
  },
  {
    step: 6,
    title: "Review and Revisions",
    description:
      "You review the work and we refine details based on agreed project scope and priorities.",
  },
  {
    step: 7,
    title: "Deployment Support",
    description:
      "We help prepare launch, deployment, domain setup, and handover details where required.",
  },
];

const defaultRequirements = [
  { title: "Business name", description: "Your brand or project name." },
  { title: "Logo if available", description: "Existing logo, brand files, or preferred style." },
  { title: "Page list", description: "The pages or sections you want included." },
  { title: "Website content", description: "Text, images, videos, and service details." },
  { title: "Reference websites", description: "Examples of websites or apps you like." },
  { title: "Contact details", description: "Email, phone, location, and social links." },
  { title: "Feature requirements", description: "Forms, dashboard, payments, API, CMS, or automation needs." },
  { title: "Domain/hosting details", description: "Existing domain, hosting, or deployment preference if available." },
];

const defaultFaqs = [
  {
    question: "How do I get started?",
    answer:
      "Share your project idea, business goals, current website if available, and any reference links. Muhyo Tech will guide the next practical step.",
  },
  {
    question: "Will my website be mobile responsive?",
    answer:
      "Yes. Responsive behavior is planned and tested so the experience works professionally across mobile, tablet, and desktop screens.",
  },
  {
    question: "Can you build an admin panel?",
    answer:
      "Yes. If your project needs content management, users, dashboards, or internal workflows, an admin panel can be included in the scope.",
  },
  {
    question: "Can you connect APIs or databases?",
    answer:
      "Yes. Projects can include MongoDB, external APIs, authentication, contact systems, uploads, automations, and third-party services.",
  },
  {
    question: "Do you help with deployment?",
    answer:
      "Yes. Deployment support, domain guidance, hosting setup, and launch checks can be included depending on the project.",
  },
  {
    question: "How is pricing decided?",
    answer:
      "Every project is different. After understanding requirements, features, timeline, and scope, Muhyo Tech provides a custom quote.",
  },
];

const defaultProblems = [
  {
    title: "Outdated digital presence",
    description:
      "Your current website or workflow does not create enough trust for modern visitors.",
    icon: "AlertTriangle",
  },
  {
    title: "Poor mobile experience",
    description:
      "Visitors struggle to browse, read, or take action from mobile devices.",
    icon: "Smartphone",
  },
  {
    title: "Weak lead flow",
    description:
      "Contact forms, calls to action, and conversion paths are unclear or unreliable.",
    icon: "MessageSquare",
  },
  {
    title: "Difficult content management",
    description:
      "Updating services, pages, projects, or business content takes too much manual effort.",
    icon: "ClipboardList",
  },
];

const makeItems = (items) =>
  items.map((item) =>
    typeof item === "string"
      ? { title: item, description: `${item} planned around your project scope.` }
      : item,
  );

const makeService = ({
  id,
  slug,
  title,
  category,
  icon = "Code",
  heroImage,
  shortDescription,
  overview,
  technologies,
  problemsSolved = defaultProblems,
  deliverables,
  features,
  benefits,
  keywords,
  sortOrder,
  legacySlugs = [],
}) => ({
  id,
  slug,
  legacySlugs,
  title,
  category,
  icon,
  heroImage,
  banner: heroImage,
  image: heroImage,
  shortDescription,
  description: shortDescription,
  fullDescription: overview,
  overview,
  problemsSolved,
  problemSolved: problemsSolved[0]?.description || shortDescription,
  deliverables: makeItems(deliverables),
  features: makeItems(features),
  benefits: makeItems(benefits),
  processSteps: defaultProcessSteps,
  process: defaultProcessSteps.map(({ title: stepTitle, description }) => ({
    title: stepTitle,
    description,
  })),
  technologies,
  techStack: technologies,
  clientRequirements: defaultRequirements,
  relatedProjects: [],
  faqs: defaultFaqs,
  faq: defaultFaqs,
  deliveryNote:
    "Timeline is confirmed after reviewing requirements, content, features, integrations, and launch goals.",
  quoteNote,
  ctaTitle: `Ready to discuss ${title}?`,
  ctaDescription:
    "Share your idea, business goal, or current website challenge and Muhyo Tech will guide you with the right solution.",
  ctaPrimaryText: "Book a Call",
  ctaSecondaryText: "View Related Work",
  seoTitle: `${title} | Muhyo Tech`,
  seoDescription: shortDescription,
  keywords,
  status: "published",
  publishStatus: "published",
  isFeatured: sortOrder <= 4,
  featured: sortOrder <= 4,
  sortOrder,
  order: sortOrder,
});

export const servicesSeedData = [
  makeService({
    id: 1,
    slug: "custom-website-development",
    legacySlugs: ["web-development"],
    title: "Custom Website Development",
    category: "Web Development",
    icon: "Layout",
    heroImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
    shortDescription:
      "Modern custom websites for businesses, professionals, and startups with responsive design, clean structure, and scalable functionality.",
    overview:
      "Custom website development helps businesses, professionals, and startups build a modern online presence with responsive design, clean structure, SEO-ready pages, and scalable frontend/backend functionality.",
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Node.js", "MongoDB", "Vercel", "Cloudinary", "REST APIs"],
    deliverables: ["Responsive website layout", "Modern UI sections", "Contact form integration", "SEO-ready page structure", "Performance-focused setup", "Deployment support", "Admin panel if required", "Database/API integration if required"],
    features: ["Custom page structure", "Mobile-first UI", "Lead capture forms", "Reusable content sections", "Analytics-ready setup"],
    benefits: ["Better first impression", "More trust from visitors", "Improved mobile experience", "Easier lead generation", "Scalable website foundation", "Professional brand presence"],
    keywords: ["custom website development", "business website", "Next.js website", "responsive web design"],
    sortOrder: 1,
  }),
  makeService({
    id: 2,
    slug: "mern-stack-web-development",
    title: "MERN Stack Web Development",
    category: "Full-Stack Development",
    icon: "Server",
    heroImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Full-stack web applications using MongoDB, Express.js, React.js, and Node.js for practical business workflows.",
    overview:
      "MERN stack development gives your business a complete JavaScript foundation for dashboards, portals, APIs, authentication, content management, and database-driven product features.",
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js", "JWT", "REST APIs", "Socket.io", "Cloudinary"],
    deliverables: ["Database schema", "Backend API", "React frontend", "Authentication flow", "Admin dashboard", "Deployment setup"],
    features: ["User accounts", "Role-based access", "CRUD management", "File uploads", "Realtime-ready architecture"],
    benefits: ["Single-stack maintainability", "Flexible database structure", "Faster feature delivery", "Clear admin workflows", "Room for product growth"],
    keywords: ["MERN stack developer", "MongoDB React Node", "full stack web app", "Express API"],
    sortOrder: 2,
  }),
  makeService({
    id: 3,
    slug: "nextjs-website-development",
    title: "Next.js Website Development",
    category: "Frontend Engineering",
    icon: "Zap",
    heroImage:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop",
    shortDescription:
      "Fast, SEO-friendly Next.js websites built for professional presentation, strong performance, and smooth user journeys.",
    overview:
      "Next.js website development helps brands launch fast pages, server-rendered content, SEO metadata, structured routes, image optimization, and production-ready deployment on modern hosting.",
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Server Components", "Vercel", "SEO Metadata", "ISR"],
    deliverables: ["Next.js app structure", "SEO metadata", "Optimized images", "Responsive UI", "Dynamic routes", "Deployment support"],
    features: ["Server rendering", "Static generation", "Fast routing", "Structured SEO", "Performance-minded components"],
    benefits: ["Better search visibility", "Faster loading experience", "Professional frontend foundation", "Scalable page architecture", "Strong launch readiness"],
    keywords: ["Next.js developer", "Next.js website", "SEO website", "React website development"],
    sortOrder: 3,
  }),
  makeService({
    id: 4,
    slug: "full-stack-web-app-development",
    legacySlugs: ["mobile-app-development"],
    title: "Full-Stack Web App Development",
    category: "Product Development",
    icon: "Rocket",
    heroImage:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Custom web applications with frontend, backend, database, authentication, dashboards, and practical automation.",
    overview:
      "Full-stack web app development turns your product idea or business workflow into a usable application with clean frontend screens, secure backend logic, database models, and admin controls.",
    technologies: ["Next.js", "React.js", "Node.js", "MongoDB", "Mongoose", "REST APIs", "Redis", "Socket.io"],
    deliverables: ["Product architecture", "Frontend interface", "Backend API", "Database models", "Admin controls", "Testing and deployment"],
    features: ["Authentication", "Dashboards", "Database workflows", "API integrations", "Automated notifications"],
    benefits: ["One connected system", "Reduced manual work", "Better operational visibility", "Secure data handling", "Scalable product base"],
    keywords: ["full stack web app", "custom web application", "SaaS development", "admin dashboard"],
    sortOrder: 4,
  }),
  makeService({
    id: 5,
    slug: "admin-dashboard-development",
    title: "Admin Dashboard Development",
    category: "Admin Systems",
    icon: "Monitor",
    heroImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Secure admin dashboards for managing content, users, messages, projects, bookings, analytics, and business operations.",
    overview:
      "Admin dashboard development gives your team a controlled place to manage website content, service data, leads, users, permissions, analytics, and day-to-day operations.",
    technologies: ["Next.js", "MongoDB", "Mongoose", "Zustand", "React Hook Form", "Zod", "Recharts", "Socket.io"],
    deliverables: ["Admin layout", "Data tables", "Add/edit forms", "Role permissions", "Analytics cards", "Activity logging"],
    features: ["CRUD tools", "Search and filters", "Status workflow", "Realtime updates", "Secure admin routes"],
    benefits: ["Easier content control", "Fewer manual updates", "Better visibility", "Secure management", "Professional internal workflow"],
    keywords: ["admin dashboard development", "CMS dashboard", "Next.js admin panel", "business dashboard"],
    sortOrder: 5,
  }),
  makeService({
    id: 6,
    slug: "e-commerce-website-development",
    title: "E-commerce Website Development",
    category: "Commerce",
    icon: "ShoppingCart",
    heroImage:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Professional online stores with product presentation, cart flow, checkout planning, inventory needs, and admin controls.",
    overview:
      "E-commerce website development helps businesses present products clearly, guide shoppers through a smooth buying journey, and manage store content from a practical admin system.",
    technologies: ["Next.js", "React.js", "MongoDB", "Stripe or local payments", "Cloudinary", "REST APIs", "Analytics"],
    deliverables: ["Product catalog", "Product detail pages", "Cart/checkout planning", "Admin product management", "Order workflow", "Deployment support"],
    features: ["Product filters", "Gallery uploads", "Customer forms", "Order status", "SEO-friendly product pages"],
    benefits: ["Cleaner buying journey", "Better product trust", "Easier store management", "Mobile-ready shopping", "Scalable commerce foundation"],
    keywords: ["ecommerce website", "online store development", "Next.js ecommerce", "product catalog website"],
    sortOrder: 6,
  }),
  makeService({
    id: 7,
    slug: "portfolio-website-development",
    title: "Portfolio Website Development",
    category: "Personal Branding",
    icon: "BadgeCheck",
    heroImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
    shortDescription:
      "Professional portfolio websites for freelancers, founders, creators, and service providers who need stronger online credibility.",
    overview:
      "Portfolio website development presents your services, projects, skills, story, testimonials, and contact paths in a polished experience designed to build trust quickly.",
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Framer Motion", "Cloudinary", "SEO Metadata"],
    deliverables: ["Home page", "Services section", "Projects portfolio", "About/profile section", "Contact flow", "SEO setup"],
    features: ["Project cards", "Service pages", "Animated sections", "Responsive layout", "Lead-focused CTA"],
    benefits: ["Stronger personal brand", "More professional trust", "Better project presentation", "Clear contact journey", "Easy future updates"],
    keywords: ["portfolio website", "developer portfolio", "freelancer website", "personal brand website"],
    sortOrder: 7,
  }),
  makeService({
    id: 8,
    slug: "landing-page-design",
    legacySlugs: ["ui-ux-design"],
    title: "Landing Page Design",
    category: "Conversion Design",
    icon: "MousePointerClick",
    heroImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    shortDescription:
      "Focused landing pages for campaigns, products, offers, and lead generation with clear messaging and conversion paths.",
    overview:
      "Landing page design helps you explain one offer clearly, support it with trust signals, and guide visitors toward booking, messaging, subscribing, or submitting a lead form.",
    technologies: ["Next.js", "React.js", "Tailwind CSS", "Analytics", "SEO Metadata", "Form integrations"],
    deliverables: ["Hero section", "Offer sections", "Trust blocks", "Lead form", "CTA flow", "Mobile optimization"],
    features: ["Conversion-focused layout", "Fast loading", "Clean copy structure", "Lead capture", "Analytics-ready events"],
    benefits: ["Clearer offer", "More focused traffic path", "Better lead capture", "Faster campaign launch", "Professional first impression"],
    keywords: ["landing page design", "lead generation page", "conversion landing page", "campaign website"],
    sortOrder: 8,
  }),
  makeService({
    id: 9,
    slug: "website-redesign",
    title: "Website Redesign",
    category: "Website Improvement",
    icon: "Palette",
    heroImage:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Redesign outdated websites with modern visuals, clearer structure, better mobile behavior, and stronger conversion flow.",
    overview:
      "Website redesign improves the look, structure, usability, and trust of an existing website while keeping important content, slugs, SEO value, and business goals in mind.",
    technologies: ["Next.js", "React.js", "Tailwind CSS", "SEO Audit", "Performance Review", "Cloudinary"],
    deliverables: ["Current site review", "New visual direction", "Responsive rebuild", "Content cleanup", "SEO preservation", "Launch support"],
    features: ["Modern UI", "Navigation cleanup", "Mobile refinement", "CTA improvements", "Image optimization"],
    benefits: ["Fresh brand impression", "Better visitor trust", "Improved mobile usability", "Clearer content hierarchy", "More confident launch"],
    keywords: ["website redesign", "modern website redesign", "responsive redesign", "website improvement"],
    sortOrder: 9,
  }),
  makeService({
    id: 10,
    slug: "api-integration",
    legacySlugs: ["api-development"],
    title: "API Integration",
    category: "Backend Integration",
    icon: "PlugZap",
    heroImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
    shortDescription:
      "Connect websites and apps with third-party APIs, internal systems, forms, email tools, uploads, payments, and automation flows.",
    overview:
      "API integration connects your application with the services it depends on, such as email, payment, CRM, analytics, file storage, authentication, AI, or internal business systems.",
    technologies: ["REST APIs", "Node.js", "Next.js API Routes", "Webhooks", "OAuth", "Zod", "Redis"],
    deliverables: ["API connection", "Validation", "Error handling", "Webhook setup", "Secure env usage", "Integration testing"],
    features: ["Third-party services", "Webhook listeners", "Data sync", "Secure requests", "Retry-friendly workflows"],
    benefits: ["Less manual work", "Connected operations", "More reliable data flow", "Better user experience", "Room for automation"],
    keywords: ["API integration", "third party API", "webhooks", "Next.js API integration"],
    sortOrder: 10,
  }),
  makeService({
    id: 11,
    slug: "database-integration",
    title: "Database Integration",
    category: "Data Systems",
    icon: "Database",
    heroImage:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop",
    shortDescription:
      "Plan and connect database-backed features for content, users, leads, bookings, products, dashboards, and custom workflows.",
    overview:
      "Database integration gives your website or application a reliable way to store, organize, update, and retrieve business data through secure models and clear admin workflows.",
    technologies: ["MongoDB", "Mongoose", "Indexes", "Next.js", "Node.js", "Validation", "Caching"],
    deliverables: ["Schema design", "Mongoose models", "CRUD APIs", "Admin forms", "Data validation", "Query optimization"],
    features: ["Structured collections", "Search/filter support", "Status fields", "Relationships", "Safe serialization"],
    benefits: ["Organized business data", "Reliable content management", "Faster admin workflows", "Better reporting potential", "Scalable foundation"],
    keywords: ["database integration", "MongoDB integration", "Mongoose schema", "database-backed website"],
    sortOrder: 11,
  }),
  makeService({
    id: 12,
    slug: "seo-friendly-website-setup",
    legacySlugs: ["seo-digital-growth"],
    title: "SEO-Friendly Website Setup",
    category: "SEO",
    icon: "TrendingUp",
    heroImage:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?q=80&w=2074&auto=format&fit=crop",
    shortDescription:
      "Set up technical SEO foundations with metadata, structured content, fast pages, clean URLs, sitemap, robots, and search-ready pages.",
    overview:
      "SEO-friendly website setup improves the technical and content structure that helps search engines understand your website and helps visitors find relevant pages faster.",
    technologies: ["Next.js Metadata", "Sitemap", "Robots.txt", "Schema.org", "Core Web Vitals", "Analytics"],
    deliverables: ["Metadata setup", "Canonical URLs", "Open Graph tags", "Sitemap/robots", "Structured data", "SEO content structure"],
    features: ["Clean slugs", "Search snippets", "Social previews", "Performance checks", "Indexing readiness"],
    benefits: ["Better search foundation", "Cleaner page previews", "Improved content clarity", "More discoverable services", "Stronger long-term visibility"],
    keywords: ["SEO website setup", "technical SEO", "Next.js SEO", "SEO-friendly website"],
    sortOrder: 12,
  }),
  makeService({
    id: 13,
    slug: "website-speed-optimization",
    title: "Website Speed Optimization",
    category: "Performance",
    icon: "Gauge",
    heroImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    shortDescription:
      "Improve website loading, image delivery, bundle behavior, route performance, and user experience across devices.",
    overview:
      "Website speed optimization reviews and improves the factors that slow down user experience, including images, rendering, JavaScript, caching, fonts, and route-level behavior.",
    technologies: ["Next.js Image", "Caching", "Lazy Loading", "Bundle Review", "Core Web Vitals", "Vercel"],
    deliverables: ["Performance audit", "Image optimization", "Caching review", "Frontend cleanup", "Loading improvements", "Launch recommendations"],
    features: ["Faster images", "Reduced layout shift", "Cleaner loading states", "Better mobile performance", "Route-level review"],
    benefits: ["Faster visitor experience", "Lower bounce risk", "Better trust", "Improved SEO signals", "Smoother browsing"],
    keywords: ["website speed optimization", "Core Web Vitals", "Next.js performance", "page speed improvement"],
    sortOrder: 13,
  }),
  makeService({
    id: 14,
    slug: "maintenance-support",
    legacySlugs: ["cloud-devops"],
    title: "Maintenance & Support",
    category: "Ongoing Support",
    icon: "ShieldCheck",
    heroImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    shortDescription:
      "Ongoing website support for updates, fixes, content changes, monitoring, backups, improvements, and technical guidance.",
    overview:
      "Maintenance and support keeps your website healthier after launch through practical updates, issue fixes, content assistance, performance checks, and planned improvements.",
    technologies: ["Next.js", "MongoDB", "Vercel", "Cloudinary", "Monitoring", "Security Checks"],
    deliverables: ["Bug fixes", "Content updates", "Technical checks", "Performance review", "Backup guidance", "Improvement planning"],
    features: ["Issue triage", "Small enhancements", "Dependency awareness", "Form checks", "Launch support"],
    benefits: ["Less technical stress", "More reliable website", "Faster fixes", "Continued improvement", "Longer site lifespan"],
    keywords: ["website maintenance", "website support", "Next.js support", "portfolio support"],
    sortOrder: 14,
  }),
];

export default servicesSeedData;
