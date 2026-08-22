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
    whyItHappens: "Using generic templates, outdated visual hierarchy, or unoptimized legacy code.",
    expectedOutcome: "Immediate improvement in brand authority, visitor trust, and perceived value.",
    icon: "AlertTriangle",
  },
  {
    title: "Poor mobile experience",
    description:
      "Visitors struggle to browse, read, or take action from mobile devices.",
    whyItHappens: "Rigid desktop-centric layouts, unoptimized touch targets, and viewport scaling bugs.",
    expectedOutcome: "Fluid, responsive touch UX across all smartphones with higher engagement.",
    icon: "Smartphone",
  },
  {
    title: "Weak lead flow",
    description:
      "Contact forms, calls to action, and conversion paths are unclear or unreliable.",
    whyItHappens: "Friction-heavy forms, lack of clear value proposition, and buried contact buttons.",
    expectedOutcome: "Measurable 2x–3x lift in qualified business inquiries and consultation requests.",
    icon: "MessageSquare",
  },
  {
    title: "Difficult content management",
    description:
      "Updating services, pages, projects, or business content takes too much manual effort.",
    whyItHappens: "No unified admin interface, forcing reliance on manual developer code edits.",
    expectedOutcome: "Full content independence for team members to update content in real-time.",
    icon: "ClipboardList",
  },
];

