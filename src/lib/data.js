import { servicesSeedData } from "@/data/services.seed";

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
        heroImage: "/hero-visual.png",
        ctas: [
            { label: "Book a Call", href: "/contact?intent=book-call", variant: "primary" },
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
            { label: "Book a Call", href: "/contact?intent=book-call" },
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
            { label: "Book a Call", href: "/contact?intent=book-call", variant: "primary" },
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
    location: "Chung, Lahore, Pakistan",
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
            { label: "Book a Call", href: "/contact?intent=book-call", variant: "primary" },
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
        { icon: "Globe", title: "Custom Websites", description: "Premium responsive websites built around your brand, offer, and conversion goals.", link: "/services/web-development" },
        { icon: "Layers", title: "Full-Stack Web Applications", description: "Modern app experiences with frontend, backend, database, and deployment handled together.", link: "/services/mern-stack-development" },
        { icon: "LayoutDashboard", title: "Admin Dashboards", description: "Secure management panels for content, users, services, analytics, and business workflows.", link: "/services/admin-dashboard-development" },
        { icon: "User", title: "Portfolio Websites", description: "Personal brand and professional portfolio sites that present work clearly and attract opportunities.", link: "/projects" },
        { icon: "Building2", title: "Business Websites", description: "Trust-building websites for companies, local businesses, service providers, and startups.", link: "/services" },
        { icon: "Database", title: "API & Database Integration", description: "REST APIs, MongoDB models, authentication, uploads, email flows, and third-party integrations.", link: "/services/api-development" },
        { icon: "RefreshCw", title: "Website Redesign", description: "Modern redesigns that improve structure, responsiveness, speed, and visual credibility.", link: "/contact" },
        { icon: "Search", title: "SEO-Friendly Web Setup", description: "Clean metadata, semantic sections, fast pages, and scalable structure for better discoverability.", link: "/services/seo-optimization" },
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
        location: "Chung, Lahore, Pakistan",
        workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
        status: "Available for selected projects",
        socialLinks: SOCIAL_LINKS_ARRAY,
    },
    finalCTA: {
        badge: "Start the conversation",
        title: "Ready to Build Something Professional?",
        description: "Let's discuss your website, web app, dashboard, or business idea and turn it into a modern digital solution.",
        primaryButton: { label: "Book a Call", href: "/contact?intent=book-call" },
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
                title: "Transforming Ideas Into Digital Excellence",
                description: "I provide high-end web development and design services tailored to your specific business needs. My focus is on quality, performance, and delivering real results that help you scale.",
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
            quickResponse: "Under 2h",
            process: [{
                    step: "01",
                    title: "Project Planning",
                    desc: "We look at your needs to find the best tools and way to build your project.",
                },
                {
                    step: "02",
                    title: "Meeting & Chat",
                    desc: "We talk together to finalize the budget, timing, and what we will build for you.",
                },
                {
                    step: "03",
                    title: "Building & Launch",
                    desc: "Our team starts coding your project and gives you regular updates until it's ready.",
                },
            ],
            faq: [{
                    q: "How long does a project take?",
                    a: "Most projects take between 6 to 12 weeks. Small tasks can be finished in just 4 weeks.",
                },
                {
                    q: "Do you help after the project is finished?",
                    a: "Yes! We stay with you to fix any bugs and make sure your website stays running perfectly.",
                },
                {
                    q: "Who owns the project code?",
                    a: "You do! Once we finish and you pay, all the code belongs to you forever.",
                },
                {
                    q: "What coding tools do you use?",
                    a: "We use modern and fast tools like React, Next.js, and Node.js to make sure your site is super quick.",
                },
            ],
            locationInfo: {
                label: "Main Lab HQ",
                value: "Lahore, Punjab, PK",
            },
        },
    },

    contactInfo: [{
            icon: "Mail",
            label: "Email Us",
            value: "MuhyoTech@gmail.com",
            href: "mailto:MuhyoTech@gmail.com?subject=Project Inquiry&body=Hi MuhyoTech Team, I'm interested in working with you on a project...",
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
            value: "Active 24/7",
            href: "https://wa.me/923224458481?text=Hi MuhyoTech! I'd like to discuss a new project with you.",
            color: "from-emerald-500 to-teal-500",
            target: "_blank",
        },
        {
            icon: "MapPin",
            label: "Our Office",
            value: "Lahore, Pakistan",
            href: "https://www.google.com/maps/search/?api=1&query=Lahore,+Pakistan",
            color: "from-purple-500 to-indigo-500",
            target: "_blank",
        },
    ],
    serviceFeatures: [{
            icon: "Zap",
            title: "Fast Performance",
            description: "Optimized for speed to ensure your visitors stay engaged and convert.",
        },
        {
            icon: "Shield",
            title: "Secure & Reliable",
            description: "Built with the latest security standards to protect your data and users.",
        },
        {
            icon: "Laptop",
            title: "Fully Responsive",
            description: "Your site will look and work perfectly on every device, from mobile to desktop.",
        },
        {
            icon: "Rocket",
            title: "SEO Optimized",
            description: "Clean code structure that search engines love, helping you rank higher.",
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
        {
            id: 2,
            slug: "psychology-of-premium-ui",
            title: "The Psychology of Premium UI",
            summary: "Exploring how micro-animations, spatial depth, and intentional friction influence user trust and long-term retention.",
            content: `
                <p>What makes a website feel 'premium'? It's rarely just one large feature; it's the 1,000 tiny details working in perfect harmony. At the core of premium design lies human psychology.</p>
                
                <h2>Spatial Depth & Glassmorphism</h2>
                <p>Human eyes are naturally drawn to depth. By using subtle blurs and layered backgrounds (Glassmorphism), we create a sense of hierarchy that feels professional and organized. It provides visual cues on where to focus, reducing cognitive load for the user.</p>
                
                <h2>Intentional Friction</h2>
                <p>Not all friction is bad. Sometimes, slowing a user down slightly during a critical action (like data deletion) builds trust. It signals that the system is careful with their information.</p>
                
                <p>Mastering these nuances is how we transform a standard interface into an emotional experience.</p>
            `,
            date: "Mar 12, 2026",
            author: "Sarah Jenkins",
            authorRole: "Lead Designer",
            category: "Design",
            tags: ["UI/UX", "Psychology", "Premium"],
            image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2000&auto=format&fit=crop",
            featured: false,
            readTime: "10 min read",
        },
        {
            id: 3,
            slug: "scaling-beyond-the-first-million",
            title: "Scaling Beyond the First Million Users",
            summary: "Critical lessons learned from scaling distributed systems, database clusters, and global edge networks under extreme load.",
            content: `
                <p>Your app works for 10,000 users. It works for 100,000. But when you hit the 1,000,000 mark, everything that 'should' work starts to break in fascinating ways.</p>
                
                <h2>The Caching Bottleneck</h2>
                <p>At scale, even your cache can become a bottleneck. We focus on multi-tier caching strategies involving Redis clusters and Edge computing (Vercel Edge/Cloudflare Workers) to ensure data is always close to the user.</p>
                
                <h2>Database Sharding vs. Read Replicas</h2>
                <p>Knowing when to shard and when to simply optimize your queries is an art form. We've found that architectural integrity early on prevents the need for expensive 'emergency' migrations later.</p>
                
                <p>Scale isn't just about hardware; it's about building a system that can fail gracefully without taking down the entire ecosystem.</p>
            `,
            date: "Mar 10, 2026",
            author: "Alex Cameron",
            authorRole: "Senior Developer",
            category: "Backend",
            tags: ["Scalability", "Infrastructure", "Cloud"],
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
            featured: false,
            readTime: "12 min read",
        },
        {
            id: 4,
            slug: "mastering-core-web-vitals-2026",
            title: "Mastering Core Web Vitals in 2026",
            summary: "A deep dive into INP and LCP optimization for enterprise-scale Next.js applications and search engine dominance.",
            content: `
                <p>Search engines no longer just look at keywords; they look at performance. If your site is slow, you are invisible to Google.</p>
                
                <h2>The New Kid: INP (Interaction to Next Paint)</h2>
                <p>INP has replaced FID as a key metric. It measures the latency of all interactions. Optimizing this requires minimizing main-thread work and ensuring your React components don't re-render unnecessarily.</p>
                
                <h2>Hydration Optimization</h2>
                <p>Next.js 15 partial prerendering is a game changer. It allows us to keep the static parts of your page fast while streaming in dynamic content, keeping your LCP (Largest Contentful Paint) below the 2-second gold standard.</p>
            `,
            date: "Mar 08, 2026",
            author: "Pir Ghulam Muhyo Din",
            authorRole: "Founder",
            category: "SEO",
            tags: ["Performance", "SEO", "Google"],
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
            featured: false,
            readTime: "8 min read",
        },
        {
            id: 5,
            slug: "ai-augmented-development-era",
            title: "AI-Augmented Development: A New Era",
            summary: "How LLMs and AI coding assistants are transforming the role of the senior software engineer into a technical orchestrator.",
            content: `
                <p>Is AI replacing developers? No. It's replacing the repetitive, manual labor of coding, allowing us to focus on what matters: <strong>System Design and Logic</strong>.</p>
                
                <h2>The Orchestrator Mindset</h2>
                <p>Today's senior engineer is less of a 'coder' and more of an 'orchestrator'. We use AI to generate boilerplate, write unit tests, and even suggest refactors. This speed allows us to spend 80% of our time on structural integrity and user experience.</p>
                
                <p>At Muhyo Tech, we embrace AI as our ultimate pair programmer, boosting our velocity by nearly 40% without compromising on code quality.</p>
            `,
            date: "Mar 05, 2026",
            author: "Alex Cameron",
            authorRole: "Senior Developer",
            category: "Technology",
            tags: ["AI", "Innovation", "Code"],
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop",
            featured: false,
            readTime: "7 min read",
        },
        {
            id: 6,
            slug: "pro-dark-mode-strategies",
            title: "Strategies for Cinematic Dark Modes",
            summary: "Beyond just flipping colors—advanced techniques for high-contrast, accessible, and cinematic dark mode experiences.",
            content: `
                <p>Dark mode isn't just a switch; it's a separate design language. In 2026, premium products are measured by the quality of their 'After Hours' experience.</p>
                
                <h2>Color Theory in the Dark</h2>
                <p>Never use pure black (#000000) for your background. It causes 'smearing' on OLED screens and feels overly harsh. Use deep charcoals and dark indigos to provide depth and softness to the eye.</p>
                
                <h2>Accessibility First</h2>
                <p>We ensure that our dark modes pass strict AA/AAA contrast tests, making sure the design is beautiful and inclusive for all users, regardless of lighting conditions.</p>
            `,
            date: "Feb 25, 2026",
            author: "Sarah Jenkins",
            authorRole: "Lead Designer",
            category: "Design",
            tags: ["UI", "Accessibility", "Dark Mode"],
            image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
            featured: false,
            readTime: "6 min read",
        },
        {
            id: 7,
            slug: "building-for-impact-philosophy",
            title: "Building for Impact: Our Philosophy",
            summary: "Our internal journey of engineering simple, powerful, and beautiful digital ecosystems that empower businesses to scale.",
            content: `
                <p>At Muhyo Tech, we don't just build apps; we build legacies. Our philosophy is rooted in three pillars: <strong>Simplicity, Power, and Beauty</strong>.</p>
                
                <h2>Engineering Simple</h2>
                <p>The hardest part of engineering is keeping things simple. We strive to remove the noise and focus on the core value proposition of our clients' ideas.</p>
                
                <p>This post details our culture of 'Excellence by Default' and how we maintain a standard that has allowed us to scale from a small studio to a global technical partner.</p>
            `,
            date: "Feb 20, 2026",
            author: "Pir Ghulam Muhyo Din",
            authorRole: "Founder",
            category: "Culture",
            tags: ["Philosophy", "Muhyo Tech", "Success"],
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
            featured: false,
            readTime: "5 min read",
        },
        {
            id: 8,
            slug: "security-as-first-class-citizen",
            title: "Security as a First-Class Citizen",
            summary: "Moving security from the end of the roadmap to the very first line of code in the modern cyber-landscape.",
            content: `
                <p>In an era of increasing data breaches, security cannot be an afterthought. It must be baked into the DNA of your application from day one.</p>
                
                <h2>Secure by Design</h2>
                <p>At Muhyo Tech, we follow 'OWASP Top 10' as our baseline. We implement end-to-end encryption, strict JWT auth protocols, and automated security scans in our CI/CD pipelines to ensure your user's data is bulletproof.</p>
                
                <p>Protecting your business means protecting your data. Let's talk about how to build a fortress, not just a website.</p>
            `,
            date: "Feb 15, 2026",
            author: "Alex Cameron",
            authorRole: "Senior Developer",
            category: "Security",
            tags: ["Security", "Cyber", "Auth"],
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
            featured: false,
            readTime: "9 min read",
        },
        {
            id: 9,
            slug: "future-of-devex-product-engineers",
            title: "The Future of DevEx",
            summary: "Why the next decade of software success belongs to teams that prioritize Developer Experience and efficiency.",
            content: `
                <p>Developer Experience (DevEx) is the competitive advantage of 2026. Fast builds, clear documentation, and seamless deployments aren't luxuries—they're necessities for high-performing teams.</p>
                
                <h2>The Cost of Slow</h2>
                <p>Every minute a developer spends waiting for a build to run or fighting a local environment is a minute lost on innovation. We build tools and workflows that 'just work', allowing our engineers to stay in the state of flow.</p>
                
                <p>Discover how optimizing your internal DevEx can lead to higher quality products and happier, more productive teams.</p>
            `,
            date: "Feb 10, 2026",
            author: "Pir Ghulam Muhyo Din",
            authorRole: "Founder",
            category: "Infrastructure",
            tags: ["DevEx", "Engineering", "Tools"],
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
            featured: false,
            readTime: "7 min read",
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
                value: "Lahore, Pakistan",
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
            { icon: "Mail", text: "attariattari549@gmail.com" },
            { icon: "MapPin", text: "Lahore, Pakistan" },
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
        missionStatement: "Architecting scalable digital solutions that empower businesses to grow exponentially in the digital economy.",
        visionStatement: "To be the trusted technology partner for ambitious brands building the future of the web.",
        founderMessage: "At Muhyo Tech, we believe that great technology isn't just about code—it's about creating meaningful experiences that drive real business value. My mission is to help you build products that don't just work, but inspire. Let's build something extraordinary together.",
    },

    goalsData: [{
            id: 1,
            title: "Master Advanced Next.js Architecture",
            description: "Achieve mastery in server components, streaming, edge computing, and advanced performance optimization.",
            category: "Technology",
            status: "in-progress",
            priority: "high",
            progress: 75,
            targetDate: "2026-12-31",
            featured: true,
            icon: "Zap",
            order: 1,
        },
        {
            id: 2,
            title: "Build 10+ Enterprise-Grade Projects",
            description: "Complete a portfolio of large-scale, production-ready applications across diverse industries.",
            category: "Product",
            status: "in-progress",
            priority: "critical",
            progress: 60,
            targetDate: "2027-06-30",
            featured: true,
            icon: "Code2",
            order: 2,
        },
        {
            id: 3,
            title: "Establish Industry Leadership",
            description: "Become a recognized expert in full-stack web architecture through thought leadership and contributions.",
            category: "Business",
            status: "planned",
            priority: "high",
            progress: 40,
            targetDate: "2027-12-31",
            featured: true,
            icon: "Crown",
            order: 3,
        },
        {
            id: 4,
            title: "Launch Advanced AI Integration",
            description: "Integrate cutting-edge AI capabilities into projects for enhanced automation and intelligence.",
            category: "Technology",
            status: "planned",
            priority: "high",
            progress: 20,
            targetDate: "2026-09-30",
            featured: false,
            icon: "Cpu",
            order: 4,
        },
        {
            id: 5,
            title: "Mentor Emerging Developers",
            description: "Guide and mentor the next generation of developers, fostering a community of excellence.",
            category: "Community",
            status: "planned",
            priority: "medium",
            progress: 30,
            targetDate: "2027-03-31",
            featured: false,
            icon: "Users",
            order: 5,
        },
        {
            id: 6,
            title: "Achieve 99.99% Uptime Record",
            description: "Maintain exceptional reliability standards across all deployed applications.",
            category: "Quality",
            status: "completed",
            priority: "critical",
            progress: 100,
            targetDate: "2025-12-31",
            featured: false,
            icon: "Shield",
            order: 6,
        },
    ],

    roadmapData: [{
            id: 1,
            title: "Core Architecture Optimization",
            description: "Performance improvements and scalability enhancements",
            year: 2025,
            quarter: "Q1",
            status: "completed",
            order: 1,
        },
        {
            id: 2,
            title: "AI Integration Sprint",
            description: "Implement ML models and AI-powered features",
            year: 2025,
            quarter: "Q2",
            status: "in-progress",
            order: 2,
        },
        {
            id: 3,
            title: "Enterprise Solutions Release",
            description: "Launch comprehensive enterprise product suite",
            year: 2025,
            quarter: "Q3",
            status: "upcoming",
            order: 3,
        },
        {
            id: 4,
            title: "Global Expansion Initiative",
            description: "Establish presence in key international markets",
            year: 2025,
            quarter: "Q4",
            status: "upcoming",
            order: 4,
        },
        {
            id: 5,
            title: "Community Platform Launch",
            description: "Developer community and knowledge sharing platform",
            year: 2026,
            quarter: "Q1",
            status: "upcoming",
            order: 5,
        },
        {
            id: 6,
            title: "Next-Gen Tech Stack Adoption",
            description: "Migrate to latest frameworks and tools",
            year: 2026,
            quarter: "Q2",
            status: "upcoming",
            order: 6,
        },
    ],

    milestonesData: [{
            id: 1,
            title: "First 10 Clients Milestone",
            description: "Achieved success with 10 satisfied enterprise clients",
            date: "2024-06-15",
            category: "Business",
            featured: true,
            order: 1,
        },
        {
            id: 2,
            title: "50+ Projects Completed",
            description: "Surpassed 50 successful projects delivered across diverse industries",
            date: "2024-09-20",
            category: "Product",
            featured: true,
            order: 2,
        },
        {
            id: 3,
            title: "Open Source Leadership",
            description: "Became maintainer of influential open-source projects",
            date: "2024-11-10",
            category: "Community",
            featured: true,
            order: 3,
        },
        {
            id: 4,
            title: "Industry Recognition Award",
            description: "Received Best Developer award from Tech Excellence Awards",
            date: "2025-02-14",
            category: "Achievement",
            featured: true,
            order: 4,
        },
        {
            id: 5,
            title: "First $1M Revenue Year",
            description: "Achieved significant financial milestone",
            date: "2025-03-31",
            category: "Business",
            featured: false,
            order: 5,
        },
    ],
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
        year: caseStudy.year || project.year || "2026",
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
