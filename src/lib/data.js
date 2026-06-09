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
            liveLink: "https://muhyo-tech.vercel.app",
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
            liveLink: "https://muhyo-tech.vercel.app/admin",
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
};