const problemsBySlug = {
  "custom-website-development": [
    {
      title: "Outdated brand presentation & low visitor trust",
      description: "We engineer a bespoke, modern interface with custom typography, clean themes, and premium micro-interactions.",
      whyItHappens: "Generic templates and cookie-cutter designs fail to convey credibility to modern discerning clients.",
      expectedOutcome: "Premium market positioning that commands higher client trust and commercial confidence.",
      icon: "ShieldCheck",
    },
    {
      title: "High drop-off rates on mobile devices",
      description: "We build with mobile-first fluid layouts, thumb-friendly navigation, and adaptive image assets.",
      whyItHappens: "Non-responsive layouts and slow mobile rendering cause over 60% of mobile visitors to bounce.",
      expectedOutcome: "Flawless mobile UX with 40%+ longer session duration across iOS and Android.",
      icon: "Smartphone",
    },
    {
      title: "Low lead conversion from passive visitors",
      description: "We architect frictionless high-converting funnel pathways, strategic sticky CTAs, and instant form validations.",
      whyItHappens: "Unclear value propositions and hidden contact options fail to guide visitors toward booking.",
      expectedOutcome: "Measurable 35–50% increase in qualified consultation bookings and inquiry submissions.",
      icon: "Target",
    },
    {
      title: "Rigid CMS structure limiting business growth",
      description: "We deliver a modular Next.js architecture that easily scales as you add new services, team members, or locations.",
      whyItHappens: "Legacy page builders lock businesses into slow, un-maintainable codebases that break during updates.",
      expectedOutcome: "Zero vendor lock-in with a future-proof, easily extensible code foundation.",
      icon: "Layers",
    },
  ],

  "mern-stack-web-development": [
    {
      title: "Disconnected software tools causing manual double-entry",
      description: "We build a unified MERN stack portal connecting database models, user roles, and business workflows.",
      whyItHappens: "Using multiple disconnected SaaS apps and spreadsheets creates data silos and human errors.",
      expectedOutcome: "Centralized single source of truth saving 15+ operational hours per week.",
      icon: "Database",
    },
    {
      title: "Slow database queries on large operational datasets",
      description: "We architect optimized MongoDB aggregation pipelines and compound indexes for sub-50ms data retrieval.",
      whyItHappens: "Un-indexed queries and poorly structured schema relationships cause severe database bottlenecks.",
      expectedOutcome: "Lightning-fast search, filter, and reporting performance even under high concurrency.",
      icon: "Zap",
    },
    {
      title: "Lack of secure role-based access for staff and clients",
      description: "We implement encrypted JWT authentication, HTTP-only cookies, and granular RBAC permission middleware.",
      whyItHappens: "Basic login systems expose sensitive data and lack multi-tier permission controls.",
      expectedOutcome: "Airtight data security and strict compliance with organizational privacy standards.",
      icon: "Lock",
    },
    {
      title: "Fragile third-party API integrations and webhook losses",
      description: "We build resilient Express.js REST/GraphQL endpoints with automated retries and webhook verification.",
      whyItHappens: "Unmonitored API calls fail silently without logging, causing missing payments or lead records.",
      expectedOutcome: "99.9% integration reliability with automated error logging and real-time alerts.",
      icon: "RefreshCw",
    },
  ],

  "nextjs-website-development": [
    {
      title: "Poor Google Core Web Vitals hurting SEO rankings",
      description: "We implement Next.js App Router Server Components with automatic image optimization and zero client bloat.",
      whyItHappens: "Heavy client-side JavaScript bundles delay Largest Contentful Paint (LCP) and First Input Delay.",
      expectedOutcome: "95+ PageSpeed score, green Core Web Vitals, and enhanced Google search crawlability.",
      icon: "Zap",
    },
    {
      title: "Slow initial page loads on legacy React SPAs",
      description: "We configure Incremental Static Regeneration (ISR) and Server-Side Rendering (SSR) for instant first render.",
      whyItHappens: "Client-only React apps force users to wait for large JavaScript bundles before showing any content.",
      expectedOutcome: "Sub-second 0ms perceived load times with pre-rendered HTML ready instantly.",
      icon: "Flame",
    },
    {
      title: "Missing structured metadata for search engine indexing",
      description: "We inject dynamic OpenGraph tags, JSON-LD Schema.org rich snippets, and automated XML sitemaps.",
      whyItHappens: "Search bots cannot easily parse client-rendered pages without explicit server-side metadata.",
      expectedOutcome: "Rich snippet search results and higher organic search engine click-through rates.",
      icon: "Search",
    },
    {
      title: "Complex image delivery and bandwidth costs",
      description: "We leverage Next.js Image optimization with automatic WebP/AVIF conversion and lazy loading.",
      whyItHappens: "Uncompressed raw PNG/JPEG images consume excessive bandwidth and slow down page speed.",
      expectedOutcome: "70%+ reduction in image file size with zero loss in visual sharpness.",
      icon: "Image",
    },
  ],

  "admin-dashboard-development": [
    {
      title: "Inefficient manual spreadsheets slowing down operations",
      description: "We build intuitive CRUD interfaces with real-time filters, search, and bulk actions.",
      whyItHappens: "Managing orders, messages, and inventory on loose spreadsheets causes data loss and confusion.",
      expectedOutcome: "Streamlined operational workflow allowing tasks to be completed in 1 click.",
      icon: "Table",
    },
    {
      title: "No real-time analytics to track business KPIs",
      description: "We integrate interactive charts, telemetry cards, and automated conversion metric tracking.",
      whyItHappens: "Operating without live dashboards makes it impossible to identify sales drops or user bottlenecks.",
      expectedOutcome: "Actionable executive visibility into daily revenue, active users, and lead conversion rates.",
      icon: "BarChart3",
    },
    {
      title: "Lack of granular permission controls for team members",
      description: "We build multi-role permissions (Super Admin, Editor, Viewer) with secure audit logs.",
      whyItHappens: "Sharing generic master credentials creates severe security and accidental deletion risks.",
      expectedOutcome: "Complete administrative control with transparent audit trails for every modification.",
      icon: "ShieldAlert",
    },
    {
      title: "Clunky, slow content and service catalog updates",
      description: "We develop custom rich-text editors and instant image uploaders powered by Cloudinary/S3.",
      whyItHappens: "Updating website content without an admin panel requires waiting for external developers.",
      expectedOutcome: "Total content independence to publish, edit, or remove pages within 30 seconds.",
      icon: "Edit3",
    },
  ],

  "e-commerce-website-development": [
    {
      title: "High shopping cart abandonment during checkout",
      description: "We design a frictionless 1-page checkout flow with guest ordering and instant address validation.",
      whyItHappens: "Complex multi-step checkout processes and unexpected fees cause over 70% of shoppers to abandon carts.",
      expectedOutcome: "25–40% increase in completed checkouts and reduced order drop-off rate.",
      icon: "ShoppingCart",
    },
    {
      title: "Insecure payment gateway integrations risking failed orders",
      description: "We integrate Stripe, PayPal, and local gateways with encrypted webhooks and instant SMS/Email receipts.",
      whyItHappens: "Unstable payment gateway connections result in charged customers without created orders.",
      expectedOutcome: "100% reliable transaction reconciliation and automated order fulfillment notifications.",
      icon: "CreditCard",
    },
    {
      title: "Cluttered mobile product catalog reducing sales conversions",
      description: "We craft fast product filters, high-resolution zoomable galleries, and sticky Add-to-Cart buttons.",
      whyItHappens: "Slow-loading product grids on mobile make browsing frustrating for potential buyers.",
      expectedOutcome: "Higher average order value (AOV) and smoother mobile shopping experience.",
      icon: "Smartphone",
    },
    {
      title: "Inventory and order tracking desynchronization",
      description: "We develop real-time stock management with low-stock alerts and automated status tracking.",
      whyItHappens: "Manual inventory tracking leads to overselling out-of-stock items and customer complaints.",
      expectedOutcome: "Automated inventory sync preventing stockouts and keeping customers informed.",
      icon: "PackageCheck",
    },
  ],

  "portfolio-website-development": [
    {
      title: "Weak personal brand credibility failing to attract premium clients",
      description: "We design high-impact hero sections, custom typography, and verified social proof showcases.",
      whyItHappens: "Generic portfolio themes look identical to thousands of other creators and fail to stand out.",
      expectedOutcome: "Authoritative personal brand that justifies premium rates and commands client respect.",
      icon: "Award",
    },
    {
      title: "Unclear showcase of skills, case studies, and achievements",
      description: "We architect detailed case study layouts with problem-solution breakdowns, metrics, and live demos.",
      whyItHappens: "Simple screenshot galleries fail to explain the real business value and problem-solving ability.",
      expectedOutcome: "Compelling project storytelling that proves your expertise to prospective clients.",
      icon: "FolderCheck",
    },
    {
      title: "Hidden contact pathways causing missed business opportunities",
      description: "We integrate sticky consultation booking widgets, direct WhatsApp links, and instant inquiry forms.",
      whyItHappens: "Burying contact details on a separate page creates unnecessary friction for busy recruiters and clients.",
      expectedOutcome: "Direct, effortless communication channel increasing inbound collaboration inquiries.",
      icon: "MessageCircle",
    },
    {
      title: "Slow-loading media assets giving an amateur impression",
      description: "We apply automated WebP conversion, responsive image sizing, and blur placeholder loading.",
      whyItHappens: "Heavy uncompressed project screenshots cause sluggish page scrolling and visual layout shifts.",
      expectedOutcome: "Silky smooth 60 FPS scrolling and instant project image previews.",
      icon: "Zap",
    },
  ],

  "landing-page-design": [
    {
      title: "Wasted ad spend on low-converting generic landing pages",
      description: "We engineer high-converting sales funnels built specifically for Google Ads and Meta campaign traffic.",
      whyItHappens: "Sending paid traffic to standard homepages dilutes message focus and creates high bounce rates.",
      expectedOutcome: "Significantly lower Cost Per Acquisition (CPA) and higher return on marketing spend.",
      icon: "TrendingUp",
    },
    {
      title: "Confusing value proposition failing to hook visitors in 5 seconds",
      description: "We craft crystal-clear headline hierarchy, trust badges, and prominent primary calls to action.",
      whyItHappens: "Visitors leave immediately if they cannot instantly grasp what you offer and how it benefits them.",
      expectedOutcome: "Immediate visitor engagement and higher scroll-through rate to conversion triggers.",
      icon: "Eye",
    },
    {
      title: "Overly long, friction-heavy lead capture forms",
      description: "We build progressive multi-step forms with micro-commitments and instant autofill support.",
      whyItHappens: "Asking for too much information upfront intimidates visitors and kills lead conversion.",
      expectedOutcome: "40%+ increase in lead form completion and higher quality inbound prospect data.",
      icon: "FormInput",
    },
    {
      title: "Slow page load times causing paid click drop-offs",
      description: "We optimize critical render path CSS, inline critical assets, and eliminate third-party render blockers.",
      whyItHappens: "Every 1-second delay in landing page load time reduces conversions by up to 20%.",
      expectedOutcome: "Under 800ms load time ensuring zero wasted ad budget from impatient visitors.",
      icon: "Zap",
    },
  ],

  "website-redesign": [
    {
      title: "Outdated visual aesthetic damaging brand reputation",
      description: "We perform a complete UI/UX overhaul aligned with modern luxury digital standards and brand goals.",
      whyItHappens: "Web design trends evolve rapidly; sites older than 3 years often look abandoned and un-trusted.",
      expectedOutcome: "Fresh, commanding modern aesthetic that rejuvenates market perception and buyer trust.",
      icon: "Sparkles",
    },
    {
      title: "Broken mobile responsiveness and legacy code vulnerabilities",
      description: "We rewrite the front-end with clean Next.js and Tailwind CSS for cross-device perfection.",
      whyItHappens: "Legacy templates accumulate outdated jQuery plugins and security vulnerabilities over time.",
      expectedOutcome: "100% responsive, secure, and modern codebase with zero legacy technical debt.",
      icon: "Smartphone",
    },
    {
      title: "Declining organic search rankings due to legacy structure",
      description: "We preserve existing SEO equity with 301 redirects, updated sitemaps, and improved schema markup.",
      whyItHappens: "Unplanned redesigns often break URL structures, resulting in devastating loss of organic traffic.",
      expectedOutcome: "Seamless SEO migration with ranking improvements and zero broken backlink 404s.",
      icon: "SearchCheck",
    },
    {
      title: "Low conversion rates compared to modern industry competitors",
      description: "We re-architect user journeys, improve CTA placement, and add conversion-focused social proof.",
      whyItHappens: "Competitors with modern, faster websites capture leads that could have been yours.",
      expectedOutcome: "Regained competitive advantage and a noticeable boost in online inquiries.",
      icon: "Target",
    },
  ],

  "api-integration": [
    {
      title: "Manual data copy-pasting between disconnected platforms",
      description: "We develop automated REST/GraphQL middleware pipelines to sync data seamlessly across services.",
      whyItHappens: "Operating separate tools without automation wastes hundreds of employee hours every month.",
      expectedOutcome: "100% automated real-time data synchronization with zero manual human effort.",
      icon: "Cpu",
    },
    {
      title: "Silent webhook failures causing missing orders or leads",
      description: "We build idempotent webhook receivers with retry queues, logging, and automated error notifications.",
      whyItHappens: "Standard endpoints fail during high-traffic spikes without saving unhandled payload events.",
      expectedOutcome: "Zero dropped transactions and complete auditability for every incoming API event.",
      icon: "Webhook",
    },
    {
      title: "Insecure API credentials and missing payload validation",
      description: "We implement environment secret encryption, HMAC signature verification, and Zod input sanitization.",
      whyItHappens: "Exposed API keys or un-sanitized inputs leave servers vulnerable to injection and abuse.",
      expectedOutcome: "Bank-grade API security protecting confidential customer and business data.",
      icon: "ShieldAlert",
    },
    {
      title: "System outages when third-party APIs change or rate limit",
      description: "We add exponential backoff retry algorithms, circuit breakers, and in-memory cache fallbacks.",
      whyItHappens: "Hard dependencies on external APIs cause your entire app to crash when their servers go down.",
      expectedOutcome: "High fault-tolerance keeping your website operational even during third-party downtime.",
      icon: "Layers",
    },
  ],

  "database-integration": [
    {
      title: "Unstructured database schemas causing data corruption",
      description: "We architect typed Mongoose schemas with strict validations, unique constraints, and relationships.",
      whyItHappens: "Ad-hoc database writes without validation lead to missing fields and broken application states.",
      expectedOutcome: "100% data integrity, clean migrations, and predictable application state.",
      icon: "Database",
    },
    {
      title: "Sluggish performance on large search and filter queries",
      description: "We create compound indexes, text search indexes, and optimized aggregation pipelines.",
      whyItHappens: "Un-indexed collections force full collection scans on every request, slowing down the server.",
      expectedOutcome: "Sub-20ms query response times even with tens of thousands of records.",
      icon: "Zap",
    },
    {
      title: "Lack of automated backups and disaster recovery",
      description: "We configure automated daily MongoDB Atlas backups, point-in-time recovery, and replica sets.",
      whyItHappens: "Running databases without automated backup policies risks total business data loss during failures.",
      expectedOutcome: "Complete peace of mind with 1-click restore capability and 99.99% availability.",
      icon: "ShieldCheck",
    },
    {
      title: "Inability to scale database with growing traffic",
      description: "We implement connection pooling, Redis caching for hot data, and lean query projections.",
      whyItHappens: "Opening new database connections on every serverless invocation exhausts database limits.",
      expectedOutcome: "Effortless scalability capable of handling thousands of concurrent users.",
      icon: "TrendingUp",
    },
  ],

  "seo-friendly-website-setup": [
    {
      title: "Zero organic Google search rankings for high-intent keywords",
      description: "We perform keyword mapping, optimize heading hierarchies, and craft search-intent-driven content structure.",
      whyItHappens: "Websites built without SEO architecture are invisible to Google search bots for competitive terms.",
      expectedOutcome: "Strong organic foundation designed to rank on Google Page 1 for commercial queries.",
      icon: "Search",
    },
    {
      title: "Missing structured JSON-LD schema markup",
      description: "We inject Organization, LocalBusiness, Service, Article, and BreadcrumbList schemas.",
      whyItHappens: "Without structured data, Google cannot display rich snippets, reviews, or knowledge panels.",
      expectedOutcome: "Enhanced Google search presence with rich snippets and higher click-through rates.",
      icon: "Code2",
    },
    {
      title: "Broken canonical tags and duplicate metadata penalties",
      description: "We configure strict self-referencing canonicals, automated robots.txt, and dynamic XML sitemaps.",
      whyItHappens: "Multiple URL variations (http/https, www/non-www, trailing slashes) dilute domain authority.",
      expectedOutcome: "Consolidated domain authority and clean crawl budgets for search engine spiders.",
      icon: "FileCheck",
    },
    {
      title: "Competitors capturing all local search traffic in Lahore & Pakistan",
      description: "We optimize local SEO signals, geo-targeted metadata, and Google Search Console indexing.",
      whyItHappens: "Lacking localized keyword targeting allows regional competitors to win local client inquiries.",
      expectedOutcome: "Dominant local search visibility for clients searching for services in your area.",
      icon: "MapPin",
    },
  ],

  "website-speed-optimization": [
    {
      title: "Heavy uncompressed media assets causing slow page loads",
      description: "We compress and convert images to next-gen WebP/AVIF formats and configure responsive srcset.",
      whyItHappens: "Uploading multi-megabyte raw photos directly from cameras paralyzes mobile loading speeds.",
      expectedOutcome: "Up to 80% reduction in total page weight with instant media rendering.",
      icon: "Image",
    },
    {
      title: "Poor Time-to-First-Byte (TTFB) and Google Search ranking penalties",
      description: "We implement edge caching, Redis data caching, and server-side response compression.",
      whyItHappens: "Slow backend database queries and lack of HTTP cache headers delay initial server response.",
      expectedOutcome: "Under 150ms TTFB globally, giving an immediate boost to search engine rankings.",
      icon: "Zap",
    },
    {
      title: "High bounce rates as mobile users abandon slow pages",
      description: "We defer non-critical scripts, eliminate render-blocking CSS, and preload critical fonts.",
      whyItHappens: "53% of mobile visits are abandoned if a page takes more than 3 seconds to load.",
      expectedOutcome: "Instant First Contentful Paint (FCP) keeping visitors engaged on your site.",
      icon: "Smartphone",
    },
    {
      title: "High server CPU usage and unoptimized hosting costs",
      description: "We optimize JavaScript execution, reduce DOM size, and implement stale-while-revalidate caching.",
      whyItHappens: "Uncached dynamic rendering forces servers to re-compute identical pages on every visit.",
      expectedOutcome: "70% lower server resource consumption and rock-solid stability during traffic surges.",
      icon: "Server",
    },
  ],

  "maintenance-support": [
    {
      title: "Unexpected website crashes during peak business hours",
      description: "We provide 24/7 uptime monitoring, automated error tracking, and rapid incident response.",
      whyItHappens: "Websites left unmonitored can crash silently for days without the business owner knowing.",
      expectedOutcome: "Guaranteed 99.9% uptime and immediate resolution before visitors notice issues.",
      icon: "ShieldAlert",
    },
    {
      title: "Unpatched security vulnerabilities and outdated dependencies",
      description: "We perform regular dependency audits, security patch updates, and SSL certificate renewals.",
      whyItHappens: "Outdated software packages are the #1 entry point for malware and automated bot attacks.",
      expectedOutcome: "Airtight digital security protecting your brand and customer data from breaches.",
      icon: "Lock",
    },
    {
      title: "Broken forms, expired API keys, and plugin conflicts",
      description: "We run scheduled weekly functional tests across contact forms, checkouts, and external integrations.",
      whyItHappens: "Third-party API updates often break forms silently, causing lost client inquiries.",
      expectedOutcome: "100% verified inquiry flow ensuring you never miss a prospective client message.",
      icon: "CheckCircle2",
    },
    {
      title: "Stale, un-updated business content giving an abandoned impression",
      description: "We provide dedicated monthly hours for fast text, image, pricing, and project updates.",
      whyItHappens: "Busy business owners lack the time or tools to keep website information current.",
      expectedOutcome: "Always fresh, accurate, and relevant website content that reflects your latest work.",
      icon: "Edit",
    },
  ],
};

