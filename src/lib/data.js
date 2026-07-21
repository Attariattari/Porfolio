import { servicesSeedData } from "@/data/services.seed";

export const bookCallContent = {
    callFor: ["Custom Website Development", "Full-Stack Web App", "Admin Dashboard", "Website Redesign", "API / Database Integration", "SEO-Friendly Website Setup"],
    nextSteps: ["Submit Your Details", "Requirement Review", "Project Discussion", "Custom Quote / Next Step"],
    preparation: ["Project idea or business goal", "Pages/features you need", "Reference websites if available", "Logo/brand details if available", "Existing website link if redesign", "Domain/hosting details if available", "Timeline expectations"],
    faqs: [
        ["Is the project discussion free?", "Yes. The discussion helps understand your requirements and the right next step before any project scope is finalized."],
        ["What should I share before booking?", "Share your project idea, business goal, required pages/features, references, and any existing website link if available."],
        ["Can I discuss a website redesign?", "Yes. You can discuss redesign goals, current website issues, content structure, performance, and conversion improvements."],
        ["Can you build admin dashboards?", "Yes. Muhyo Tech can plan and build dashboards for content, leads, bookings, users, analytics, and custom workflows."],
        ["Can you connect APIs and databases?", "Yes. Projects can include API integrations, MongoDB, authentication, file uploads, email, payments, and internal systems."],
        ["Do you help with deployment?", "Yes. Deployment support, domain guidance, hosting setup, and launch checks can be discussed based on project scope."],
        ["How is pricing decided?", "Pricing depends on project scope, features, timeline, and level of customization. After reviewing your requirements, Muhyo Tech can guide you with a custom quote."],
        ["How long does a project take?", "Timeline depends on project size, content readiness, integrations, revisions, and technical requirements."],
        ["Can I select a specific service?", "Yes. Choose the service that best matches your project. If you are not sure, select the closest option and explain your goal in the message."],
        ["What happens after I submit the form?", "After reviewing your message, I'll guide you with the right approach based on your project scope and requirements."],
    ],
    badges: ["Project Discussion", "Web Development", "Full-Stack Solutions", "Custom Quote"],
};

const CURRENT_YEAR = new Date().getFullYear();

export const SOCIAL_LINKS = {
    whatsapp: {
        name: "WhatsApp",
        icon: "WhatsApp",
        phoneNumber: "923224458481", // ← Editable
        defaultMessage: "Hi Ghulam Muhyo Din! I came across your portfolio and would love to connect. Are you available to discuss a potential project or collaboration?", // ← Editable
        get url() {
            return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(this.defaultMessage)}`;
        },
        color: "#25D366",
    },
    linkedin: {
        name: "LinkedIn",
        icon: "Linkedin",
        username: "ghulam-muhyo-din-web-designer", // ← Editable
        get url() {
            return `https://www.linkedin.com/in/${this.username}`;
        },
        color: "#0077b5",
    },
    github: {
        name: "GitHub",
        icon: "Github",
        username: "Attariattari", // ← Editable
        get url() {
            return `https://github.com/${this.username}`;
        },
        color: "#ffffff",
    },
    twitter: {
        name: "X (Twitter)",
        icon: "X",
        username: "GhulamMuhyo", // ← Editable
        get url() {
            return `https://x.com/${this.username}`;
        },
        color: "#ffffff",
    },
    facebook: {
        name: "Facebook",
        icon: "Facebook",
        username: "MuhammadMuhyoDinAttari", // ← Editable
        get url() {
            return `https://www.facebook.com/${this.username}`;
        },
        color: "#1877f2",
    },
};

/**
 * Convert SOCIAL_LINKS to array format for easy iteration
 */
export const SOCIAL_LINKS_ARRAY = Object.values(SOCIAL_LINKS);

export const homeData = {
    hero: {
        badge: "Available for selected projects",
        title: "Building modern websites, dashboards, and full-stack applications",
        highlightedWord: "applications",
        description: "Muhyo Tech builds modern websites, dashboards, and full-stack applications for businesses, startups, and personal brands using Next.js, MERN Stack, and clean conversion-focused UI.",
        heroImage: "/hero-visual.webp",
        ctas: [
            { label: "Book a Call", href: "/book-a-call", variant: "primary" },
            { label: "View Projects", href: "/projects", variant: "outline" },
            { label: "Explore Services", href: "/services", variant: "secondary" },
        ],
        highlights: [
            "Next.js & MERN stack",
            "Admin dashboards",
            "SEO-ready websites",
            "Responsive delivery",
        ],
    },
    contactCTA: {
        title: "Ready to discuss your project?",
        description: "Send a message, book a call, or browse the services and projects to see how Muhyo Tech can help.",
        buttons: [
            { label: "Book a Call", href: "/book-a-call" },
            { label: "View Services", href: "/services" },
            { label: "View Projects", href: "/projects" },
        ],
    },
    expertise: {
        title: "Expertise built around practical delivery",
        categories: ["Frontend", "Backend", "Database", "Tools", "Deployment", "Integrations"],
    },
    finalCTA: {
        badge: "Start your project",
        title: "Ready to Build Something Professional?",
        description: "Let's discuss your website, web app, dashboard, or business idea and turn it into a modern digital solution.",
        buttons: [
            { label: "Book a Call", href: "/book-a-call", variant: "primary" },
            { label: "Contact Me", href: "/contact", variant: "outline" },
            { label: "View Projects", href: "/projects", variant: "secondary" },
        ],
    },
};
export const aboutData = {
    name: "Pir Ghulam Muhyo Din",
    company: "Muhyo Tech",
    role: "Full-Stack Web Developer | Next.js & MERN Stack",
    avatar: "https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png",
    bio: "Muhyo Tech is the professional portfolio of Pir Ghulam Muhyo Din, focused on modern websites, full-stack web applications, dashboards, and scalable digital solutions.",
    longDescription: "Muhyo Tech is the professional portfolio of Pir Ghulam Muhyo Din, a Full-Stack Web Developer based in Lahore, Pakistan. I build modern, responsive, SEO-friendly, and scalable websites and web applications using Next.js, React, Node.js, Express, MongoDB, and Tailwind CSS. My work combines clean UI thinking with secure backend structure so businesses can launch digital products that look polished and work reliably.",
    mission: "To build practical, modern, and scalable web solutions for businesses, startups, professionals, and personal brands.",
    email: "MuhyoTech@gmail.com",
    phone: "+92 322 4458481",
    location: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
    workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
    typewriterWords: [
        "Full-Stack Developer",
        "Next.js Engineer",
        "MERN Stack Builder",
        "Dashboard Developer",
    ],
    hero: {
        badge: "About Muhyo Tech",
        title: "Muhyo Tech",
        headline: "Full-Stack Web Developer | Next.js & MERN Stack",
        description: "I help businesses, startups, professionals, and personal brands turn ideas into modern websites, web apps, dashboards, and digital systems that feel premium, load fast, and stay easy to manage.",
        image: "https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png",
        highlights: [
            "Next.js & MERN stack",
            "SEO-friendly structure",
            "Admin dashboard experience",
            "Responsive UI delivery",
        ],
        ctas: [
            { label: "Book a Call", href: "/book-a-call", variant: "primary" },
            { label: "View Projects", href: "/projects", variant: "secondary" },
            { label: "Contact Me", href: "/contact", variant: "outline" },
        ],
        socialLinks: SOCIAL_LINKS_ARRAY,
    },
    story: {
        title: "A practical full-stack partner for modern web products",
        paragraphs: [
            "Muhyo Tech is the professional portfolio of Pir Ghulam Muhyo Din, a Full-Stack Web Developer focused on building modern, responsive, SEO-friendly, and scalable websites and web applications using Next.js, React, Node.js, Express, MongoDB, and Tailwind CSS.",
            "Based in Lahore, Pakistan, I focus on business-focused digital products that combine clean UI, secure backend thinking, and maintainable architecture. The goal is simple: help clients launch polished web solutions that support real work, growth, and trust.",
        ],
    },
    whatIBuild: [
        { icon: "Globe", title: "Custom Websites", description: "Premium responsive websites built around your brand, offer, and conversion goals.", link: "/services/custom-website-development" },
        { icon: "Layers", title: "Full-Stack Web Applications", description: "Modern app experiences with frontend, backend, database, and deployment handled together.", link: "/services/mern-stack-web-development" },
        { icon: "LayoutDashboard", title: "Admin Dashboards", description: "Secure management panels for content, users, services, analytics, and business workflows.", link: "/services/admin-dashboard-development" },
        { icon: "User", title: "Portfolio Websites", description: "Personal brand and professional portfolio sites that present work clearly and attract opportunities.", link: "/projects" },
        { icon: "Building2", title: "Business Websites", description: "Trust-building websites for companies, local businesses, service providers, and startups.", link: "/services" },
        { icon: "Database", title: "API & Database Integration", description: "REST APIs, MongoDB models, authentication, uploads, email flows, and third-party integrations.", link: "/services/api-integration" },
        { icon: "RefreshCw", title: "Website Redesign", description: "Modern redesigns that improve structure, responsiveness, speed, and visual credibility.", link: "/contact" },
        { icon: "Search", title: "SEO-Friendly Web Setup", description: "Clean metadata, semantic sections, fast pages, and scalable structure for better discoverability.", link: "/services/seo-friendly-website-setup" },
    ],
    skills: {
        frontend: ["Next.js", "React.js", "Tailwind CSS", "Framer Motion"],
        backend: ["Node.js", "Express.js", "REST APIs", "Authentication / JWT"],
        database: ["MongoDB", "Mongoose"],
        tools: ["Git", "GitHub", "Vercel"],
        integrations: ["Cloudinary", "Nodemailer", "Socket.io"],
    },
    experiences: [
        {
            year: "2023 - Present",
            period: "2023 - Present",
            role: "Freelance Full-Stack Web Developer",
            company: "Self-Employed / Muhyo Tech",
            duration: "Present",
            description: "Building websites, dashboards, APIs, admin systems, and full-stack web apps for modern business needs.",
            highlights: ["Next.js websites", "MERN stack apps", "Admin systems", "API integrations"],
            milestones: ["Next.js websites", "MERN stack apps", "Admin systems", "API integrations"],
        },
        {
            year: "2025 - Jan 2026",
            period: "2025 - Jan 2026",
            role: "Project Manager & Computer Operator",
            company: "Society Office",
            duration: "Professional role",
            description: "Worked on project handling, computer operations, communication, documentation, and office management.",
            highlights: ["Project handling", "Digital records", "Office communication"],
            milestones: ["Project handling", "Digital records", "Office communication"],
        },
        {
            year: "2020 - 2022",
            period: "2020 - 2022",
            role: "Sales Manager",
            company: "Theme Park Society Head Office",
            duration: "2 Years",
            description: "Handled customer communication, business coordination, sales operations, and management responsibilities.",
            highlights: ["Client communication", "Business handling", "Team coordination"],
            milestones: ["Client communication", "Business handling", "Team coordination"],
        },
    ],
    education: [
        {
            degree: "BSCS",
            institute: "Virtual University of Pakistan",
            period: "In Progress",
            status: "Continues",
            description: "Focused on computer science fundamentals, software engineering, and continuous technical growth.",
        },
        {
            degree: "Intermediate",
            institute: "BISE Sahiwal",
            period: "2020 - 2021",
            status: "Completed",
            description: "Academic foundation before moving deeper into software development and professional work.",
        },
        {
            degree: "Matric",
            institute: "BISE Sahiwal",
            period: "2018 - 2019",
            status: "Completed",
            description: "Early academic foundation with a continued focus on learning and practical skills.",
        },
    ],
    approach: [
        { icon: "MessageSquare", title: "Requirement Understanding", description: "I start by clarifying goals, audience, features, content needs, and the business outcome behind the project." },
        { icon: "Sparkles", title: "Clean UI/UX Planning", description: "Layouts are planned for clarity, trust, responsiveness, and easy visitor action instead of decoration alone." },
        { icon: "Code2", title: "Responsive Development", description: "The build is structured for mobile, tablet, and desktop with clean components and maintainable styling." },
        { icon: "Shield", title: "Secure Backend Structure", description: "Backend flows are planned with validation, authentication, database structure, and stable API behavior in mind." },
        { icon: "Gauge", title: "Testing & Optimization", description: "I check loading, layout, content flow, forms, empty states, and common user paths before launch." },
        { icon: "Rocket", title: "Deployment Support", description: "I help move the project from development to live deployment with the right hosting and production setup." },
    ],
    whyChoose: [
        { icon: "Code2", title: "Modern Full-Stack Development", description: "Frontend, backend, database, and deployment decisions are handled together for a smoother final product." },
        { icon: "Target", title: "Business-Focused Solutions", description: "Muhyo Tech focuses on practical web solutions for businesses, startups, professionals, and personal brands." },
        { icon: "MonitorSmartphone", title: "Clean Responsive Design", description: "Interfaces are built to feel polished and usable across phone, tablet, laptop, and desktop screens." },
        { icon: "Search", title: "SEO-Friendly Structure", description: "Pages are organized with clean content hierarchy, metadata, performance, and semantic structure in mind." },
        { icon: "Layers", title: "Scalable Codebase", description: "Projects are built with maintainable components and patterns so future updates stay manageable." },
        { icon: "LayoutDashboard", title: "Admin Dashboard Experience", description: "I build practical CMS and admin tools that help clients manage content and operations confidently." },
        { icon: "MessagesSquare", title: "Professional Communication", description: "Clear updates, realistic scope, and practical guidance keep projects moving in the right direction." },
        { icon: "LifeBuoy", title: "Support Mindset", description: "I think beyond launch with maintainability, handoff, and long-term improvements in mind." },
    ],
    values: [
        { icon: "Award", title: "Quality Work", description: "Clean implementation, polished details, and stable behavior matter in every project." },
        { icon: "MessagesSquare", title: "Clear Communication", description: "Clients should always understand progress, decisions, and next steps." },
        { icon: "Zap", title: "Fast & Reliable Delivery", description: "The goal is dependable execution without sacrificing quality or responsiveness." },
        { icon: "Cpu", title: "Future-Ready Solutions", description: "I choose practical tools and structures that can grow with the project." },
        { icon: "Users", title: "User-Centric Design", description: "Interfaces should be easy for real visitors and admins to understand." },
        { icon: "LifeBuoy", title: "Long-Term Support Mindset", description: "A good website should stay maintainable after the first launch." },
    ],
    availability: {
        title: "Ready to discuss your project?",
        description: "Share your website, web app, dashboard, or business idea and I will help you shape the right digital solution.",
        email: "MuhyoTech@gmail.com",
        phone: "+92 322 4458481",
        location: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
        workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
        status: "Available for selected projects",
        socialLinks: SOCIAL_LINKS_ARRAY,
    },
    finalCTA: {
        badge: "Start the conversation",
        title: "Ready to Build Something Professional?",
        description: "Let's discuss your website, web app, dashboard, or business idea and turn it into a modern digital solution.",
        primaryButton: { label: "Book a Call", href: "/book-a-call" },
        secondaryButton: { label: "View Projects", href: "/projects" },
        tertiaryButton: { label: "Contact Me", href: "/contact" },
    },
    seoTitle: "About | Muhyo Tech",
    seoDescription: "Learn more about Muhyo Tech and Pir Ghulam Muhyo Din, a Full-Stack Web Developer building modern websites, web applications, dashboards, and scalable digital solutions with Next.js and MERN stack.",
    keywords: ["Muhyo Tech", "Pir Ghulam Muhyo Din", "Full-Stack Web Developer", "Next.js Developer", "MERN Stack Developer", "Lahore Web Developer"],
};