const makeItems = (items) =>
  items.map((item) =>
    typeof item === "string"
      ? { title: item, description: `${item} planned around your project scope.` }
      : item,
  );

const primaryTargetBySlug = {
  "custom-website-development": "Custom Website Development in Lahore",
  "mern-stack-web-development": "MERN Stack Developer in Pakistan",
  "nextjs-website-development": "Next.js Developer in Lahore",
  "full-stack-web-app-development": "Full-Stack Web App Development in Pakistan",
  "admin-dashboard-development": "Admin Dashboard Development in Pakistan",
  "e-commerce-website-development": "E-commerce Website Development in Lahore",
  "portfolio-website-development": "Portfolio Website Development in Lahore",
  "landing-page-design": "Landing Page Design in Lahore",
  "website-redesign": "Website Redesign Services in Lahore",
  "api-integration": "API Integration Developer in Pakistan",
  "database-integration": "Database Integration Services in Pakistan",
  "seo-friendly-website-setup": "SEO-Friendly Website Setup in Lahore",
  "website-speed-optimization": "Website Speed Optimization Services in Pakistan",
  "maintenance-support": "Website Maintenance & Support in Pakistan",
};

const seoDescriptionBySlug = {
  "custom-website-development":
    "Custom website development in Lahore for businesses that need responsive design, clean structure, lead flow, and scalable functionality.",
  "mern-stack-web-development":
    "Build practical MERN stack web applications in Pakistan with MongoDB, Express.js, React.js, Node.js, APIs, dashboards, and secure workflows.",
  "nextjs-website-development":
    "Fast, SEO-friendly Next.js websites for businesses in Lahore and Pakistan with responsive UI, clean structure, and scalable performance.",
  "full-stack-web-app-development":
    "Full-stack web app development in Pakistan with frontend, backend, database, authentication, dashboards, APIs, and practical automation.",
  "admin-dashboard-development":
    "Custom admin dashboard development in Pakistan for managing users, content, bookings, messages, analytics, and business operations securely.",
  "e-commerce-website-development":
    "E-commerce website development in Lahore with product catalogs, store management, checkout planning, responsive UI, and admin controls.",
  "portfolio-website-development":
    "Portfolio website development in Lahore for freelancers, founders, creators, and service providers who need stronger online credibility.",
  "landing-page-design":
    "Landing page design in Lahore for campaigns, products, offers, and lead generation with clear messaging and focused conversion paths.",
  "website-redesign":
    "Website redesign services in Lahore for outdated sites that need modern visuals, clearer structure, better mobile UX, and stronger CTAs.",
  "api-integration":
    "API integration developer support in Pakistan for connecting apps with payments, email, uploads, analytics, CRMs, webhooks, and workflows.",
  "database-integration":
    "Database integration services in Pakistan for content, users, leads, bookings, products, dashboards, and reliable business workflows.",
  "seo-friendly-website-setup":
    "SEO-friendly website setup in Lahore with metadata, clean URLs, structured content, sitemap, robots, performance, and search-ready pages.",
  "website-speed-optimization":
    "Improve website speed, image delivery, loading performance, and user experience for modern business websites in Pakistan.",
  "maintenance-support":
    "Website maintenance and support in Pakistan for updates, fixes, content changes, monitoring, improvements, and technical guidance.",
};