/**
 * Default Social Links Data
 * Used as fallback when no database data exists
 */
export const defaultSocialLinksData = {
    linkedin: {
        url: "",
        visible: false,
    },
    github: {
        url: "",
        visible: false,
    },
    twitter: {
        url: "",
        visible: false,
    },
    instagram: {
        url: "",
        visible: false,
    },
    youtube: {
        url: "",
        visible: false,
    },
    devto: {
        url: "",
        visible: false,
    },
    portfolio: {
        url: "",
        visible: false,
    },
    blog: {
        url: "",
        visible: false,
    },
    codepen: {
        url: "",
        visible: false,
    },
    dribbble: {
        url: "",
        visible: false,
    },
    behance: {
        url: "",
        visible: false,
    },
    whatsapp: {
        phone: "",
        message: "",
        visible: false,
    },
    telegram: {
        url: "",
        visible: false,
    },
    discord: {
        url: "",
        visible: false,
    },
    email: {
        visible: false,
    },
};

export const portfolioData = {
    siteConfig: {
        hero: {
            typewriterWords: [
                "Muhyo Tech",
                "Senior Software Engineer",
                "UX Architect",
                "Full Stack Developer",
            ],
            description: "I specialize in building high-quality, modern websites that look amazing and work perfectly on every device. By using the latest technology, I ensure your site is fast, secure, and easy for your visitors to use. My goal is to help your business grow with a powerful online presence that makes a great first impression.",
            features: [
                { icon: "Layers", label: "Great Design", description: "Built to grow" },
                {
                    icon: "Terminal",
                    label: "Clean Code",
                    description: "Easy to manage",
                },
                { icon: "Shield", label: "Safe & Secure", description: "Stable setup" },
                { icon: "Zap", label: "Fast Load", description: "Smooth experience" },
            ],
        },
        sidebar: {
            navLinks: [
                { name: "Home", href: "/", icon: "Home" },
                { name: "About", href: "/about", icon: "User" },
                { name: "Services", href: "/services", icon: "Cpu" },
                { name: "Projects", href: "/projects", icon: "Code2" },
                { name: "Goals", href: "/goals", icon: "Target" },
                { name: "Blog", href: "/blog", icon: "FileText" },
                { name: "Contact", href: "/contact", icon: "Mail" },
            ],
        },
        footer: {
            brandDescription: "Architecting high-performance digital solutions with a focus on scalability, aesthetics, and user experience.",
            navigation: [
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Projects", href: "/projects" },
            ],
            resources: [
                { name: "Blog", href: "/blog" },
                { name: "Resume", href: "/resume" },
                { name: "Skills", href: "/#skills" },
                { name: "Contact", href: "/contact" },
            ],
            legal: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
            ],
        },
        navbar: {
            logo: {
                title: "Muhyo",
                accent: "Tech",
            },
            navLinks: [
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Projects", href: "/projects" },
                { name: "Goals", href: "/goals" },
                { name: "Blog", href: "/blog" },
                { name: "Contact", href: "/contact" },
            ],
            cta: {
                label: "My Resume",
                href: "/resume",
            },
        },
        servicesPage: {
            hero: {
                badge: "Expert Solutions",
                title: "Web Development Services in Lahore",
                description: "Muhyo Tech builds modern websites, full-stack web apps, admin dashboards, and scalable Next.js & MERN solutions for businesses in Lahore, Pakistan and beyond.",
            },
            stats: [
                { value: "3+", label: "Years Exp" },
                { value: "50+", label: "Projects" },
                { value: "100%", label: "Success" },
            ],
            cta: {
                title: "Ready to build something professional?",
                description: "Let's work together to create a website that actually helps your business grow.",
            },
        },
        servicesPageSEO: {
            primaryKeyword: "Web Development Services in Lahore",
            secondaryKeywords: [
                "Website Developer in Lahore",
                "Custom Website Development Lahore",
                "Next.js Developer in Lahore",
                "MERN Stack Developer Pakistan",
                "Admin Dashboard Development Pakistan",
                "Full-Stack Web Developer Lahore",
            ],
            supportingKeywords: [
                "React.js development",
                "Node.js development",
                "MongoDB development",
                "Express.js development",
                "business website development",
                "responsive website development",
                "SEO-friendly website setup",
                "API integration",
                "database integration",
                "admin panel development",
                "website redesign",
                "landing page design",
                "website speed optimization",
            ],
            localKeywords: ["Lahore", "Pakistan", "businesses in Lahore"],
        },
        privacyPage: {
            title: "Privacy Policy",
            subtitle: "Privacy Governance",
            description: "High-fidelity data protection framework defining the digital integrity standards at Muhyo Tech.",
            finalStatement: {
                title: "Digital Sovereignty Ensured",
                cta: "Consult Security Team",
            },
            sections: [{
                title: "Data We Collect",
                icon: "Eye",
                content: "We collect personal information that you voluntarily provide when interacting with our digital ecosystem.",
                details: [
                    "Personal Names",
                    "Email Addresses",
                    "Technical Footprints",
                    "Usage Patterns",
                ],
            },
            {
                title: "Processing Intent",
                icon: "Lock",
                content: "Information is processed for legitimate business logic, contract fulfillment, and legal compliance.",
                details: [
                    "Identity Verification",
                    "Service Optimization",
                    "Strategic Marketing",
                    "Security Hardening",
                ],
            },
            {
                title: "Data Sovereignty",
                icon: "Shield",
                content: "Consent-based information sharing restricted to essential legal and business operations.",
                details: [
                    "Legal Mandates",
                    "Rights Protection",
                    "Third-party Audits",
                    "Operational Continuity",
                ],
            },
            {
                title: "Security & Persistence",
                icon: "FileText",
                content: "Advanced technical measures to ensure information integrity and appropriate retention scales.",
                details: [
                    "AES Encryption",
                    "Vulnerability Audits",
                    "Strategic Archival",
                    "Secure Deletion",
                ],
            },
            {
                title: "Regulatory Rights",
                icon: "Shield",
                content: "Empowering users with control over their digital footprint under international privacy frameworks.",
                details: [
                    "Access Rights",
                    "Erasure Protocols",
                    "Processing Objections",
                    "Portability Requests",
                ],
            },
            ],
        },
        termsPage: {
            title: "Terms Engagement",
            subtitle: "Service Governance",
            description: "Strategic framework governing the technical collaboration and professional engagement at Muhyo Tech.",
            finalStatement: {
                title: "Operational Integrity Verified",
                cta: "Consult Legal Advisor",
            },
            sections: [{
                title: "Consensus Agreement",
                icon: "FileText",
                content: "These Terms constitute a legally binding agreement governing the digital interaction between you and Muhyo Tech.",
                details: [
                    "Binding Contract",
                    "Mutual Acceptance",
                    "Global Applicability",
                    "Periodic Refinement",
                ],
            },
            {
                title: "Creative Assets",
                icon: "Cpu",
                content: "All proprietary code, architecture, and design tokens remain the exclusive intellectual property of the studio.",
                details: [
                    "Source Integrity",
                    "Copyright v4.1",
                    "Licensing Tokens",
                    "Usage Restrictions",
                ],
            },
            {
                title: "Operational Ethics",
                icon: "Gavel",
                content: "By engaging with our platform, you warrant adherence to accurate registration and secure digital conduct.",
                details: [
                    "Identity Integrity",
                    "Network Decorum",
                    "Prohibited Malice",
                    "System Respect",
                ],
            },
            {
                title: "Liability Boundaries",
                icon: "Zap",
                content: "Muhyo Tech maintains defined liability caps for digital services, ensuring project-based risk management.",
                details: [
                    "Direct Damage Caps",
                    "Force Majeure",
                    "Operational Uptime",
                    "Financial Immunity",
                ],
            },
            {
                title: "Conflict Resolution",
                icon: "Scale",
                content: "Resolution frameworks for digital disputes, prioritizing international arbitration and technical mediation.",
                details: [
                    "Binding Protocols",
                    "Legal Seat: Int.",
                    "Timeframe Metrics",
                    "Escalation Steps",
                ],
            },
            ],
        },
        contactPage: {
            quickResponse: "Usually replies within 24 hours",
            process: [{
                step: "01",
                title: "Project Planning",
                desc: "We review your requirements and suggest a practical direction based on your project scope.",
            },
            {
                step: "02",
                title: "Meeting & Chat",
                desc: "We discuss the scope, budget, timeline, and the right next steps before work begins.",
            },
            {
                step: "03",
                title: "Building & Launch",
                desc: "Development starts after the scope is clear, with progress updates as the work moves forward.",
            },
            ],
            faq: [{
                q: "How long does a project take?",
                a: "Timeline depends on the scope, features, content, and review process. Smaller updates may be faster, while full websites or dashboards usually need more planning and development time.",
            },
            {
                q: "Do you help after the project is finished?",
                a: "Yes. Post-launch support can be discussed based on the project needs, including bug fixes, updates, and maintenance options.",
            },
            {
                q: "Who owns the project code?",
                a: "You do! Once we finish and you pay, all the code belongs to you forever.",
            },
            {
                q: "Which technologies do you work with?",
                a: "I work with modern web technologies including React, Next.js, Node.js, Express, MongoDB, and Tailwind CSS, depending on the project requirements.",
            },
            ],
            locationInfo: {
                label: "Location",
                value: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
            },
        },
    },

    contactInfo: [{
        icon: "Mail",
        label: "Email Us",
        value: "MuhyoTech@gmail.com",
        href: "mailto:MuhyoTech@gmail.com",
        color: "from-accent/80 to-accent",
    },
    {
        icon: "Phone",
        label: "Call Us",
        value: "+92 322 4458481",
        href: "tel:+923224458481",
        color: "from-accent to-blue-600/50",
    },
    {
        icon: "WhatsApp",
        label: "WhatsApp",
        value: "Available on WhatsApp",
        href: "https://wa.me/923224458481?text=Hi MuhyoTech! I'd like to discuss a new project with you.",
        color: "from-emerald-500 to-teal-500",
        target: "_blank",
    },
    {
        icon: "MapPin",
        label: "Our Office",
        value: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
        href: "https://www.google.com/maps/search/?api=1&query=Chota,+Mohlanwal+Road,+Badu+Pura+Chung,+Lahore,+53720,+Pakistan",
        color: "from-purple-500 to-indigo-500",
        target: "_blank",
    },
    ],
    serviceFeatures: [{
        icon: "Zap",
        title: "Fast Performance",
        description: "Optimized for speed so visitors from Lahore, Pakistan and beyond can browse smoothly and take action.",
    },
    {
        icon: "Shield",
        title: "Secure & Reliable",
        description: "Built with practical security standards to protect business data, users, forms, and admin workflows.",
    },
    {
        icon: "Laptop",
        title: "Fully Responsive",
        description: "Your site will look and work perfectly on every device, from mobile to desktop.",
    },
    {
        icon: "Rocket",
        title: "SEO Optimized",
        description: "Clean metadata, semantic structure, and SEO-friendly foundations for stronger online visibility.",
    },
    ],
    serviceProcess: [{
        title: "Discovery",
        description: "We start by understanding your goals, audience, and technical requirements.",
        icon: "MessageSquare",
    },
    {
        title: "Architecture",
        description: "I design the structure and layout to ensure the best possible user flow.",
        icon: "Monitor",
    },
    {
        title: "Development",
        description: "Using the best tools, I build your solution with clean, efficient code.",
        icon: "Code",
    },
    {
        title: "Launch",
        description: "I handle the deployment and fine-tuning to make sure everything is perfect.",
        icon: "Rocket",
    },
    ],
    skills: [
        { name: "React / Next.js", level: 95, category: "Frontend" },
        { name: "Tailwind CSS", level: 90, category: "Frontend" },
        { name: "Node.js / Express", level: 85, category: "Backend" },
        { name: "JavaScript / ES6+", level: 92, category: "Languages" },
        { name: "MongoDB", level: 85, category: "Database" },
        { name: "RESTful APIs", level: 88, category: "API" },
        { name: "Framer Motion", level: 85, category: "Animation" },
        { name: "Git & Source Control", level: 85, category: "Tools" },
    ],
    services: [{
        id: 1,
        slug: "web-development",
        title: "Performance-First Web Development",
        description: "We engineer high-performance, SEO-optimized digital experiences using cutting-edge technologies like Next.js and React. Our websites aren't just pretty—they're built to convert and scale.",
        problemSolved: "Converting casual visitors into loyal customers through lightning-fast load times and intuitive user journeys that drive business growth.",
        benefits: [
            "Blazing Fast Core Web Vitals",
            "Advanced SEO Architecture",
            "Mobile-First Responsive Design",
            "Scalable Cloud-Native Infrastructure",
        ],
        process: [{
            title: "Strategy & Discovery",
            description: "Deep dive into your business goals, target audience, and competition to map out a clear digital strategy.",
        },
        {
            title: "Technical Architecture",
            description: "Planning the stack, database schema, and API integrations for a robust, future-proof system.",
        },
        {
            title: "Agile Development",
            description: "Iterative building with clean, maintainable code and regular progress updates.",
        },
        {
            title: "Testing & Launch",
            description: "Rigorous performance, security, and cross-browser testing before the final deployment.",
        },
        ],
        features: [
            "Server-Side Rendering (SSR) & Static Site Generation (SSG)",
            "Custom CMS Integration (Sanity, Contentful, or Strapi)",
            "E-commerce & Dynamic Payment Gateways",
            "Real-time Data & WebSockets Support",
            "Progressive Web App (PWA) Capabilities",
        ],
        techStack: [
            "React",
            "Next.js",
            "TypeScript",
            "Node.js",
            "Tailwind CSS",
            "MongoDB/PostgreSQL",
            "Framer Motion",
        ],
        banner: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
        faq: [{
            question: "How long does a typical project take?",
            answer: "A standard web project usually takes 4-8 weeks depending on complexity.",
        },
        {
            question: "Do you provide post-launch support?",
            answer: "Yes, we offer monthly maintenance and support packages to keep your site updated and secure.",
        },
        ],
    },
    {
        id: 2,
        slug: "ui-ux-design",
        title: "User-Centric UI/UX Design",
        description: "Transforming complex requirements into simple, elegant, and intuitive user interfaces. We focus on strategic design that aligns with user behavior and business objectives.",
        problemSolved: "Eliminating user frustration and high bounce rates by creating seamless, engaging experiences that keep users coming back.",
        benefits: [
            "Intuitive User Workflows",
            "Consistent Design Systems",
            "Accessible & Inclusive Design",
            "High-Fidelity Prototyping",
        ],
        process: [{
            title: "User Research",
            description: "Understanding user personas, pain points, and behavioral patterns through data and interviews.",
        },
        {
            title: "Wireframing",
            description: "Creating low-fidelity blueprints to establish layout and information hierarchy.",
        },
        {
            title: "Visual Design",
            description: "Crafting beautiful, brand-aligned interfaces with a focus on typography and color theory.",
        },
        {
            title: "Interaction Design",
            description: "Adding motion and micro-interactions to breathe life into the final design.",
        },
        ],
        features: [
            "Custom Vector Illustrations & Icons",
            "Interactive High-Fidelity Prototypes",
            "Comprehensive Responsive Design Systems",
            "A/B Testing & Usability Research",
            "Dark Mode & Multi-Theme Support",
        ],
        techStack: [
            "Figma",
            "Adobe Creative Suite",
            "Framer",
            "Spline (3D)",
            "Principle",
        ],
        banner: "https://res.cloudinary.com/dg5gwixf1/image/upload/v1772738795/ChatGPT_Image_Mar_5_2026_12_26_08_PM_hdvfoz.png",
        faq: [{
            question: "Can you redesign my existing website?",
            answer: "Absolutely! We specialize in revamping outdated interfaces to modern, high-converting designs.",
        },
        {
            question: "Do you provide the design files?",
            answer: "Yes, you will receive full access to all design assets, including Figma files and exported assets.",
        },
        ],
    },
    {
        id: 3,
        slug: "api-development",
        title: "Scalable API & Backend Systems",
        description: "Architecting the invisible engine that powers your business. We build secure, robust, and lightning-fast APIs that handle complex logic and large data volumes with ease.",
        problemSolved: "Streamlining operations and data management through automated, reliable backend systems that eliminate manual errors.",
        benefits: [
            "Military-Grade Security",
            "High Availability Arch",
            "RESTful & GraphQL Support",
            "Easy 3rd-Party Integrations",
        ],
        process: [{
            title: "Data Modeling",
            description: "Designing efficient database schemas and relationships to optimize data retrieval.",
        },
        {
            title: "API Design",
            description: "Defining clean, documented endpoints using industry standards like OpenAPI/Swagger.",
        },
        {
            title: "Security Implementation",
            description: "Integrating JWT, OAuth, and advanced encryption to protect your sensitive data.",
        },
        {
            title: "Deployment & Monitoring",
            description: "Setting up CI/CD pipelines and real-time monitoring to ensure 99.9% uptime.",
        },
        ],
        features: [
            "Microservices or Monolithic Architecture Support",
            "Real-time Data Streaming & Processing",
            "Advanced Caching Strategies (Redis)",
            "Third-party Service Integrations (Payment, Mail, Auth)",
            "Comprehensive API Documentation",
        ],
        techStack: [
            "Node.js",
            "Express",
            "Python",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "Docker",
            "AWS/Vercel",
        ],
        banner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
        faq: [{
            question: "Can you integrate with my existing database?",
            answer: "Yes, we have experience working with various legacy and modern databases.",
        },
        {
            question: "Is your code documented?",
            answer: "We provide full documentation for all APIs, making it easy for other developers to integrate.",
        },
        ],
    },
    {
        id: 4,
        slug: "mobile-app-development",
        title: "Cross-Platform Mobile Solutions",
        description: "Building high-performance, native-quality mobile applications for iOS and Android using modern frameworks. We focus on seamless performance and user engagement.",
        problemSolved: "Bridging the gap between your brand and users on the go through intuitive, feature-rich mobile experiences.",
        benefits: [
            "Single Codebase for iOS & Android",
            "Offline-First Functionality",
            "High-Performance Animations",
            "App Store Optimization (ASO)",
        ],
        process: [{
            title: "Mobile Strategy",
            description: "Defining user personas and mapping out the mobile-first customer journey.",
        },
        {
            title: "Prototyping",
            description: "Creating interactive mobile mockups to test usability and flow.",
        },
        {
            title: "Development",
            description: "Building with React Native or Flutter for efficient code sharing.",
        },
        {
            title: "App Store Launch",
            description: "Navigating the complexities of Google Play and Apple App Store submissions.",
        },
        ],
        features: [
            "Push Notifications & In-App Messaging",
            "Biometric Authentication (FaceID/TouchID)",
            "Geolocation & Mapping Services",
            "Offline Data Synchronization",
            "Native Module Integration",
        ],
        techStack: [
            "React Native",
            "Flutter",
            "Expo",
            "Firebase",
            "GraphQL",
            "Redux/Zustand",
        ],
        banner: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
        faq: [{
            question: "Do you build for both iOS and Android?",
            answer: "Yes, we use cross-platform technologies to build for both systems simultaneously, saving time and cost.",
        },
        {
            question: "Can you help with app store publishing?",
            answer: "Absolutely! We handle the entire submission process until your app is live and available for download.",
        },
        ],
    },
    {
        id: 5,
        slug: "cloud-devops",
        title: "Cloud Infrastructure & DevOps",
        description: "Optimizing your development lifecycle with automated CI/CD pipelines and scalable cloud architecture. We ensure your application is always available and secure.",
        problemSolved: "Eliminating deployment bottlenecks and server downtime through robust automation and intelligent scaling.",
        benefits: [
            "99.9% Uptime Guarantee",
            "Automated Security Patches",
            "Reduced Operational Costs",
            "Faster Release Cycles",
        ],
        process: [{
            title: "Audit & Analysis",
            description: "Evaluating your current infrastructure for bottlenecks and security vulnerabilities.",
        },
        {
            title: "Automation Setup",
            description: "Implementing CI/CD pipelines for seamless, low-risk deployments.",
        },
        {
            title: "Cloud Migration",
            description: "Moving your legacy systems to scalable, modern cloud providers like AWS or Azure.",
        },
        {
            title: "Monitoring 24/7",
            description: "Setting up real-time alerts and log management to prevent issues before they happen.",
        },
        ],
        features: [
            "Infrastructure as Code (Terraform/CloudFormation)",
            "Containerization with Docker & Kubernetes",
            "Automated Disaster Recovery & Backups",
            "Serverless Architecture Implementation",
            "Security & Compliance Hardening",
        ],
        techStack: [
            "AWS",
            "Azure",
            "Docker",
            "Kubernetes",
            "GitHub Actions",
            "Terraform",
            "Prometheus/Grafana",
        ],
        banner: "https://res.cloudinary.com/dg5gwixf1/image/upload/v1772738946/ChatGPT_Image_Mar_5_2026_12_28_47_PM_mrbwr1.png",
        faq: [{
            question: "Which cloud provider do you recommend?",
            answer: "We recommend AWS for its comprehensive toolset, but we also support Azure and Google Cloud based on your needs.",
        },
        {
            question: "How do you ensure data security?",
            answer: "We implement industry-standard encryption, VPCs, and regular security audits to keep your data safe.",
        },
        ],
    },
    {
        id: 6,
        slug: "seo-digital-growth",
        title: "SEO & Digital Growth Strategy",
        description: "Driving organic traffic and increasing visibility through data-driven SEO strategies and content optimization. We help you rank higher and reach your target audience.",
        problemSolved: "Solving low visibility and stagnant growth by positioning your brand where your customers are looking.",
        benefits: [
            "Higher Search Engine Rankings",
            "Increased Organic Traffic",
            "Data-Backed Growth Strategy",
            "Content Performance Tracking",
        ],
        process: [{
            title: "Keyword Research",
            description: "Identifying the terms your customers are searching for most.",
        },
        {
            title: "Technical SEO",
            description: "Optimizing site speed, schema markup, and crawlability for search engines.",
        },
        {
            title: "Content Strategy",
            description: "Creating a roadmap for valuable content that builds authority and trust.",
        },
        {
            title: "Analytics & Reporting",
            description: "Regularly reviewing performance metrics and adjusting strategies for maximum ROI.",
        },
        ],
        features: [
            "Comprehensive SEO Site Audits",
            "Competitor Link Building Analysis",
            "Local SEO & Google Business Profile Optimization",
            "Conversion Rate Optimization (CRO)",
            "Performance Data Visualization (Looker Studio)",
        ],
        techStack: [
            "Google Analytics 4",
            "Search Console",
            "Ahrefs",
            "SEMrush",
            "Screaming Frog",
            "Hotjar",
        ],
        banner: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        faq: [{
            question: "How long until I see results from SEO?",
            answer: "SEO is a long-term strategy; typically, you'll see significant growth within 3-6 months.",
        },
        {
            question: "Do you guarantee a #1 ranking?",
            answer: "No ethical SEO can guarantee a #1 spot, but we guarantee improved visibility and high-quality traffic.",
        },
        ],
    },
    ],
    projects: [{
        id: 1,
        title: "Apex E-Commerce Ecosystem",
        description: "A high-performance global retail platform focused on conversion and speed.",
        techStack: [
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "Stripe",
            "PostgreSQL",
        ],
        category: "Web",
        purpose: "E-Commerce",
        impact: "Increased checkout conversion by 35% and reduced load times by 60%.",
        details: "Architected a multi-vendor marketplace from the ground up. Focused on micro-interactions and atomic design to ensure a premium feel. Implemented complex state management for real-time inventory tracking and dynamic pricing.",
        thumbnail: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        ],
    },
    {
        id: 2,
        title: "Nova Real Estate Muhyo Tech",
        description: "Advanced property management system with immersive 3D walkthroughs.",
        techStack: ["React", "Three.js", "Node.js", "Google Maps API", "MongoDB"],
        category: "UI/UX",
        purpose: "PropTech",
        impact: "Reduced property viewing costs by 45% through high-fidelity virtual tours.",
        details: "A comprehensive platform for real estate agencies to showcase premium properties. Features include AI-driven property recommendations, integrated CRM, and WebGL-based floor plan visualizers.",
        thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
        ],
    },
    {
        id: 3,
        title: "Pulse Health AI",
        description: "Predictive diagnostics dashboard for modern healthcare providers.",
        techStack: ["Python", "React", "D3.js", "FastAPI", "AWS"],
        category: "Web",
        purpose: "HealthTech",
        impact: "Improved diagnostic accuracy by 22% using custom machine learning models.",
        details: "Developed a sophisticated dashboard for doctors to monitor patient vitals in real-time. Integrated secure HL7/FHIR data streams and used D3.js for complex medical data visualizations and trend analysis.",
        thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1504868584819-f8e90ec2cd5c?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1200",
        ],
    },
    {
        id: 4,
        title: "Vault Crypto Wallet",
        description: "Security-first multi-chain wallet with hardware integration.",
        techStack: [
            "React Native",
            "Web3.js",
            "Solidity",
            "Firebase",
            "Biometrics",
        ],
        category: "Mobile",
        purpose: "FinTech",
        impact: "Secured over $50M in assets within the first 6 months of launch.",
        details: "Designed and built a mobile-first cryptocurrency wallet supporting Ethereum, Solana, and Bitcoin. Focused on extreme security measures including biometric auth and encrypted seed phrase storage.",
        thumbnail: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1518544831976-37392d5aefde?auto=format&fit=crop&q=80&w=1200",
        ],
    },
    {
        id: 5,
        title: "Zenith SaaS Dashboard",
        description: "Unified operations center for enterprise-level logistics.",
        techStack: ["Next.js", "Prisma", "Go", "Redis", "Docker"],
        category: "Web",
        purpose: "SaaS",
        impact: "Streamlined logistics workflows, saving an average of 15 hours per week per user.",
        details: "A central hub for managing global supply chains. Features include real-time GPS tracking, automated manifest generation, and predictive delays based on weather data.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200",
        ],
    },
    {
        id: 6,
        title: "Muhyo Tech Portfolio (Elite Edition)",
        description: "A high-performance, resilient digital showcase with advanced network-aware logic.",
        techStack: [
            "Next.js 15",
            "React 19",
            "Zustand",
            "Framer Motion",
            "Tailwind 4",
        ],
        category: "Web",
        purpose: "SaaS Portfolio",
        impact: "Achieved 99+ Core Web Vitals and 100% resilient network uptime via auto-retry systems.",
        details: "Designed and engineered a production-grade portfolio using the latest Next.js App Router. Features include a global network resilience system, standard API responses, and advanced SEO architecture. Built with a focus on premium aesthetics and fluid UX.",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200",
        ],
        gitLink: "https://github.com/Attariattari/muhyo-tech",
        liveLink: "https://www.muhyotech.com",
    },
    {
        id: 7,
        title: "Muhyo Tech Admin Console",
        description: "Real-time content management and enterprise monitoring dashboard.",
        techStack: ["Next.js", "React Query", "Zod", "Socket.io", "MongoDB"],
        category: "SaaS",
        purpose: "CMS / Admin",
        impact: "Centralized all content operations with real-time analytics and security-hardened API layers.",
        details: "A comprehensive administrative hub featuring role-based access control (RBAC), real-time network health monitoring, and a standardized caching layer. Implemented Zod-based validation and global error handling for mission-critical reliability.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=1200",
        ],
        gitLink: "https://github.com/Attariattari/muhyo-tech",
        liveLink: "https://www.muhyotech.com/admin",
    },
    ],
    blogs: [{
        id: 1,
        slug: "rise-of-the-product-engineer",
        title: "The Rise of the Product Engineer",
        summary: "Why the most successful developers in the next decade will be those who bridge the gap between code and customer empathy.",
        content: `
                <p>The boundary between engineering and product is blurring. In 2026, the industry is moving away from the 'code monkey' era toward a new archetype: the <strong>Product Engineer</strong>.</p>
                
                <h2>What is a Product Engineer?</h2>
                <p>A Product Engineer doesn't just build features; they solve business problems. They understand user personas, conversion funnels, and retention metrics just as well as they understand memory leaks and database indexing. At <strong>Muhyo Tech</strong>, we believe this mindset is the secret sauce to building world-class software.</p>
                
                <blockquote>"The greatest code in the world is useless if it's solving the wrong problem."</blockquote>
                
                <h2>Bridging the Gap</h2>
                <p>When engineers think about the product, they make better architectural choices. They prioritize features that drive value and build systems that can adapt to user feedback rapidly. This holistic approach is what separates premium products from generic templates.</p>
                
                <p>Are you building just for the sake of code, or are you building for the humans behind the screen?</p>
            `,
        date: "Mar 14, 2026",
        author: "Pir Ghulam Muhyo Din",
        authorRole: "Founder",
        category: "Engineering",
        tags: ["Product", "Strategy", "Culture"],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
        featured: false,
        readTime: "6 min read",
    },
    ],
    messages: [], // For contact form submissions
    about: {
        name: "Pir Ghulam Muhyo Din",
        company: "Muhyo Tech",
        role: "Founder & Lead Solution Architect",
        bio: "Bridging Technology & Innovation with world-class software solutions.",
        longDescription: "I am Pir Ghulam Muhyo Din, a Full Stack Web Developer and UX Architect with over 3 years of experience bridging technology and design to build high-quality, modern digital solutions. Based in Lahore, Pakistan, I specialize in transforming complex business challenges into elegant, high-performance web applications. My expertise spans full-stack development, seamless user experiences, and scalable architectures. From creating secure backend systems to designing engaging user interfaces, my mission is to architect digital ecosystems that not only look amazing but also drive real long-term success.",
        mission: "To engineer simple, powerful, and beautiful digital ecosystems that empower businesses to scale and excel.",
        values: [
            "Architectural Excellence",
            "Performance First",
            "User-Centric Innovation",
            "Scalable Solutions",
            "Transparent Collaboration",
        ],
        avatar: "https://res.cloudinary.com/dg5gwixf1/image/upload/v1772736622/ChatGPT_Image_Mar_5_2026_11_36_42_AM_auw4uw.png",
        email: "MuhyoTech@gmail.com",
        phone: "+92 322 4458481",
        location: "Chung, Lahore, Pakistan",
        workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
        typewriterWords: [
            "Software Engineer",
            "Full-Stack Developer",
            "UI/UX Enthusiast",
            "Solution Architect",
        ],
        features: [{
            icon: "Award",
            title: "Top Quality Work",
            desc: "Architecting high-performance systems with precision and scalability.",
            color: "text-accent",
            bg: "bg-accent/10",
            gradient: "from-accent/20 to-blue-500/10",
        },
        {
            icon: "Zap",
            title: "Super Fast Speed",
            desc: "Optimizing every byte for instant load times and fluid interaction.",
            color: "text-accent/90",
            bg: "bg-accent/10",
            gradient: "from-accent/20 to-indigo-500/10",
        },
        {
            icon: "Code2",
            title: "Smart & Future Proof",
            desc: "Systems engineered to grow and adapt with emerging technologies.",
            color: "text-accent/80",
            bg: "bg-accent/10",
            gradient: "from-accent/20 to-emerald-500/10",
        },
        ],
        experiences: [{
            year: "2024 - Present",
            role: "Senior Web Developer",
            company: "Muhyo Tech",
            duration: "Present",
            description: "Specializing in building high-performance, responsive web applications using Next.js and Tailwind CSS. Focus on delivering seamless user experiences and modern UI architectures.",
            milestones: [
                "Custom Enterprise Dashboards",
                "SEO Optimized Web Apps",
                "Responsive UI Design Expert",
            ],
        },
        {
            year: "2023 - 2024",
            role: "Full-Stack Web Developer",
            company: "Muhyo Tech",
            duration: "1 Year",
            description: "Architecting robust backend systems and dynamic frontends. Implementing real-time features and secure API integrations to create comprehensive web solutions.",
            milestones: [
                "Real-time Data Integration",
                "Secure User Auth Systems",
                "API Performance Tuning",
            ],
        },
        {
            year: "2022 - 2023",
            role: "Frontend Specialist",
            company: "Muhyo Tech",
            duration: "1 Year",
            description: "Crafting pixel-perfect designs and fluid animations. Working closely with modern JavaScript frameworks to bring complex digital concepts to life on the web.",
            milestones: [
                "Fluid Framer Motion Animations",
                "Modern Component Architecture",
                "Atomic Design Implementation",
            ],
        },
        ],
        coreValuesLarge: [{
            icon: "CheckCircle2",
            title: "Top Quality Work",
            desc: "Meticulous attention to detail ensures every pixel and line of code is perfect.",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            icon: "Zap",
            title: "Fast & Reliable",
            desc: "Engineered for speed and stability, ensuring your platform is always ready for traffic.",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            icon: "Cpu",
            title: "Future-Proof Solutions",
            desc: "Building with the latest industry standards to ensure long-term scalability.",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            icon: "Target",
            title: "User-Centric Design",
            desc: "Creating intuitive experiences that your users will actually love using every day.",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        ],
        focusAreas: [{
            icon: "Sparkles",
            title: "Clean & Modern UI/UX",
            desc: "We focus on creating aesthetic designs that not only look premium but provide effortless navigation and usability.",
        },
        {
            icon: "Zap",
            title: "High Performance",
            desc: "Speed is our priority. We optimize every image and script to ensure lightning-fast interaction for every visitor.",
        },
        {
            icon: "Code2",
            title: "Scalable Architecture",
            desc: "Our systems are built to grow. Whether you have 100 or 100,000 users, our architecture handles it with ease.",
        },
        {
            icon: "Verified",
            title: "Client-Centric",
            desc: "Your vision is our mission. We provide personalized consultations to ensure we deliver exactly what your business needs.",
        },
        ],
        contactInfo: [{
            icon: "Mail",
            label: "Email",
            value: "MuhyoTech@gmail.com",
            link: "mailto:MuhyoTech@gmail.com",
        },
        {
            icon: "Phone",
            label: "Phone",
            value: "+92 322 4458481",
            link: "tel:+923224458481",
        },
        {
            icon: "MapPin",
            label: "Office Location",
            value: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
        },
        {
            icon: "Clock",
            label: "Working hours",
            value: "Mon - Sat: 9:00 AM - 6:00 PM",
        },
        ],
    },
    resume: {
        name: "Pir Ghulam Muhyo Din",
        role: "Full Stack Web Developer",
        tagline: "Full-Stack Engineer | Performance & Scalable Web Applications",
        about: "I am a results-driven developer and project strategist with a unique background that blends sales management, team leadership, and full-stack engineering. After starting my career in sales—where I learned how to build relationships and lead teams—I transitioned into web development to bring ideas to life through code. I specialize in building smooth digital systems that help businesses grow and run efficiently. My goal is always to create tools that are not only powerful but also easy and helpful for people to use.",
        contact: [
            { icon: "Phone", text: "+92-322-4458481" },
            { icon: "Mail", text: "MuhyoTech@gmail.com" },
            { icon: "MapPin", text: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan" },
        ],
        stats: [{
            label: "Years Experience",
            value: "3+",
            icon: "Award",
        },
        {
            label: "Projects Delivered",
            value: "10+",
            icon: "Zap",
        },
        {
            label: "Technologies",
            value: "10+",
            icon: "Code",
        },
        ],
        experience: [{
            role: "Freelance Full Stack Web Developer",
            company: "Self-Employed",
            duration: "2023 – Present",
            metrics: "Global Reach • 95+ Performance",
            achievements: [
                "Engineered and delivered 10+ high-performance web applications using robust modern stacks (Next.js, Node.js), ensuring optimized performance and scalability.",
                "Managed the end-to-end software development lifecycle (SDLC), from initial architecture to final cloud deployment, for global clients across multiple domains.",
                "Reduced client operational overhead by 20% through custom-built automation tools and seamless third-party integrations.",
            ],
        },
        {
            role: "Project Manager & Computer Operator",
            company: "Digital Systems Division",
            duration: "2025 – Jan 2026",
            metrics: "100% On-Time Delivery",
            achievements: [
                "Directed project execution and cross-functional team coordination, maintaining a 100% success rate in meeting project milestones.",
                "Revolutionized digital record-keeping and documentation systems, enhancing data retrieval speed by 40% and overall reporting accuracy.",
                "Optimized internal workflows by identifying technical bottlenecks and implementing streamlined communication protocols between departments.",
            ],
        },
        {
            role: "Sales Manager",
            company: "Theme Park Society",
            duration: "2020 – 2022",
            metrics: "Increased Rev. & Efficiency",
            achievements: [
                "Orchestrated sales operations and managed high-priority client relationships, consistently exceeding quarterly performance targets.",
                "Improved inter-departmental communication efficiency by 30% through the implementation of standardized reporting frameworks.",
                "Led diverse teams to execute complex operational tasks, ensuring high-quality client service delivery under tight deadlines.",
            ],
        },
        ],
        education: [{
            degree: "BS Computer Science",
            institution: "Virtual University Lahore",
            duration: "2025",
        },
        {
            degree: "Intermediate",
            institution: "BISE Sahiwal",
            duration: "2020 – 2021",
        },
        {
            degree: "Matric",
            institution: "BISE Sahiwal",
            duration: "2018 – 2019",
        },
        ],
        skills: [{
            category: "Development",
            items: [
                "Full Stack Web Dev",
                "Next.js & React",
                "Node.js & Express",
                "Database Management",
            ],
        },
        {
            category: "Management",
            items: [
                "Project Coordination",
                "Sales & Client Management",
                "Team Leadership",
                "Digital Records",
            ],
        },
        {
            category: "Strategy",
            items: [
                "Problem Solving",
                "Adaptability",
                "Process Optimization",
                "Client Growth",
            ],
        },
        ],
        projects: [{
            name: "Muhyo Tech Elite Portfolio",
            tech: ["Next.js 15", "React 19", "Tailwind 4"],
            outcome: "Engineered a 100% resilient frontend with 99+ Performance score.",
        },
        {
            name: "Enterprise Admin Console",
            tech: ["Zod", "React Query", "MongoDB"],
            outcome: "Developed a security-hardened CMS with real-time health monitoring.",
        },
        {
            name: "Enterprise ERP Ecosystem",
            tech: ["Next.js", "Node.js", "MongoDB"],
            outcome: "Streamlined resource management, reducing inventory waste by 15%.",
        },
        {
            name: "High-Traffic SaaS Portal",
            tech: ["React", "Firebase", "Tailwind"],
            outcome: "Achieved 99.9% uptime for 2k+ daily users with sub-1s load times.",
        },
        {
            name: "Real Estate CRM Edge",
            tech: ["Express", "PostgreSQL", "React"],
            outcome: "Automated lead tracking, increasing closure rates by 25% in 3 months.",
        },
        ],
    },

    // ===== GOALS / VISION / ROADMAP DATA =====
    goalsVision: {
        missionStatement: "Build useful web products, SaaS systems, and portfolio experiences with practical value, clean architecture, and honest communication.",
        visionStatement: "Turn Muhyo Tech into a stronger digital product and service brand through real projects, clear roadmap execution, and professional content.",
        founderMessage: "Muhyo Tech is focused on building practical digital products and improving the portfolio into a clearer service, project, and content system.",
    },

    goalsData: {
        hero: {
            badge: `Strategic Intent - ${CURRENT_YEAR}`,
            statement: "Building practical SaaS products, portfolio systems, and business-focused web tools with honest roadmap execution.",
        },
        progressMetrics: {
            totalGoals: 4,
            completedGoals: 1,
            inProgressGoals: 1,
            upcomingGoals: 2,
            overallProgress: 29,
        },
        companyHealth: {
            label: "Current roadmap pulse",
            note: "Company health values are calculated from active goals, roadmap items, content, services, projects, and admin configuration when database data is available.",
        },
        currentFocus: [
            {
                title: "Muhyo Tech Portfolio",
                status: "Completed",
                type: "Portfolio / Brand System",
                description: "The Muhyo Tech portfolio foundation is completed as a professional portfolio and service showcase with service pages, project case studies, admin management, SEO-ready content, and conversion-focused contact flow.",
                icon: "Layers",
            },
            {
                title: "SiteCraft AI",
                status: "Work Started",
                type: "AI SaaS Product",
                description: "An AI-powered website generation SaaS now entering initial development, focused on helping users create professional website foundations using templates, themes, personal information, category-based structures, and plan-based access.",
                icon: "Cpu",
            },
            {
                title: "QR Profile Connect",
                status: "Pending",
                type: "Digital Identity Product",
                description: "A planned QR-based digital profile web app where users can scan a QR code and view a professional profile, contact details, social links, services, and business identity.",
                icon: "Target",
            },
            {
                title: "LeadFlow AI",
                status: "Pending",
                type: "WhatsApp CRM / Lead System",
                description: "A planned WhatsApp-first CRM and lead management system for businesses to organize customer messages, leads, follow-ups, templates, and communication workflows.",
                icon: "MessageSquare",
            },
        ],
        activeProjects: [
            {
                title: "SiteCraft AI - AI Website Generation SaaS",
                status: "Work Started",
                description: "SiteCraft AI is a modern SaaS platform now entering initial development to help users generate professional website foundations using AI, templates, themes, personal information, and plan-based access.",
                modules: [
                    "AI website generation",
                    "User dashboard",
                    "Personal info system",
                    "Template system",
                    "Theme system",
                    "Plan-based access",
                    "Admin dashboard",
                    "Blog automation",
                    "Security hardening",
                    "Redis/cache optimization",
                    "Payment and membership system planned",
                    "Dynamic generated website templates",
                ],
                priorities: [
                    "Complete templates page",
                    "Complete generated website template engine",
                    "Improve website generation flow",
                    "Add plan and billing system",
                    "Add membership invite system",
                    "Improve security and cache layer",
                ],
                cta: { label: "View Projects", href: "/projects" },
            },
        ],
        plannedProjects: [
            {
                title: "QR Profile Connect",
                status: "Pending Product",
                description: "QR Profile Connect will let users create a digital profile that can be shared through a QR code. When someone scans the QR code, they can view the user's profile details, contact information, social links, services, business information, and important links in one clean mobile-friendly page.",
                features: [
                    "User profile dashboard",
                    "QR code generation",
                    "Public profile page",
                    "Contact details",
                    "Social links",
                    "Business information",
                    "Services list",
                    "Portfolio links",
                    "Download vCard option",
                    "Shareable public profile URL",
                    "Mobile-first design",
                ],
            },
            {
                title: "LeadFlow AI",
                status: "Pending SaaS Product",
                description: "LeadFlow AI is a planned WhatsApp-first CRM idea for businesses that want to manage customer messages, leads, follow-ups, templates, and communication workflows from one organized dashboard.",
                features: [
                    "Customer inbox",
                    "Lead tracking",
                    "Follow-up reminders",
                    "Message templates",
                    "Customer profiles",
                    "Conversation notes",
                    "Campaign planning",
                    "Basic analytics",
                    "Team workflow later",
                    "AI reply suggestions later",
                ],
            },
        ],
        portfolioGrowth: {
            title: "Muhyo Tech Portfolio Growth",
            description: "The Muhyo Tech portfolio foundation is completed as a professional digital brand system with service detail pages, project case studies, admin content management, contact handling, booking flow, and SEO-focused content. Future updates can continue as refinements instead of core build work.",
            improvements: [
                "Professional service detail pages",
                "Project case-study pages",
                "Blog system and AI automation",
                "Contact and booking flow",
                "Admin dashboard improvements",
                "SEO metadata",
                "Theme consistency",
                "Better data.js and database content structure",
                "More professional CTA flow",
            ],
        },
        roadmap: [
            { id: 1, title: "Muhyo Tech Portfolio Upgrade", status: "Completed", description: "Completed the core portfolio foundation with service pages, project details, About/Home content, Goals page direction, admin management, and SEO structure.", phase: "Completed", year: 2026, quarter: "Q3", order: 1 },
            { id: 2, title: "SiteCraft AI Core System", status: "Work Started", description: "Starting the AI website generation foundation with templates, themes, user dashboard, admin controls, plan limits, and generated website rendering.", phase: "Active", year: 2026, quarter: "Q3", order: 2 },
            { id: 3, title: "SiteCraft AI Billing & Membership", status: "Planned", description: "Adding plan detail pages, checkout flow, coupons, membership gifting, invite links, and secure subscription management.", phase: "Planned", year: 2026, quarter: "Q4", order: 3 },
            { id: 4, title: "QR Profile Connect MVP", status: "Pending", description: "Pending QR-based digital identity profile system with public profile pages and dashboard management.", phase: "Pending", year: 2027, quarter: "Q1", order: 4 },
            { id: 5, title: "LeadFlow AI MVP", status: "Pending", description: "Pending WhatsApp-first CRM concept for lead handling, follow-ups, templates, and business messaging workflows.", phase: "Pending", year: 2027, quarter: "Q2", order: 5 },
            { id: 6, title: "Future Digital Products", status: "Future", description: "Continue building practical SaaS tools and web systems that help businesses, creators, and professionals grow online.", phase: "Future", year: 2027, quarter: "Q3", order: 6 },
        ],
        recentProgress: [
            "Improved Muhyo Tech service page structure",
            "Planned professional project detail pages",
            "Improved About page content direction",
            "Improved Home page conversion flow",
            "Planned SiteCraft AI template engine",
            "Planned SiteCraft AI billing and membership system",
            "Planned security and Redis cache optimization",
            "Planned AI blog automation workflow",
        ],
        futureDirection: [
            { title: "Build Useful SaaS Products", description: "Focus on practical products that solve real problems for users and businesses.", icon: "Cpu" },
            { title: "Improve AI Website Creation", description: "Continue improving SiteCraft AI with templates, themes, personal info, and smarter generation flow.", icon: "Sparkles" },
            { title: "Create Better Business Tools", description: "Build tools for business communication, lead handling, digital profiles, and online presence.", icon: "MessageSquare" },
            { title: "Grow Muhyo Tech Brand", description: "Make Muhyo Tech a stronger portfolio and digital product brand through real projects, services, and content.", icon: "TrendingUp" },
        ],
        finalCTA: {
            heading: "Have an Idea or Project in Mind?",
            subtitle: "Muhyo Tech is actively building modern web products, SaaS systems, and business-focused digital solutions. Let's discuss your idea and turn it into something professional.",
            buttons: [
                { label: "Book a Call", href: "/contact" },
                { label: "Send Message", href: "/contact" },
                { label: "View Projects", href: "/projects" },
            ],
        },
        goals: [
            { id: 1, title: "Muhyo Tech Portfolio Upgrade", description: "Completed the core portfolio foundation with service pages, project detail pages, About/Home content, Goals page direction, admin management, and SEO-ready content structure.", category: "Portfolio Growth", status: "completed", priority: "high", progress: 100, featured: true, icon: "Layers", order: 1 },
            { id: 2, title: "SiteCraft AI Core System", description: "Start the AI website generation flow, templates, themes, personal info system, dashboard, admin controls, and generated website rendering.", category: "AI SaaS Product", status: "in-progress", priority: "critical", progress: 15, featured: true, icon: "Cpu", order: 2 },
            { id: 3, title: "QR Profile Connect MVP", description: "Pending QR-based digital identity product with dashboard management, public profile pages, contact details, social links, and vCard support.", category: "Digital Identity Product", status: "planned", priority: "medium", progress: 0, featured: false, icon: "Target", order: 3 },
            { id: 4, title: "LeadFlow AI MVP Research", description: "Pending WhatsApp-first CRM concept for lead handling, follow-up reminders, templates, customer notes, and organized business messaging.", category: "Business Tool", status: "planned", priority: "medium", progress: 0, featured: false, icon: "MessageSquare", order: 4 },
        ],
    },

    roadmapData: [],

    milestonesData: [],
};
const slugifyProject = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const groupTechnologies = (techStack = []) => ({
    frontend: techStack.filter((tech) =>
        /next|react|tailwind|framer|three|d3|typescript/i.test(tech),
    ),
    backend: techStack.filter((tech) =>
        /node|express|api|fastapi|go|prisma/i.test(tech),
    ),
    database: techStack.filter((tech) =>
        /mongo|mongoose|postgres|redis|firebase/i.test(tech),
    ),
    tools: techStack.filter((tech) =>
        /vercel|aws|docker|github|vs code/i.test(tech),
    ),
    integrations: techStack.filter((tech) =>
        /cloudinary|stripe|socket|web3|solidity|biometrics|google|maps|nodemailer|analytics|search console/i.test(tech),
    ),
});

const projectCaseStudyDetails = {
    "apex-e-commerce-ecosystem": {
        shortDescription: "A conversion-focused retail platform for product discovery, checkout, and operational growth.",
        longDescription: "Apex E-Commerce Ecosystem is a modern retail experience built around fast browsing, clear merchandising, secure checkout, and scalable catalog management. The project presents a premium shopping journey with strong product storytelling, cart flow, and business-ready structure.",
        overview: "Apex E-Commerce Ecosystem is a full retail platform concept designed for brands that need more than a simple product grid. It combines storefront presentation, product detail flows, checkout readiness, inventory-friendly structure, and conversion-focused UI patterns so customers can discover products quickly and move toward purchase with confidence.",
        projectType: "E-Commerce Platform",
        duration: "4-6 weeks",
        clientType: "Retail and DTC brand",
        role: "Full-Stack Developer, UI/UX Implementer, Commerce Flow Architect",
        responsibilities: [
            "Mapped the storefront and checkout journey",
            "Designed reusable product, category, and promotion sections",
            "Structured catalog, cart, and order-ready data patterns",
            "Implemented responsive commerce UI components",
            "Prepared SEO-friendly product and category presentation",
        ],
        problem: "Retail websites often lose buyers when product discovery is slow, checkout feels unclear, or promotional content is disconnected from the catalog. This project solves that by combining a fast storefront, focused product hierarchy, and conversion-friendly interaction flow.",
        goals: [
            "Create a premium storefront that builds product trust",
            "Make product browsing, filtering, and cart actions feel simple",
            "Support scalable catalog and campaign presentation",
            "Prepare clean routes and metadata for search visibility",
            "Keep the experience fast and responsive across devices",
        ],
        features: [
            { title: "Product Discovery", description: "Organized catalog browsing with clear category, product, and promotional sections.", icon: "Search" },
            { title: "Checkout Flow", description: "Cart and checkout-ready structure focused on fewer distractions and higher completion confidence.", icon: "CheckCircle2" },
            { title: "Retail CMS Structure", description: "Reusable content zones for products, campaigns, banners, and featured collections.", icon: "Layers" },
            { title: "Performance First UI", description: "Image-led shopping experience planned around responsive layouts and fast rendering.", icon: "Rocket" },
        ],
        modules: [
            { title: "Home Storefront", description: "Featured collections, promotions, trust points, and brand storytelling.", type: "Public" },
            { title: "Product Listing", description: "Category browsing, product cards, and structured product discovery.", type: "Catalog" },
            { title: "Product Detail", description: "Focused product information, imagery, pricing, and purchase actions.", type: "Commerce" },
            { title: "Cart / Checkout", description: "Order review and checkout-ready user flow.", type: "Conversion" },
            { title: "Admin Catalog", description: "Management-ready structure for product and collection updates.", type: "Admin" },
        ],
        technologies: {
            frontend: ["Next.js", "TypeScript", "Tailwind CSS"],
            backend: ["Next.js API Routes"],
            database: ["PostgreSQL"],
            tools: ["Git", "GitHub", "Vercel"],
            integrations: ["Stripe"],
        },
        processSteps: [
            { step: 1, title: "Commerce Planning", description: "Defined product hierarchy, user flow, and purchase touchpoints." },
            { step: 2, title: "UI Direction", description: "Created a premium retail visual system for catalog and product pages." },
            { step: 3, title: "Frontend Build", description: "Built reusable storefront, product, and checkout-ready components." },
            { step: 4, title: "Commerce Structure", description: "Prepared catalog data, cart patterns, and payment integration points." },
            { step: 5, title: "SEO and Polish", description: "Improved metadata, image presentation, responsiveness, and conversion clarity." },
        ],
        challenges: [
            { title: "Balancing visuals and speed", problem: "Retail pages need rich imagery but slow media can hurt browsing and conversion.", solution: "Used stable image ratios, optimized media presentation, and component-level hierarchy to keep the shopping experience smooth." },
            { title: "Keeping checkout focused", problem: "Checkout flows can become noisy when promotions, totals, and product details compete for attention.", solution: "Separated discovery content from purchase actions and kept cart/checkout messaging direct." },
        ],
        results: [
            { title: "Stronger product presentation", description: "The storefront communicates product value clearly with better hierarchy and visual trust." },
            { title: "Conversion-ready foundation", description: "Catalog, cart, and checkout sections are organized for future payment and order management growth." },
        ],
        relatedServices: ["e-commerce-development", "custom-website-development", "seo-friendly-website-setup"],
    },
    "nova-real-estate-muhyo-tech": {
        shortDescription: "A property platform concept for listings, immersive previews, maps, and lead generation.",
        overview: "Nova Real Estate Muhyo Tech helps real estate teams present properties with strong visuals, structured listing details, map context, and clear inquiry actions. The experience is designed for buyers and renters who need to compare properties quickly while still feeling the premium quality of each listing.",
        projectType: "Real Estate Platform",
        duration: "4-5 weeks",
        clientType: "Real estate agency",
        role: "Frontend Developer, UI/UX Implementer, Listing Experience Architect",
        responsibilities: ["Designed the property browsing and detail experience", "Structured listing cards, gallery sections, and map-ready content", "Built responsive pages for property discovery", "Prepared lead capture and inquiry pathways", "Organized content for premium property presentation"],
        problem: "Many property websites show listings as static cards without enough visual context, comparison support, or inquiry clarity. This project solves that by making property browsing more visual, structured, and action-oriented.",
        goals: ["Present properties with premium visuals and useful details", "Make location and listing comparison easier", "Support immersive media such as walkthroughs or rich galleries", "Create clear inquiry paths for serious leads", "Keep the layout responsive for mobile property search"],
        features: [
            { title: "Property Listings", description: "Structured cards for price, location, property type, and key highlights.", icon: "Layers" },
            { title: "Immersive Gallery", description: "Image-led property detail pages prepared for tours and visual previews.", icon: "MonitorSmartphone" },
            { title: "Map Context", description: "Location-ready layout for nearby context and property discovery.", icon: "Target" },
            { title: "Lead Flow", description: "Clear inquiry actions for booking visits, asking questions, or requesting details.", icon: "Rocket" },
        ],
        modules: [
            { title: "Listings Page", description: "Searchable property cards and category-driven discovery.", type: "Public" },
            { title: "Property Detail", description: "Gallery, features, location, pricing, and inquiry content.", type: "Public" },
            { title: "Map View", description: "Location context and geographic browsing support.", type: "Feature" },
            { title: "Inquiry Flow", description: "Contact pathway for property questions and visit requests.", type: "Conversion" },
        ],
        technologies: { frontend: ["React", "Three.js"], backend: ["Node.js"], database: ["MongoDB"], tools: ["Git", "GitHub"], integrations: ["Google Maps API"] },
        processSteps: [
            { step: 1, title: "Listing Strategy", description: "Defined the property information architecture and lead flow." },
            { step: 2, title: "Visual System", description: "Planned card, gallery, and detail layouts for premium property presentation." },
            { step: 3, title: "Frontend Build", description: "Implemented responsive listing and property detail sections." },
            { step: 4, title: "Map and Media Planning", description: "Prepared the structure for maps, galleries, and immersive previews." },
            { step: 5, title: "Lead Polish", description: "Refined inquiry actions and mobile behavior for better conversion clarity." },
        ],
        challenges: [
            { title: "Presenting many details cleanly", problem: "Property pages require price, features, location, media, and contact actions without feeling crowded.", solution: "Grouped content into scannable sections and used strong visual hierarchy for the most important details." },
            { title: "Supporting visual media", problem: "Real estate experiences depend on images and previews that can become heavy.", solution: "Used structured gallery presentation and responsive media sizing to keep the interface stable." },
        ],
        results: [
            { title: "More polished property discovery", description: "Listings feel easier to scan, compare, and understand." },
            { title: "Better lead readiness", description: "The project gives visitors clearer paths to request information or schedule a viewing." },
        ],
        relatedServices: ["custom-website-development", "full-stack-web-app-development", "ui-ux-design"],
    },
    "pulse-health-ai": {
        shortDescription: "A healthcare analytics dashboard concept for monitoring signals, trends, and patient-facing insights.",
        overview: "Pulse Health AI focuses on presenting health data in a calm, readable, and decision-supportive dashboard. It organizes vitals, trend charts, alerts, and patient context so care teams can scan information faster while avoiding unnecessary interface noise.",
        projectType: "HealthTech Dashboard",
        duration: "5-7 weeks",
        clientType: "Healthcare technology team",
        role: "Dashboard UI Developer, Data Visualization Implementer, API Integration Developer",
        responsibilities: ["Planned dashboard information hierarchy", "Built reusable chart and insight sections", "Structured patient and metric views", "Prepared secure API integration patterns", "Improved responsive readability for dense data"],
        problem: "Healthcare teams often work with complex data spread across multiple views. The challenge was to make patient signals, trends, and alerts easier to scan without overstating automated recommendations.",
        goals: ["Create a clear dashboard for patient signal review", "Visualize trends in a readable and responsible way", "Support secure data flow and API-ready architecture", "Reduce visual noise in high-density healthcare screens", "Keep the interface responsive for clinical review contexts"],
        features: [
            { title: "Vitals Dashboard", description: "Metric cards and trend sections for reviewing patient health signals.", icon: "MonitorSmartphone" },
            { title: "Data Visualization", description: "Charts and insight panels designed for quick scanning and careful interpretation.", icon: "Search" },
            { title: "Alert Structure", description: "Priority-ready messaging for notable changes and follow-up indicators.", icon: "Shield" },
            { title: "Secure API Pattern", description: "Backend-ready structure for controlled healthcare data exchange.", icon: "Code2" },
        ],
        modules: [
            { title: "Overview Dashboard", description: "High-level vitals, alerts, and care summary sections.", type: "Dashboard" },
            { title: "Patient Profile", description: "Patient context, timeline, and metric history.", type: "Data" },
            { title: "Trend Analytics", description: "Charts for changes over time and comparative review.", type: "Analytics" },
            { title: "Alerts", description: "Structured notifications for flagged readings or follow-up needs.", type: "Workflow" },
        ],
        technologies: { frontend: ["React", "D3.js"], backend: ["Python", "FastAPI"], database: [], tools: ["Git", "AWS"], integrations: ["FHIR-ready API structure"] },
        processSteps: [
            { step: 1, title: "Data Model Review", description: "Identified the core health signals and dashboard priorities." },
            { step: 2, title: "Dashboard Wireframe", description: "Organized dense information into readable cards, charts, and panels." },
            { step: 3, title: "Chart Implementation", description: "Built visualization components for trend and metric display." },
            { step: 4, title: "API Planning", description: "Prepared backend routes and secure data exchange assumptions." },
            { step: 5, title: "Accessibility Review", description: "Refined contrast, labels, spacing, and responsive behavior for readability." },
        ],
        challenges: [
            { title: "Avoiding data overload", problem: "Healthcare dashboards can become difficult to read when every metric competes for attention.", solution: "Created a prioritized layout with summary cards, focused charts, and clear section grouping." },
            { title: "Presenting AI responsibly", problem: "Automated insight labels must not imply unsupported medical certainty.", solution: "Used careful wording around trends, flags, and review support instead of definitive claims." },
        ],
        results: [
            { title: "Clearer clinical dashboard structure", description: "The interface makes dense health information easier to scan and explain." },
            { title: "API-ready analytics foundation", description: "The project is organized for future secure integrations and richer health data workflows." },
        ],
        relatedServices: ["full-stack-web-app-development", "api-integration-development", "admin-dashboard-development"],
    },
    "vault-crypto-wallet": {
        shortDescription: "A security-first wallet interface for multi-chain balances, transfers, and protected access.",
        overview: "Vault Crypto Wallet brings together portfolio visibility, account protection, transaction review, and multi-chain wallet interactions in a clean mobile experience. The project emphasizes trust, clarity, and careful confirmation moments across sensitive financial actions.",
        projectType: "FinTech Mobile App",
        duration: "5-6 weeks",
        clientType: "FinTech product team",
        role: "Mobile UI Developer, Web3 Flow Designer, Security-Focused UX Implementer",
        responsibilities: ["Designed secure onboarding and wallet access flows", "Structured asset balance and transaction review screens", "Prepared multi-chain interaction patterns", "Implemented responsive mobile-first UI concepts", "Planned careful confirmation states for sensitive actions"],
        problem: "Crypto wallet users need strong security and clear transaction context, but many wallet interfaces make balances, network state, and confirmation steps hard to understand. This project focuses on trust-building wallet UX.",
        goals: ["Make wallet access feel secure and understandable", "Present balances and transactions with clear hierarchy", "Support multi-chain wallet concepts", "Reduce mistakes during transfer confirmation", "Keep sensitive actions visually distinct and deliberate"],
        features: [
            { title: "Secure Access", description: "Authentication-ready flows with biometric and protected session patterns.", icon: "Shield" },
            { title: "Asset Portfolio", description: "Clear wallet overview for balances, networks, and recent activity.", icon: "Layers" },
            { title: "Transaction Review", description: "Confirmation screens that clarify amount, address, network, and fees.", icon: "CheckCircle2" },
            { title: "Multi-Chain Ready", description: "Structure prepared for assets across Ethereum, Solana, Bitcoin, and similar networks.", icon: "Code2" },
        ],
        modules: [
            { title: "Onboarding", description: "Wallet setup, access protection, and recovery education.", type: "Mobile" },
            { title: "Portfolio", description: "Balance overview, asset list, and market-friendly summaries.", type: "Dashboard" },
            { title: "Send / Receive", description: "Guided transfer flow with address and fee review.", type: "Wallet" },
            { title: "Security Settings", description: "Biometric access, session control, and recovery guidance.", type: "Security" },
        ],
        technologies: { frontend: ["React Native"], backend: [], database: ["Firebase"], tools: ["Git", "GitHub"], integrations: ["Web3.js", "Solidity", "Biometrics"] },
        processSteps: [
            { step: 1, title: "Wallet Flow Mapping", description: "Mapped onboarding, portfolio, transfer, and security screens." },
            { step: 2, title: "Trust UI Direction", description: "Defined visual states for warnings, confirmations, and protected actions." },
            { step: 3, title: "Mobile Component Build", description: "Created reusable cards, lists, and transaction review layouts." },
            { step: 4, title: "Web3 Interaction Planning", description: "Prepared wallet connection and chain-aware interface assumptions." },
            { step: 5, title: "Security Polish", description: "Reviewed confirmation copy, sensitive states, and mobile usability." },
        ],
        challenges: [
            { title: "Reducing transaction mistakes", problem: "Wallet users can lose trust quickly if transfer details are unclear.", solution: "Separated transaction review into clear fields and emphasized confirmation states before sensitive actions." },
            { title: "Explaining security without friction", problem: "Security steps can feel complicated when onboarding is too technical.", solution: "Used plain UI labels, progressive steps, and familiar mobile security patterns." },
        ],
        results: [
            { title: "Trust-focused wallet experience", description: "Sensitive wallet flows feel clearer, calmer, and easier to verify." },
            { title: "Mobile-first product foundation", description: "The screen structure supports future wallet integrations and account protection features." },
        ],
        relatedServices: ["mobile-app-development", "full-stack-web-app-development", "api-integration-development"],
    },
    "zenith-saas-dashboard": {
        shortDescription: "A SaaS operations dashboard for logistics visibility, workflows, and team coordination.",
        overview: "Zenith SaaS Dashboard organizes operational data into a practical interface for teams managing shipments, tasks, statuses, and exceptions. It is designed as a scalable SaaS dashboard with clear navigation, reusable modules, and data-heavy screens that remain readable.",
        projectType: "SaaS Dashboard",
        duration: "5-7 weeks",
        clientType: "Operations and logistics team",
        role: "Full-Stack Developer, Dashboard Architect, Backend Workflow Implementer",
        responsibilities: ["Designed dashboard navigation and operational modules", "Built reusable data cards, tables, and status components", "Structured backend-ready workflows and API patterns", "Prepared role-friendly views for team operations", "Improved responsiveness for dense SaaS screens"],
        problem: "Logistics teams need status visibility and workflow consistency, but scattered spreadsheets and manual tracking create delays and missed updates. This dashboard centralizes operational information into a cleaner SaaS workflow.",
        goals: ["Create a clear operations dashboard for daily workflows", "Support status tracking, records, and task visibility", "Prepare scalable modules for future SaaS features", "Keep dense information readable and action-oriented", "Build a foundation for automation and API integrations"],
        features: [
            { title: "Operations Dashboard", description: "Summary cards, status panels, and key workflow views for team visibility.", icon: "MonitorSmartphone" },
            { title: "Workflow Tracking", description: "Structured records and status states for shipments, tasks, or operational items.", icon: "CheckCircle2" },
            { title: "Team Modules", description: "Role-ready sections for repeated internal operations.", icon: "Layers" },
            { title: "Scalable Backend Pattern", description: "API and data structure prepared for automation, caching, and integrations.", icon: "Code2" },
        ],
        modules: [
            { title: "Dashboard Overview", description: "KPIs, statuses, recent activity, and operational summaries.", type: "Dashboard" },
            { title: "Shipment / Task Records", description: "Table-based workflow management with filters and status labels.", type: "Operations" },
            { title: "Team Workspace", description: "Assignment and coordination-ready sections.", type: "Collaboration" },
            { title: "Reports", description: "Performance summaries and export-ready operational insights.", type: "Analytics" },
            { title: "Admin Settings", description: "Configuration structure for users, statuses, and permissions.", type: "Admin" },
        ],
        technologies: { frontend: ["Next.js"], backend: ["Go", "Prisma"], database: ["Redis"], tools: ["Docker", "GitHub", "Vercel"], integrations: [] },
        processSteps: [
            { step: 1, title: "Workflow Audit", description: "Identified the key records, statuses, and team actions." },
            { step: 2, title: "Dashboard Architecture", description: "Planned navigation, table structure, filters, and summary panels." },
            { step: 3, title: "UI Implementation", description: "Built dense dashboard sections with stable spacing and clear states." },
            { step: 4, title: "Backend Planning", description: "Prepared API-ready workflow and caching assumptions." },
            { step: 5, title: "Operational Polish", description: "Refined table readability, responsive behavior, and empty states." },
        ],
        challenges: [
            { title: "Making dense data readable", problem: "SaaS dashboards can feel overwhelming when tables, metrics, and actions share one screen.", solution: "Separated the page into summary, workflow, and detail areas with clear status language." },
            { title: "Preparing for scale", problem: "Operational dashboards often grow quickly as teams add reports and automations.", solution: "Used modular data sections and backend-ready patterns so new workflows can be added without reshaping the whole interface." },
        ],
        results: [
            { title: "Centralized operations view", description: "The dashboard gives teams a clearer place to review statuses and coordinate work." },
            { title: "Scalable SaaS structure", description: "Modules, records, and settings are prepared for future automation and reporting." },
        ],
        relatedServices: ["admin-dashboard-development", "full-stack-web-app-development", "api-integration-development"],
    },
    "muhyo-tech-portfolio-elite-edition": {
        shortDescription: "A premium full-stack developer portfolio with dynamic sections, admin management, and conversion-focused pages.",
        longDescription: "Muhyo Tech Portfolio is a premium full-stack developer portfolio built to showcase services, projects, blogs, resume, contact inquiries, and business communication in one modern digital platform. The project is designed with a dark futuristic interface, dynamic content sections, admin management, SEO-ready structure, and professional conversion-focused pages.",
        overview: "Muhyo Tech Portfolio is a premium full-stack developer portfolio built to showcase services, projects, blogs, resume, contact inquiries, and business communication in one modern digital platform. The project is designed with a dark futuristic interface, dynamic content sections, admin management, SEO-ready structure, and professional conversion-focused pages.",
        projectType: "Full-Stack Portfolio CMS",
        duration: "6-8 weeks",
        clientType: "Personal brand / technology studio",
        role: "Full-Stack Developer, UI/UX Implementer, Backend/API Developer, Admin Dashboard Developer",
        responsibilities: ["Designed and developed the frontend interface", "Built reusable UI sections and cards", "Created service, project, and blog pages", "Integrated contact and booking flows", "Structured admin dashboard modules", "Added SEO metadata and responsive layouts", "Handled deployment-ready architecture"],
        problem: "Traditional portfolio websites often only show static information and do not support real business workflows like service management, project updates, blog publishing, contact messages, booking requests, and content control from an admin dashboard.",
        goals: ["Build a premium developer portfolio with a professional brand identity", "Showcase services, projects, blogs, skills, and experience", "Add dynamic admin-managed content", "Improve client inquiry and booking flow", "Create SEO-ready pages for services, projects, and blogs", "Maintain fast performance and responsive design"],
        features: [
            { title: "Dynamic Services Showcase", description: "Service pages and cards explain offers with clear conversion paths.", icon: "Layers" },
            { title: "Project Portfolio System", description: "Project listing and case-study pages present work in a detailed professional format.", icon: "MonitorSmartphone" },
            { title: "Blog / Article Section", description: "Content publishing structure for articles, SEO, and thought leadership.", icon: "Search" },
            { title: "Contact & Booking Flow", description: "Contact forms and booking calls help turn visitors into qualified inquiries.", icon: "Rocket" },
            { title: "Admin Content Management", description: "Protected dashboard modules manage content, messages, bookings, and settings.", icon: "Shield" },
            { title: "Responsive Dark Premium Design", description: "Consistent dark UI, animation, cards, and visual hierarchy across pages.", icon: "Sparkles" },
        ],
        modules: [
            { title: "Home Page", description: "Hero, services, featured work, skills, contact prompts, and final CTA.", type: "Public" },
            { title: "About Page", description: "Founder story, experience, values, process, and professional credibility.", type: "Public" },
            { title: "Services Pages", description: "Services index and detail pages with SEO-ready explanations.", type: "Public" },
            { title: "Projects Pages", description: "Project grid and detailed case-study pages.", type: "Public" },
            { title: "Blog Pages", description: "Article listing and detail pages for publishing content.", type: "Content" },
            { title: "Contact / Booking", description: "Lead capture and consultation request flows.", type: "Conversion" },
            { title: "Admin Dashboard", description: "Protected content, messages, bookings, analytics, and management modules.", type: "Admin" },
        ],
        technologies: { frontend: ["Next.js", "React.js", "Tailwind CSS", "Framer Motion"], backend: ["Node.js", "Next.js API Routes"], database: ["MongoDB", "Mongoose"], tools: ["Git", "GitHub", "Vercel", "VS Code"], integrations: ["Cloudinary", "Nodemailer", "Socket.io"] },
        processSteps: [
            { step: 1, title: "Requirement Planning", description: "Defined the portfolio goals, pages, admin workflows, and conversion points." },
            { step: 2, title: "UI/UX Direction", description: "Created a dark premium style with reusable sections and consistent motion." },
            { step: 3, title: "Frontend Development", description: "Built responsive public pages, cards, CTAs, and animation patterns." },
            { step: 4, title: "Dynamic Content Structure", description: "Mapped services, projects, blogs, resume, and profile data into reusable structures." },
            { step: 5, title: "Admin Dashboard Integration", description: "Connected protected dashboard modules for content and communication management." },
            { step: 6, title: "SEO and Performance Setup", description: "Added metadata, canonical URLs, responsive images, and route-ready content." },
            { step: 7, title: "Testing and Deployment", description: "Reviewed routes, empty states, responsiveness, and deployment readiness." },
        ],
        challenges: [
            { title: "Creating a portfolio that works like a business system", problem: "The portfolio needed more than static sections; it needed service, project, blog, booking, and contact flows.", solution: "Structured the project with dynamic data, reusable components, and admin-ready modules." },
            { title: "Maintaining premium design consistency", problem: "Multiple pages and sections needed to feel part of the same brand.", solution: "Used shared theme styles, reusable cards, and consistent spacing, gradients, and animations." },
            { title: "Keeping data editable without breaking pages", problem: "Admin-managed fields can be incomplete while public pages still need to look polished.", solution: "Added complete defaults, optional rendering, and safe field fallbacks across project detail pages." },
        ],
        results: [
            { title: "Professional portfolio presentation", description: "The website now communicates services, projects, skills, and founder credibility with a premium interface." },
            { title: "Better service and project visibility", description: "Project and service routes support detailed SEO-friendly pages instead of shallow previews." },
            { title: "Improved contact and booking flow", description: "Visitors have clearer paths to message, book a call, or explore services." },
            { title: "Admin-managed content workflow", description: "The content model supports future updates from a protected dashboard and import flow." },
        ],
        relatedServices: ["custom-website-development", "next-js-website-development", "full-stack-web-app-development", "admin-dashboard-development", "seo-friendly-website-setup"],
    },
    "muhyo-tech-admin-console": {
        shortDescription: "A protected admin console for managing portfolio content, communication, security, and operational visibility.",
        overview: "Muhyo Tech Admin Console turns the portfolio into an actively managed business platform. It supports protected access, content management, communication workflows, analytics visibility, and operational tools so the public website can evolve without manual code edits for every update.",
        projectType: "Admin Dashboard / CMS",
        duration: "5-7 weeks",
        clientType: "Internal operations and content team",
        role: "Admin Dashboard Developer, Backend/API Developer, Security Workflow Implementer",
        responsibilities: ["Built protected admin modules and dashboard layouts", "Structured CRUD workflows for services, projects, blogs, and profile content", "Integrated validation and API response patterns", "Prepared real-time refresh and notification behavior", "Improved cache invalidation and import workflows"],
        problem: "A portfolio with dynamic services, blogs, projects, bookings, and messages becomes hard to manage when every update requires code changes. The admin console solves this by centralizing content and communication workflows.",
        goals: ["Manage portfolio content from a protected dashboard", "Support project, service, blog, and about updates", "Centralize messages, bookings, and operational feedback", "Improve safety with validation, permissions, and audit logging", "Keep public pages fresh through cache invalidation and sync flows"],
        features: [
            { title: "Protected CMS", description: "Admin-only modules for services, projects, blogs, about data, and settings.", icon: "Shield" },
            { title: "Project Import Flow", description: "Seed data can update MongoDB projects by slug without duplicate records.", icon: "Layers" },
            { title: "Real-Time Updates", description: "Socket-ready events help dashboard and public data stay synchronized.", icon: "Rocket" },
            { title: "Validation and Audit Trail", description: "Structured forms, API responses, and activity logging improve operational confidence.", icon: "CheckCircle2" },
        ],
        modules: [
            { title: "Dashboard Overview", description: "Stats, charts, recent activity, and operational snapshot.", type: "Admin" },
            { title: "Projects Management", description: "Create, edit, import, reorder, and publish project case-study data.", type: "CMS" },
            { title: "Services Management", description: "Manage service offers, descriptions, SEO fields, and ordering.", type: "CMS" },
            { title: "Blogs Management", description: "Publish and edit articles with media and metadata.", type: "CMS" },
            { title: "Messages and Bookings", description: "Review visitor messages and call requests.", type: "Communication" },
            { title: "Security and Settings", description: "Admin profile, verification, and operational settings.", type: "Security" },
        ],
        technologies: { frontend: ["Next.js", "React Query", "Zod"], backend: ["Next.js API Routes"], database: ["MongoDB", "Mongoose"], tools: ["Git", "GitHub", "Vercel"], integrations: ["Socket.io", "Cloudinary", "Nodemailer"] },
        processSteps: [
            { step: 1, title: "Admin Workflow Planning", description: "Mapped content, communication, and dashboard management needs." },
            { step: 2, title: "Protected Layout Build", description: "Created dashboard screens, tables, forms, modals, and management states." },
            { step: 3, title: "API and Validation Setup", description: "Connected CRUD routes, schema validation, and consistent responses." },
            { step: 4, title: "Import and Cache Logic", description: "Added data sync, upsert behavior, revalidation, and cache invalidation." },
            { step: 5, title: "Operational Polish", description: "Reviewed permissions, audit logging, empty states, and responsive dashboard behavior." },
        ],
        challenges: [
            { title: "Supporting many content types safely", problem: "Projects, services, blogs, messages, and bookings all need different fields and workflows.", solution: "Kept forms modular and added flexible model fields with optional frontend rendering." },
            { title: "Avoiding duplicate imported projects", problem: "Seed imports can create duplicates if they do not match existing records reliably.", solution: "Used slug-based upsert logic with cache invalidation and summary reporting." },
            { title: "Keeping public pages current", problem: "Admin edits need to appear on public pages without stale cached content.", solution: "Revalidated key routes and invalidated project cache after write operations." },
        ],
        results: [
            { title: "Centralized content operations", description: "The admin console gives one place to manage public website content and communication workflows." },
            { title: "Safer project data updates", description: "Project import and edit flows support richer case-study fields while avoiding duplicates." },
            { title: "Scalable dashboard foundation", description: "The module structure can grow into analytics, newsletters, security tools, and advanced CMS features." },
        ],
        relatedServices: ["admin-dashboard-development", "full-stack-web-app-development", "api-integration-development"],
    },
};

const uniqueGalleryImages = (items = []) => {
    const seen = new Set();
    return items
        .map((item) => (typeof item === "string" ? { url: item } : item))
        .filter((item) => {
            const url = item?.url;
            if (!url || seen.has(url)) return false;
            seen.add(url);
            return true;
        });
};

const buildProjectCaseStudy = (project, index) => {
    const slug = project.slug || slugifyProject(project.title);
    const caseStudy = projectCaseStudyDetails[slug] || {};
    const techStack = Array.isArray(project.techStack) ? project.techStack : [];
    const galleryImages = uniqueGalleryImages([
        ...(project.thumbnail ? [{ url: project.thumbnail, alt: project.title, caption: "Project preview" }] : []),
        ...(project.gallery || []).map((url, imageIndex) => ({
            url,
            alt: `${project.title} screenshot ${imageIndex + 1}`,
            caption: `Project screenshot ${imageIndex + 1}`,
        })),
        ...(caseStudy.galleryImages || []),
    ]);

    return {
        ...project,
        ...caseStudy,
        slug,
        shortDescription: caseStudy.shortDescription || project.shortDescription || project.description,
        longDescription: caseStudy.longDescription || project.longDescription || project.details || project.description,
        overview: caseStudy.overview || project.overview || project.details || project.description,
        projectType: caseStudy.projectType || project.projectType || project.purpose || project.category,
        status: project.status || project.publishStatus || "published",
        publishStatus: project.publishStatus || project.status || "published",
        isFeatured: project.isFeatured ?? project.featured ?? index < 3,
        featured: project.featured ?? project.isFeatured ?? index < 3,
        thumbnailImage: project.thumbnailImage || project.thumbnail,
        heroImage: project.heroImage || project.thumbnail,
        galleryImages,
        liveUrl: project.liveUrl || project.liveLink || project.demoLink || "",
        githubUrl: project.githubUrl || project.gitLink || project.githubLink || "",
        year: caseStudy.year || project.year || String(CURRENT_YEAR),
        duration: caseStudy.duration || project.duration || "",
        clientType: caseStudy.clientType || project.clientType || project.purpose || "Digital product",
        role: caseStudy.role || project.role || "Full-stack development, UI implementation, project structure, and deployment-ready setup.",
        responsibilities: caseStudy.responsibilities || project.responsibilities || [
            "UI/UX implementation",
            "Frontend development",
            "Backend/API structure",
            "Responsive experience",
            "SEO-ready page structure",
        ],
        problem: caseStudy.problem || project.problem || project.problemSolved || `Build a professional ${project.purpose || project.category} experience with clear structure, reliable performance, and a polished user journey.`,
        goals: caseStudy.goals || project.goals || [
            "Create a modern responsive interface",
            "Present core functionality clearly",
            "Build a maintainable foundation",
            "Support future content and feature growth",
        ],
        features: caseStudy.features || project.features || [
            { title: "Responsive experience", description: "Designed to work cleanly across mobile, tablet, and desktop screens.", icon: "MonitorSmartphone" },
            { title: "Modern interface", description: "Premium UI structure with clear hierarchy and purposeful user flow.", icon: "Sparkles" },
            { title: "Scalable foundation", description: "Organized project structure prepared for future feature expansion.", icon: "Layers" },
            { title: "SEO-ready structure", description: "Content and metadata prepared for professional sharing and discovery.", icon: "Search" },
        ],
        modules: caseStudy.modules || project.modules || [
            { title: "Public experience", description: "Visitor-facing pages and project presentation.", type: "Public" },
            { title: "Content structure", description: "Organized content areas for project details, images, and calls to action.", type: "Content" },
            { title: "Contact flow", description: "Clear paths for visitors to ask for similar work.", type: "Conversion" },
        ],
        technologies: caseStudy.technologies || project.technologies || groupTechnologies(techStack),
        processSteps: caseStudy.processSteps || project.processSteps || [
            { step: 1, title: "Requirement understanding", description: "Clarified project goals, target users, and core functionality." },
            { step: 2, title: "Structure planning", description: "Mapped content hierarchy, pages, modules, and reusable components." },
            { step: 3, title: "UI development", description: "Built responsive interface sections using the project visual system." },
            { step: 4, title: "Integration", description: "Connected data, media, links, and interaction flows where needed." },
            { step: 5, title: "Testing and polish", description: "Reviewed layout behavior, responsiveness, and missing-field fallbacks." },
        ],
        challenges: caseStudy.challenges || project.challenges || [
            {
                title: "Clear project presentation",
                problem: "The project needed enough detail to explain value without overwhelming visitors.",
                solution: "Structured the case study into overview, goals, features, technologies, process, and CTA sections.",
            },
            {
                title: "Responsive premium UI",
                problem: "The design needed to stay polished across screen sizes.",
                solution: "Used consistent cards, grids, media ratios, and responsive spacing from the existing theme.",
            },
        ],
        results: caseStudy.results || project.results || [
            { title: "Professional online presence", description: project.impact || "Created a polished, shareable project presentation." },
            { title: "Scalable content foundation", description: "Project details can be expanded with modules, gallery items, technologies, and SEO fields." },
        ],
        relatedServices: caseStudy.relatedServices || project.relatedServices || ["web-development", "api-development", "seo-digital-growth"],
        seoTitle: project.seoTitle || `${project.title} | Muhyo Tech`,
        seoDescription: project.seoDescription || caseStudy.shortDescription || project.description,
        keywords: project.keywords || [project.title, project.category, project.purpose, ...techStack].filter(Boolean),
        sortOrder: project.sortOrder ?? project.order ?? index,
    };
};

export const projectsData = portfolioData.projects.map(buildProjectCaseStudy);

portfolioData.projects = projectsData;
portfolioData.about = aboutData;
portfolioData.home = homeData;
portfolioData.services = servicesSeedData;



export const privacyDocument = {
  type: "Privacy Policy",
  slug: "privacy",
  title: "Privacy explained without the fine-print fog.",
  description:
    "This Policy explains what information Muhyo Tech collects through its website, why it is used, which service providers may process it, and the choices available to you.",
  effectiveDate: "July 14, 2026",
  updatedDate: "July 14, 2026",
  version: "2.0",
  readTime: "10 minutes",
  highlights: [
    { icon: "fingerprint", title: "Purpose-led collection", text: "We collect information needed to respond, arrange calls, deliver services, secure the site, and understand performance." },
    { icon: "lock", title: "Protected operations", text: "Access controls, validation, rate limits, authentication, and reputable infrastructure help protect stored information." },
    { icon: "shield", title: "Meaningful choices", text: "You can unsubscribe and may request access, correction, or deletion where applicable." },
  ],
  sections: [
    {
      id: "who-we-are",
      icon: "fingerprint",
      title: "Who we are",
      paragraphs: [
        "Muhyo Tech is a software and web-engineering business based in Lahore, Pakistan. For information submitted through muhyotech.com, Muhyo Tech determines how and why that information is used unless a project agreement states otherwise.",
        "Privacy questions or requests can be sent through our contact page. We may ask for reasonable verification before acting on a request to protect your information from unauthorised access.",
      ],
    },
    {
      id: "information-collected",
      icon: "scroll",
      title: "Information we collect",
      paragraphs: ["The information collected depends on how you use the website and which information you choose to provide."],
      items: [
        "Contact information such as your name, email address, phone number, company, and preferred contact method.",
        "Inquiry and project information such as service interest, objectives, budget or timeline context, messages, attachments, and communication history.",
        "Booking information such as requested service, preferred date and time, project type, source page, and booking status.",
        "Newsletter information such as email address, subscription status, subscription date, and email-delivery history.",
        "Authorised admin information such as account details, role, authentication records, security events, and activity logs.",
        "Technical and usage information such as IP address, browser and device information, user agent, pages viewed, referrer, session identifier, session duration, clicks, interaction count, and scroll depth.",
        "Media or other files you intentionally upload through an authorised feature or secure upload link.",
      ],
    },
    {
      id: "collection-methods",
      icon: "globe",
      title: "How information is collected",
      paragraphs: [
        "Information is collected directly when you complete a form, book a call, subscribe, communicate with us, provide project material, or use an authorised account. Some technical information is collected automatically when the website loads or as you interact with it.",
        "We may also receive limited information from service providers, referral sources, social platforms, or business partners when you choose to interact through those services.",
      ],
    },
    {
      id: "how-we-use-data",
      icon: "check",
      title: "How we use information",
      items: [
        "Respond to questions, qualify project requests, prepare proposals, and communicate about services.",
        "Schedule, confirm, manage, and follow up on calls or project discussions.",
        "Deliver agreed software services, manage client relationships, and maintain business records.",
        "Send newsletters or updates you requested and process unsubscribe choices.",
        "Operate, personalise, troubleshoot, secure, monitor, and improve the website and admin systems.",
        "Measure page performance, traffic, engagement, content usefulness, and conversion journeys.",
        "Prevent spam, abuse, fraud, unauthorised access, and other security threats.",
        "Meet legal obligations, enforce agreements, resolve disputes, and protect legitimate rights.",
      ],
    },
    {
      id: "legal-bases",
      icon: "scale",
      title: "Reasons we process information",
      paragraphs: [
        "Where privacy law requires a legal basis, processing may rely on your consent, steps requested before entering a contract, performance of a contract, compliance with legal obligations, or legitimate interests such as responding to business inquiries, maintaining security, and improving services.",
        "You can withdraw consent for future processing where consent is the basis, including by unsubscribing from marketing email. Withdrawal does not make earlier lawful processing unlawful.",
      ],
    },
    {
      id: "cookies-analytics",
      icon: "fingerprint",
      title: "Cookies, local storage, and analytics",
      paragraphs: [
        "The website uses browser storage and similar technologies for functionality, security, session continuity, preferences, and visitor measurement. A visitor session identifier and session start time may be stored locally to understand aggregate site use.",
      ],
      items: [
        "Google Analytics may load when a measurement ID is configured and may process device, page, and interaction information under Google's own policies.",
        "Vercel Analytics and Speed Insights may collect performance and usage measurements to help us improve reliability and speed.",
        "Authentication cookies and browser storage support authorised admin sessions and security controls.",
        "You can limit cookies or clear browser storage through browser settings, but some protected or preference-based features may stop working correctly.",
      ],
      note: "The website does not currently respond to a universal browser “Do Not Track” signal because there is no consistently adopted standard. Available browser and provider controls can still be used.",
    },
    {
      id: "sharing",
      icon: "globe",
      title: "Service providers and sharing",
      paragraphs: [
        "We do not sell personal information. We may disclose limited information to providers that help operate the website and business, only for relevant services and subject to their own contractual and legal responsibilities.",
      ],
      items: [
        "Vercel or comparable infrastructure providers for hosting, delivery, analytics, and performance monitoring.",
        "MongoDB or comparable database providers for application and business records.",
        "Cloudinary for uploaded and website media storage and delivery.",
        "Email delivery providers and Nodemailer-compatible infrastructure for inquiries, confirmations, security messages, and newsletters.",
        "Google Analytics when configured for website measurement.",
        "Professional advisers, authorities, or counterparties when reasonably required by law, security, a dispute, or a business transaction.",
      ],
    },
    {
      id: "international-transfers",
      icon: "globe",
      title: "International processing",
      paragraphs: [
        "Some providers operate infrastructure in multiple countries, so information may be processed outside your country. Where required, we use available contractual, organisational, or provider safeguards and consider the nature of the information and service involved.",
      ],
    },
    {
      id: "retention",
      icon: "scroll",
      title: "Data retention",
      paragraphs: [
        "We retain information only for as long as reasonably needed for the purpose collected, an active business relationship, security, dispute handling, backups, or legal and accounting obligations. Retention depends on the information and context.",
      ],
      items: [
        "Unsuccessful or inactive inquiries may be removed when no longer useful for follow-up, security, or recordkeeping.",
        "Project and transaction records may be retained longer to support contracts, accounting, warranties, and disputes.",
        "Newsletter records remain active until you unsubscribe or the address is disabled, subject to limited suppression records needed to honour the choice.",
        "Security, analytics, and technical records may be retained for shorter operational periods or in aggregated form.",
      ],
    },
    {
      id: "security",
      icon: "lock",
      title: "Security",
      paragraphs: [
        "Muhyo Tech uses reasonable technical and organisational safeguards appropriate to the website, including access controls, authentication, permissions, input validation, rate limiting, secure upload links, logging, and managed infrastructure.",
        "No internet transmission, storage platform, or security method is completely risk-free. Please avoid sending unnecessary sensitive information through public forms and contact us promptly if you suspect misuse.",
      ],
    },
    {
      id: "your-rights",
      icon: "shield",
      title: "Your choices and rights",
      paragraphs: ["Depending on your location and applicable law, you may have some or all of the following rights:"],
      items: [
        "Ask whether we hold personal information about you and request access to it.",
        "Request correction of inaccurate or incomplete information.",
        "Request deletion or restriction where there is no overriding reason to retain or process the information.",
        "Object to certain processing or withdraw consent for future processing.",
        "Request a portable copy of information you provided where applicable.",
        "Unsubscribe from marketing email using the link in the message or by contacting us.",
        "Complain to an appropriate privacy or data-protection authority where that right is available.",
      ],
      note: "Rights are not absolute. We may need to verify identity, retain limited records, protect another person's rights, or decline a request where permitted by law.",
    },
    {
      id: "children",
      icon: "shield",
      title: "Children's privacy",
      paragraphs: [
        "Muhyo Tech provides business and professional technology services and the website is not directed to children under 16. We do not knowingly request personal information from children. If you believe a child submitted information, contact us so we can review and delete it where appropriate.",
      ],
    },
    {
      id: "ai-processing",
      icon: "sparkle",
      title: "AI-assisted processing",
      paragraphs: [
        "AI-assisted tools may support content drafting, image generation, workflow automation, technical analysis, or service delivery. We aim to avoid placing unnecessary personal information into such tools and apply human judgement where output affects client work.",
        "The public website does not use solely automated decision-making that produces legal or similarly significant effects for visitors.",
      ],
    },
    {
      id: "external-sites",
      icon: "globe",
      title: "External websites",
      paragraphs: [
        "Links to social networks, repositories, messaging services, client websites, and other external platforms are governed by those providers' privacy practices. Review their notices before providing information to them.",
      ],
    },
    {
      id: "policy-updates",
      icon: "scroll",
      title: "Updates to this Policy",
      paragraphs: [
        "We may update this Policy when website features, providers, business practices, or legal requirements change. Material revisions will be reflected by a new updated date and version on this page. Please review it periodically.",
      ],
    },
    {
      id: "privacy-contact",
      icon: "fingerprint",
      title: "Privacy contact",
      paragraphs: [
        "Submit privacy questions or requests through the Muhyo Tech contact page and clearly mark the message as a privacy request. Include the email address or other detail associated with your interaction so we can locate relevant records after appropriate verification.",
      ],
    },
  ],
};

export const termsDocument = {
  type: "Terms of Service",
  slug: "terms",
  title: "Terms built for clear collaboration.",
  description:
    "These Terms explain how you may use the Muhyo Tech website and how general inquiries, bookings, content, and software-service discussions are handled. A signed proposal or project agreement may add project-specific terms.",
  effectiveDate: "July 14, 2026",
  updatedDate: "July 14, 2026",
  version: "2.0",
  readTime: "9 minutes",
  highlights: [
    { icon: "scroll", title: "Website use", text: "Clear rules for browsing, inquiries, bookings, and permitted use of our content." },
    { icon: "scale", title: "Project clarity", text: "Proposals, scopes, milestones, payments, and ownership are confirmed separately for each engagement." },
    { icon: "shield", title: "Practical protection", text: "Reasonable limits protect visitors, clients, Muhyo Tech, and the integrity of the platform." },
  ],
  sections: [
    {
      id: "acceptance",
      icon: "check",
      title: "Acceptance of these Terms",
      paragraphs: [
        "By accessing muhyotech.com, submitting a form, booking a call, subscribing to updates, or otherwise using this website, you agree to these Terms of Service and our Privacy Policy.",
        "If you do not agree, please do not use the website. If you use the website for a company or other organisation, you confirm that you are authorised to act for it.",
      ],
    },
    {
      id: "services",
      icon: "sparkle",
      title: "Muhyo Tech services",
      paragraphs: [
        "Muhyo Tech provides professional website development, web applications, UI/UX implementation, backend and API work, performance and technical SEO improvements, deployment support, automation, AI-assisted workflows, and related digital services.",
        "Website descriptions, case studies, timelines, technology references, and service pages are general information—not a binding offer or guaranteed result. The final scope is defined in a written proposal, statement of work, invoice, or contract accepted by both parties.",
      ],
    },
    {
      id: "inquiries",
      icon: "fingerprint",
      title: "Inquiries, bookings, and communication",
      paragraphs: [
        "You agree to provide accurate, current information when sending a message, requesting a quote, booking a call, or subscribing to communications. A booking request is not confirmed until Muhyo Tech accepts it or sends confirmation.",
      ],
      items: [
        "Do not impersonate another person or submit misleading project information.",
        "Do not use forms for spam, unlawful solicitation, malware, or abusive content.",
        "Electronic communication may be used to respond to your request, coordinate a project, and send service-related notices.",
      ],
    },
    {
      id: "project-agreements",
      icon: "scroll",
      title: "Project scope, fees, and changes",
      paragraphs: [
        "Each paid engagement may have its own deliverables, dependencies, timeline, revision limits, payment schedule, cancellation terms, and support period. Those written project terms control if they conflict with these website Terms.",
      ],
      items: [
        "Estimates may change when requirements, integrations, content, access, or technical constraints change.",
        "Work outside an approved scope may require a revised estimate or change request.",
        "Clients are responsible for timely feedback, approvals, content, credentials, licences, and other agreed dependencies.",
        "Payment, refund, suspension, and cancellation rules will be stated in the applicable proposal or invoice.",
      ],
      note: "Submitting a contact or booking form alone does not create a client relationship or require either party to proceed.",
    },
    {
      id: "intellectual-property",
      icon: "gavel",
      title: "Intellectual property",
      paragraphs: [
        "The Muhyo Tech name, website design, original copy, code, graphics, service descriptions, articles, and other website materials are owned by Muhyo Tech or used under permission and are protected by applicable intellectual-property laws.",
      ],
      items: [
        "You may view and share links to public pages for lawful, personal, or internal business evaluation.",
        "You may not copy, resell, scrape, republish, remove attribution from, or create misleading derivatives of protected website material without written permission.",
        "You retain ownership of materials you provide for a project and confirm that you have permission to use them.",
        "Ownership and licence rights for project deliverables are defined in the project agreement and commonly transfer only after full payment, subject to third-party and pre-existing components.",
      ],
    },
    {
      id: "acceptable-use",
      icon: "shield",
      title: "Acceptable use",
      paragraphs: ["You must use the website lawfully and must not interfere with its operation, security, availability, or other users."],
      items: [
        "Do not attempt unauthorised access to accounts, admin areas, servers, APIs, databases, or security controls.",
        "Do not introduce malicious code, run disruptive automated requests, bypass rate limits, or probe for vulnerabilities without written authorisation.",
        "Do not use website content or communication features to violate privacy, intellectual-property, fraud, harassment, or other applicable laws.",
        "We may restrict access, preserve evidence, or report activity when reasonably necessary to protect the website or comply with law.",
      ],
    },
    {
      id: "ai-content",
      icon: "sparkle",
      title: "AI-assisted features and content",
      paragraphs: [
        "Muhyo Tech may use AI-assisted tools in research, drafting, image creation, workflow automation, quality review, or software delivery. Human review and engineering judgement remain important, but AI-assisted output can contain errors or require refinement.",
        "Blog posts, technical resources, examples, and AI-generated material are educational and general in nature. They are not legal, financial, medical, cybersecurity, or other regulated professional advice and should not replace advice tailored to your circumstances.",
      ],
    },
    {
      id: "third-parties",
      icon: "globe",
      title: "Third-party services and links",
      paragraphs: [
        "The website may link to or rely on third-party platforms such as hosting, analytics, cloud media, email, social networks, repositories, or client websites. Third parties operate under their own terms and privacy practices.",
        "Muhyo Tech is not responsible for third-party availability, content, policies, security, or changes. A link or technology reference does not automatically mean endorsement or partnership.",
      ],
    },
    {
      id: "availability",
      icon: "globe",
      title: "Availability and changes",
      paragraphs: [
        "We work to keep the website accurate, secure, and available, but uninterrupted or error-free operation is not guaranteed. Features, content, service descriptions, and availability may be changed, suspended, or removed when reasonably necessary.",
        "We may update these Terms as the website, services, or legal requirements evolve. The updated date and version appear on this page. Continued use after an update means you accept the revised Terms.",
      ],
    },
    {
      id: "disclaimers",
      icon: "scale",
      title: "Disclaimers and liability",
      paragraphs: [
        "The website and public content are provided on an “as available” basis. To the maximum extent permitted by applicable law, Muhyo Tech disclaims warranties that are not expressly stated in a signed project agreement.",
        "To the maximum extent permitted by law, Muhyo Tech will not be liable for indirect, incidental, special, consequential, or lost-profit damages arising from public website use, reliance on general content, third-party services, or events outside reasonable control. Nothing in these Terms excludes liability that cannot legally be excluded.",
      ],
    },
    {
      id: "governing-law",
      icon: "gavel",
      title: "Governing law and disputes",
      paragraphs: [
        "These website Terms are governed by the applicable laws of Pakistan. Before starting formal proceedings, both sides should first attempt in good faith to resolve a dispute through written communication. Project contracts may specify a different or more detailed dispute process.",
      ],
    },
    {
      id: "contact",
      icon: "fingerprint",
      title: "Contact",
      paragraphs: [
        "Questions about these Terms, permissions, or a project agreement can be submitted through the Muhyo Tech contact page. Please include enough detail for us to identify and respond to your request.",
      ],
    },
  ],
};

export const professionalCopy = {
  "web-development": {
    eyebrow: "Performance Web Engineering",
    description:
      "Launch a fast, conversion-focused website built with clean architecture, strong SEO foundations, and a polished user experience that helps visitors trust your brand quickly.",
    promise:
      "A modern web platform that feels premium, loads quickly, ranks better, and makes it easier for customers to take action.",
  },
  "ui-ux-design": {
    eyebrow: "Product Design & UX Strategy",
    description:
      "Turn complex ideas into clear, elegant interfaces with thoughtful user journeys, refined visuals, and practical design systems your team can keep using.",
    promise:
      "A smoother experience that reduces confusion, improves engagement, and makes your product feel easier to understand from the first visit.",
  },
  "api-development": {
    eyebrow: "Backend Systems & APIs",
    description:
      "Build secure APIs, dashboards, databases, and automation flows that keep your product reliable as users, data, and business operations grow.",
    promise:
      "A dependable backend foundation that reduces manual work, protects sensitive data, and gives your frontend the speed it needs.",
  },
  "mobile-app-development": {
    eyebrow: "Mobile Product Development",
    description:
      "Create polished iOS and Android experiences with smooth flows, reliable performance, and the features users expect from a modern mobile product.",
    promise:
      "A mobile app experience that keeps your brand close to users and supports daily engagement without feeling heavy or confusing.",
  },
  "cloud-devops": {
    eyebrow: "Cloud Infrastructure & DevOps",
    description:
      "Stabilize releases, automate deployments, and prepare your application for growth with secure cloud infrastructure and practical monitoring.",
    promise:
      "A calmer engineering workflow with fewer deployment risks, better uptime, and infrastructure that can scale with demand.",
  },
  "seo-digital-growth": {
    eyebrow: "SEO & Growth Systems",
    description:
      "Improve visibility with technical SEO, content structure, analytics, and conversion improvements that help the right customers find and trust you.",
    promise:
      "A stronger growth foundation that brings qualified traffic, clearer insights, and more useful paths from search to conversion.",
  },
};

export const defaultProblems = [
  "Slow or outdated website",
  "Poor mobile experience",
  "Weak online presence",
  "Unprofessional design",
  "Low visitor trust",
  "Broken contact flow",
  "Difficult content updates",
  "No SEO-friendly structure",
  "No scalable backend",
  "No proper admin/dashboard system",
];

export const defaultDeliverables = [
  "Modern responsive design",
  "Clean UI/UX structure",
  "Mobile-friendly pages",
  "SEO-ready layout",
  "Contact form integration",
  "Admin panel if required",
  "Database integration if required",
  "API integration if required",
  "Fast loading structure",
  "Deployment support",
  "Domain/hosting guidance",
  "Basic performance optimization",
];

export const defaultBenefits = [
  "Better first impression",
  "More trust from visitors",
  "Improved mobile experience",
  "Faster website performance",
  "Easier lead generation",
  "Scalable website foundation",
  "Professional brand presence",
  "SEO-friendly starting point",
];

export const defaultProcess = [
  {
    title: "Requirement Discussion",
    description:
      "We clarify your goals, audience, current challenges, and the result your business needs.",
  },
  {
    title: "Project Planning",
    description:
      "We map pages, features, integrations, content needs, and the practical build direction.",
  },
  {
    title: "Design Direction",
    description:
      "We shape the visual structure, user flow, and interface style around your brand and audience.",
  },
  {
    title: "Development",
    description:
      "We build the approved solution with responsive layouts, clean code, and scalable foundations.",
  },
  {
    title: "Testing and Optimization",
    description:
      "We review mobile behavior, performance, forms, content, SEO basics, and key user flows.",
  },
  {
    title: "Review and Revisions",
    description:
      "You review the work and we refine details based on agreed project scope and priorities.",
  },
  {
    title: "Deployment Support",
    description:
      "We help prepare launch, deployment, domain setup, and handover details where required.",
  },
  {
    title: "Ongoing Support if Needed",
    description:
      "After delivery, support or improvement work can continue depending on your requirements.",
  },
];

export const defaultClientRequirements = [
  "Business name",
  "Logo if available",
  "Website content",
  "Page list",
  "Brand colors if available",
  "Reference websites",
  "Images/media",
  "Contact details",
  "Feature requirements",
  "Domain/hosting details if available",
];

export const defaultTrustPoints = [
  "Modern web development approach",
  "Clean responsive UI",
  "SEO-friendly structure",
  "Secure backend thinking",
  "Scalable code",
  "Professional communication",
  "Real business-focused solutions",
  "Ongoing support mindset",
];

export const defaultFaq = [
  {
    question: "How do I get started with this service?",
    answer:
      "You can book a call or send a message with your project idea, business goals, and any current website or reference links.",
  },
  {
    question: "Do you provide custom website development?",
    answer:
      "Yes. The work is shaped around your requirements, features, content, brand, and business goals.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
      "Yes. Existing websites can be reviewed and improved for better design, speed, structure, mobile experience, and conversion flow.",
  },
  {
    question: "Will the website be mobile responsive?",
    answer:
      "Yes. Responsive behavior is part of the build so the experience works professionally across mobile, tablet, and desktop screens.",
  },
  {
    question: "Can you build an admin panel?",
    answer:
      "Yes, if your project requires content management, user management, dashboards, or internal tools, an admin panel can be planned into the scope.",
  },
  {
    question: "Can you connect APIs or databases?",
    answer:
      "Yes. Projects can include database setup, API integrations, authentication, contact systems, uploads, automation, or third-party services when needed.",
  },
  {
    question: "Do you help with deployment?",
    answer:
      "Yes. Deployment support, domain guidance, hosting setup, and launch checks can be included depending on project scope.",
  },
  {
    question: "Do you provide SEO-friendly structure?",
    answer:
      "Yes. Pages can be built with clean structure, metadata, performance-minded layout, and content organization that gives SEO a stronger starting point.",
  },
  {
    question: "What do you need from me before starting?",
    answer:
      "Helpful items include business details, page list, content, logo, brand direction, reference websites, images, required features, and domain or hosting details if available.",
  },
  {
    question: "How is pricing decided?",
    answer:
      "Pricing depends on the project scope, features, timeline, and level of customization. You can book a call or send a message to discuss your requirements and receive a custom quote.",
  },
  {
    question: "Can I request changes during the project?",
    answer:
      "Yes. Review and revision points are part of the process, with changes handled according to the agreed scope and priorities.",
  },
  {
    question: "Do you provide support after delivery?",
    answer:
      "Yes. Post-delivery support can be discussed based on the project type, business needs, and ongoing improvement goals.",
  },
];