const relatedServicesBySlug = {
  "custom-website-development": [
    "nextjs-website-development",
    "seo-friendly-website-setup",
    "website-speed-optimization",
    "maintenance-support",
  ],
  "mern-stack-web-development": [
    "full-stack-web-app-development",
    "api-integration",
    "database-integration",
    "admin-dashboard-development",
  ],
  "nextjs-website-development": [
    "custom-website-development",
    "full-stack-web-app-development",
    "seo-friendly-website-setup",
    "website-speed-optimization",
  ],
  "full-stack-web-app-development": [
    "mern-stack-web-development",
    "api-integration",
    "database-integration",
    "admin-dashboard-development",
  ],
  "admin-dashboard-development": [
    "full-stack-web-app-development",
    "api-integration",
    "database-integration",
    "maintenance-support",
  ],
  "e-commerce-website-development": [
    "custom-website-development",
    "admin-dashboard-development",
    "database-integration",
    "maintenance-support",
  ],
  "portfolio-website-development": [
    "custom-website-development",
    "landing-page-design",
    "seo-friendly-website-setup",
    "website-speed-optimization",
  ],
  "landing-page-design": [
    "custom-website-development",
    "seo-friendly-website-setup",
    "website-speed-optimization",
    "website-redesign",
  ],
  "website-redesign": [
    "custom-website-development",
    "seo-friendly-website-setup",
    "website-speed-optimization",
    "maintenance-support",
  ],
  "api-integration": [
    "full-stack-web-app-development",
    "mern-stack-web-development",
    "database-integration",
    "admin-dashboard-development",
  ],
  "database-integration": [
    "api-integration",
    "full-stack-web-app-development",
    "mern-stack-web-development",
    "admin-dashboard-development",
  ],
  "seo-friendly-website-setup": [
    "custom-website-development",
    "nextjs-website-development",
    "website-speed-optimization",
    "landing-page-design",
  ],
  "website-speed-optimization": [
    "seo-friendly-website-setup",
    "nextjs-website-development",
    "website-redesign",
    "maintenance-support",
  ],
  "maintenance-support": [
    "website-speed-optimization",
    "website-redesign",
    "seo-friendly-website-setup",
    "custom-website-development",
  ],
};

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
  problemsSolved,
  deliverables,
  features,
  benefits,
  keywords,
  seoDescription,
  targetKeywords,
  localKeywords,
  relatedServices,
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
  problemsSolved: problemsSolved || problemsBySlug[slug] || defaultProblems,
  problemSolved: (problemsSolved || problemsBySlug[slug] || defaultProblems)[0]?.description || shortDescription,
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
  seoTitle: primaryTargetBySlug[slug] || title,
  seoDescription: seoDescription || seoDescriptionBySlug[slug] || shortDescription,
  keywords,
  targetKeywords: targetKeywords || [
    primaryTargetBySlug[slug] || title,
    ...(keywords || []),
  ],
  localKeywords: localKeywords || [
    `${primaryTargetBySlug[slug] || title}`,
    `${title} Lahore`,
    `${title} Pakistan`,
    "web development services in Lahore",
  ],
  relatedServices: relatedServices || relatedServicesBySlug[slug] || [],
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
