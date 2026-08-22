/**
 * AI Service Generator Engine (Phase 5 - 360-Degree Architecture)
 * 
 * Converts validated ServiceOpportunity records into deeply structured, SEO-ready, 
 * high-converting, 360-degree Service Drafts following a strict Draft-First, 
 * Human-Governed workflow aligned with the Muhyo Tech Service Knowledge Base.
 */

import { generateGeminiResponse } from "../../../geminiService.js";
import { getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Builds a compact context object from existing services and opportunity input.
 */
export function buildServiceGenerationContext(opportunity = {}) {
  let existingServices = [];
  try {
    existingServices = getServiceIntelligenceSnapshotSync();
  } catch (err) {
    existingServices = [];
  }

  const existingCatalog = existingServices.map((s) => ({
    title: s.title,
    slug: s.slug,
    category: s.category,
    shortDescription: s.shortDescription,
    problemsSolved: (s.problemsSolved || []).slice(0, 3).map((p) => p.title || p),
    technologies: (s.technologies || []).slice(0, 5).map((t) => (typeof t === "string" ? t : t.name)),
  }));

  return {
    opportunity: {
      proposedServiceName:
        opportunity.suggestedService ||
        opportunity.proposedServiceName ||
        opportunity.topicTitle ||
        opportunity.title ||
        "Custom Technology Solution",
      commercialIntent: opportunity.commercialIntent || "SERVICE_EVALUATION",
      problem:
        opportunity.detectedNeed ||
        opportunity.problem ||
        opportunity.primaryProblem ||
        "Custom business challenge requiring technical solution",
      targetAudience: opportunity.targetAudience || "business_owner",
      targetIndustry: opportunity.targetIndustry || "general_technology",
      opportunityScore: opportunity.opportunityScore || 75,
      evidence: opportunity.evidence || [],
      recommendedAction: opportunity.recommendedAction || "CREATE_NEW_SERVICE",
    },
    existingCatalog,
  };
}

/**
 * Validates a generated service draft payload against quality, completeness, and uniqueness rules.
 */
export function validateServiceDraft(draftPayload = {}, existingServicesSnapshot = null) {
  const service = draftPayload.service || draftPayload;
  const snapshot = existingServicesSnapshot || getServiceIntelligenceSnapshotSync();

  const errors = [];
  const warnings = [];
  let score = 100;

  // 1. Required Core Fields Check
  if (!service.title || service.title.trim().length < 3) {
    errors.push("Missing or invalid service title.");
    score -= 25;
  }
  if (!service.slug || service.slug.trim().length < 3) {
    errors.push("Missing or invalid service slug candidate.");
    score -= 20;
  }
  if (!service.shortDescription || service.shortDescription.trim().length < 20) {
    errors.push("Missing or too short shortDescription (minimum 20 characters).");
    score -= 15;
  }
  if (!service.overview && !service.fullDescription) {
    errors.push("Missing detailed service overview/fullDescription.");
    score -= 15;
  }

  // 2. Slug & Title Collision Check
  const candidateSlug = slugify(service.slug || service.title || "");
  const slugCollision = snapshot.find((s) => s.slug === candidateSlug);
  if (slugCollision) {
    errors.push(`Slug collision detected: Service with slug '${candidateSlug}' already exists.`);
    score -= 30;
  }

  const normTitle = String(service.title || "").toLowerCase().trim();
  const titleCollision = snapshot.find((s) => String(s.title).toLowerCase().trim() === normTitle);
  if (titleCollision) {
    warnings.push(`Title similarity detected: Existing service '${titleCollision.title}' has identical title.`);
    score -= 15;
  }

  // 3. FAQ Completeness Check (Minimum 3 required, ideal 5+)
  const faqs = Array.isArray(service.faqs) ? service.faqs : [];
  if (faqs.length < 3) {
    warnings.push(`FAQ section incomplete: Generated ${faqs.length}/3 minimum required FAQs.`);
    score -= 10;
  }

  // 4. Content Structures Check
  const problems = Array.isArray(service.problemsSolved) ? service.problemsSolved : [];
  if (problems.length < 2) {
    warnings.push("Problems solved section has fewer than 2 items.");
    score -= 10;
  }
  const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
  if (deliverables.length < 2) {
    warnings.push("Deliverables section has fewer than 2 items.");
    score -= 10;
  }
  const processSteps = Array.isArray(service.processSteps) ? service.processSteps : [];
  if (processSteps.length < 3) {
    warnings.push("Process steps section has fewer than 3 steps.");
    score -= 10;
  }

  // 5. 360-Degree Knowledge Base Profile Enrichment Checks
  const buyerProfiles = Array.isArray(service.targetAudienceProfiles) ? service.targetAudienceProfiles : [];
  const objections = Array.isArray(service.commonObjections) ? service.commonObjections : [];
  const conversionStrat = service.conversionStrategy && typeof service.conversionStrategy === "object";

  if (buyerProfiles.length === 0) {
    warnings.push("Target audience buyer profiles not populated.");
  }
  if (objections.length === 0) {
    warnings.push("Sales objection handling items not populated.");
  }
  if (!conversionStrat || !service.conversionStrategy?.primaryCtaText) {
    warnings.push("Conversion strategy CTA triggers not defined.");
  }

  // 6. SEO Quality Check
  let seoQuality = 90;
  if (!service.seoTitle || service.seoTitle.length < 25 || service.seoTitle.length > 70) {
    warnings.push("SEO title length out of ideal range (25-70 characters).");
    seoQuality -= 15;
  }
  if (!service.seoDescription || service.seoDescription.length < 70 || service.seoDescription.length > 170) {
    warnings.push("SEO description length out of ideal range (70-170 characters).");
    seoQuality -= 15;
  }

  const finalScore = Math.max(0, score);
  const isValid = errors.length === 0 && finalScore >= 50;

  return {
    valid: isValid,
    score: finalScore,
    errors,
    warnings,
    duplicateRisk: slugCollision ? "HIGH" : titleCollision ? "MODERATE" : "LOW",
    seoQuality: Math.max(0, seoQuality),
    commercialFit: isValid ? 95 : 50,
    contentCompleteness: Math.max(0, 100 - warnings.length * 8 - errors.length * 20),
    candidateSlug,
    validatedAt: new Date().toISOString(),
  };
}

/**
 * Robust 360-Degree Heuristic fallback builder for offline/mock environments.
 */
function buildFallbackServiceDraft(context, sourceOpportunityId = "") {
  const name = context.opportunity.proposedServiceName || "Custom Technology Solution";
  const slugCandidate = slugify(name);
  const problem = context.opportunity.problem || "Inefficient legacy workflows and slow digital performance";

  return {
    service: {
      title: name,
      slug: slugCandidate,
      category: "Full-Stack Development",
      shortDescription: `Professional ${name} engineered with Next.js, modern backend architecture, and conversion-focused performance for scalable business growth.`,
      overview: `${name} delivers end-to-end engineering tailored to eliminate ${problem}. We architect high-performance, search-optimized web applications with resilient backend workflows, clean codebases, and seamless user experiences designed to convert visitors into clients.`,
      fullDescription: `Muhyo Tech provides production-ready ${name} engineered with precision, high-velocity performance, and modern software design patterns. Our solutions are built to scale seamlessly from initial launch to high-traffic commercial operations.`,
      
      problemsSolved: [
        {
          title: "Technical Bottlenecks & Legacy Overhead",
          description: `Solves ${problem} by re-architecting systems with modern Next.js and cloud solutions.`,
          icon: "AlertTriangle",
        },
        {
          title: "Slow Page Loading & Poor Core Web Vitals",
          description: "Eliminates heavy frontend scripts and un-optimized assets with Server Components, image compression, and ISR.",
          icon: "Zap",
        },
        {
          title: "Low Conversion Rates & Weak Lead Flow",
          description: "Re-engineers conversion funnels and form workflows to maximize user engagement and commercial inquiries.",
          icon: "Target",
        },
        {
          title: "Maintenance Complexity & Security Risks",
          description: "Replaces fragile ad-hoc code with clean, modular TypeScript architecture and secure API validation.",
          icon: "ShieldCheck",
        },
      ],

      deliverables: [
        {
          title: "Custom Application Architecture",
          description: "Complete, production-grade Next.js App Router codebase with modular React components and TypeScript.",
          icon: "Layers3",
        },
        {
          title: "Secure API & Database Infrastructure",
          description: "Custom REST/GraphQL endpoints, MongoDB data models, authentication guards, and rate limiting.",
          icon: "Database",
        },
        {
          title: "Responsive UI & Tailwind Styling",
          description: "Pixel-perfect mobile, tablet, and desktop interfaces built with Tailwind CSS and subtle micro-interactions.",
          icon: "Smartphone",
        },
        {
          title: "Core Web Vitals & Technical SEO Audit",
          description: "Structured JSON-LD schema markup, metadata tags, sitemap integration, and 95+ performance scores.",
          icon: "Star",
        },
        {
          title: "Full Source Code & Deployment Handover",
          description: "Direct GitHub repository access, deployment pipeline setup (Vercel/Cloud), and developer documentation.",
          icon: "CheckCircle2",
        },
      ],

      features: [
        { title: "Next.js App Router & Server Components", description: "Lightning-fast initial page loads with zero unnecessary client JavaScript." },
        { title: "Scalable Database Modeling", description: "Optimized MongoDB schema designs with indexing for high-speed queries." },
        { title: "Role-Based Access & Security", description: "Encrypted session authentication, CSRF protection, and sanitized inputs." },
        { title: "Conversion-Centric UX Patterns", description: "Strategic CTAs, accessible lead capture forms, and analytics-ready event tracking." },
        { title: "Automated Build & CI/CD Pipeline", description: "Seamless automated deployments with staging environments." },
      ],

      benefits: [
        { title: "Measurable Revenue & Lead Growth", description: "Optimized user journeys lead to higher contact form completions and lower drop-offs." },
        { title: "Superior Search Engine Rankings", description: "Built from day one with technical SEO best practices, structured schemas, and fast TTFB." },
        { title: "Zero Vendor Lock-in & Full Ownership", description: "You receive complete repository source code ownership and clear documentation." },
        { title: "Reduced Long-Term Maintenance Costs", description: "Clean modular code minimizes bug fixes and enables rapid future feature expansion." },
      ],

      processSteps: [
        { step: 1, title: "Discovery & Technical Scoping", description: "We analyze your business objectives, target audience, and architecture requirements to define a concrete roadmap." },
        { step: 2, title: "Architecture & Interface Design", description: "We design wireframes, database schemas, and UX flows tailored for high conversion and brand credibility." },
        { step: 3, title: "Agile Development Sprints", description: "We build features in iterative weekly sprints with live staging preview links for transparent progress." },
        { step: 4, title: "Rigorous QA & Speed Optimization", description: "End-to-end testing across mobile, tablet, and desktop devices, validating forms, security, and Core Web Vitals." },
        { step: 5, title: "Production Deployment & Launch", description: "Configuring production domains, SSL certificates, analytics, and search console integrations." },
        { step: 6, title: "Handover & Post-Launch Support", description: "Full code walkthrough, repository transfer, and dedicated warranty support to ensure smooth operations." },
      ],

      technologies: [
        { name: "Next.js", category: "frontend" },
        { name: "React", category: "frontend" },
        { name: "TypeScript", category: "language" },
        { name: "Node.js", category: "backend" },
        { name: "MongoDB", category: "database" },
        { name: "Tailwind CSS", category: "styling" },
        { name: "REST APIs", category: "backend" },
        { name: "Vercel / Cloud", category: "devops" },
      ],

      clientRequirements: [
        { title: "Business & Project Goals", description: "Overview of your target audience, key functional needs, and expected outcomes." },
        { title: "Brand Assets & Guidelines", description: "Logo files, brand colors, typography preferences, and existing media assets." },
        { title: "Content & Copywriting Materials", description: "Draft text, service descriptions, images, or reference websites you admire." },
        { title: "Third-Party Credentials", description: "API keys, payment gateway accounts, or domain hosting access when integrations are required." },
      ],

      faqs: [
        {
          question: `What is included in the ${name} service?`,
          answer: `Our service is full-cycle: from technical discovery, UI/UX structure, and custom frontend/backend development to database integrations, Core Web Vitals optimization, automated QA, and production deployment support.`,
        },
        {
          question: "How long does a typical project take from start to finish?",
          answer: "Most custom projects are completed within 2 to 6 weeks depending on the complexity of features, custom integrations, and content readiness. We provide a guaranteed timeline during discovery.",
        },
        {
          question: "How is pricing structured?",
          answer: "Pricing is transparent and customized to your specific scope, features, and timeline requirements. We provide a milestone-based fixed quote after our discovery call with zero hidden costs.",
        },
        {
          question: "Do I get full ownership of the source code?",
          answer: "Yes, 100%. Upon final project completion and handover, you receive full intellectual property and source code ownership with direct access to your private Git repository.",
        },
        {
          question: "Can this service integrate with our existing database or third-party tools?",
          answer: "Absolutely. We routinely integrate with MongoDB, PostgreSQL, Stripe/PayPal, custom CRMs, email automations, and external REST/GraphQL APIs safely without data disruption.",
        },
        {
          question: "What happens after the project is deployed?",
          answer: "We provide dedicated post-launch support and warranty to ensure everything runs smoothly, along with optional ongoing maintenance and optimization packages.",
        },
      ],

      targetAudienceProfiles: [
        {
          role: "Founders & Business Owners",
          label: "Business leaders looking to launch or upgrade digital systems to increase lead flow and operational reliability.",
          pains: ["Slow legacy website", "Low conversion rates", "Expensive maintenance"],
          triggers: ["Launching a new marketing campaign", "Outgrowing template site builders"],
        },
        {
          role: "CTOs & Technical Leads",
          label: "Engineering leaders needing dedicated modern Next.js/Node.js architecture delivered on time with clean code.",
          pains: ["Internal bandwidth bottlenecks", "Technical debt", "Sub-optimal Core Web Vitals"],
          triggers: ["Platform migration", "High-traffic product launch"],
        },
      ],

      buyerIntentTriggers: [
        `Looking to build custom ${name.toLowerCase()} for commercial business operations`,
        "Replacing a slow, outdated website with modern Next.js architecture",
        "Preparing a high-budget marketing campaign requiring verified 95+ Core Web Vitals",
        "Needing secure database and custom API integrations without platform lock-in",
      ],

      commonObjections: [
        {
          objection: "Why invest in custom engineering instead of a cheap website template or page builder?",
          response: "Templates come with bloated code, slow loading speeds, weak security, and rigid design constraints that hurt Google rankings and conversions. Custom Next.js engineering gives you complete control over speed (sub-second loading), custom business workflows, technical SEO, and conversion optimization.",
        },
        {
          objection: "How do we ensure the project stays on schedule and within budget?",
          response: "We work in structured weekly agile sprints with transparent preview links, milestone-based deliverables, and clear scope documentation to eliminate unexpected surprises.",
        },
      ],

      conversionStrategy: {
        primaryCtaText: `Book a Free ${name} Discovery Call`,
        secondaryCtaText: "Explore Our Portfolio & Case Studies",
        anchorTextOptions: [
          `custom ${name.toLowerCase()} services`,
          `hire ${name.toLowerCase()} experts`,
          `professional ${name.toLowerCase()} development`,
        ],
        idealSearchIntents: ["commercial", "transactional", "service_evaluation"],
      },

      serviceAuthorityScore: 88,
      relatedServices: ["custom-website-development", "full-stack-web-app-development", "website-speed-optimization"],
      targetKeywords: [
        `${name.toLowerCase()}`,
        `custom ${name.toLowerCase()}`,
        `${name.toLowerCase()} services`,
        `${name.toLowerCase()} agency`,
        `hire ${name.toLowerCase()} developer`,
      ],
      localKeywords: [
        `${name.toLowerCase()} in Lahore`,
        `${name.toLowerCase()} in Pakistan`,
      ],
      seoTitle: `${name} | Muhyo Tech`,
      seoDescription: `Custom ${name} engineered with Next.js, clean backend architecture, and high conversion design. Book a free technical discovery call today.`,
      ctaTitle: `Ready to Elevate Your Business with ${name}?`,
      ctaDescription: "Schedule a 1-on-1 technical discovery call with Muhyo Tech to discuss your goals, features, and custom scope.",
      ctaPrimaryText: "Book a Free Technical Call",
      ctaSecondaryText: "View Our Portfolio",
      deliveryNote: "Delivered in agile weekly sprints with direct Git repository access and live staging previews.",
      quoteNote: "Pricing depends on project requirements, features, timeline, and scope. Book a call to receive a custom quote.",
    },

    positioning: {
      targetAudience: [context.opportunity.targetAudience || "business_owner", "founders", "technical_directors"],
      industries: [context.opportunity.targetIndustry || "general_technology", "saas", "ecommerce"],
      primaryProblem: problem,
      primarySolution: `Custom ${name} engineered with Next.js and modern software best practices by Muhyo Tech.`,
      differentiator: "Production-grade Next.js App Router engineering with verified 95+ Core Web Vitals and evidence-backed conversion architecture.",
    },

    contentStrategy: {
      supportingTopicGroups: ["architecture", "performance", "seo", "scalability", "cost_guide", "tech_comparison"],
      commercialIntents: [context.opportunity.commercialIntent || "SERVICE_EVALUATION", "HIGH_COMMERCIAL"],
      recommendedBlogCount: 4,
    },

    generationMetadata: {
      sourceOpportunityId,
      confidence: 95,
      duplicateRisk: "LOW",
      generatedAt: new Date().toISOString(),
      generatorVersion: "v6_ai_service_generator_360",
    },
  };
}

/**
 * Generates a complete, deep, 360-degree AI Service Draft from a ServiceOpportunity payload.
 * 
 * @param {Object} opportunityPayload - Source opportunity payload
 * @param {Object} [options={}] - Options (e.g. timeoutMs, model)
 * @returns {Promise<Object>} Generated Service Draft payload with Validation Report
 */
export async function generateServiceDraft(opportunityPayload = {}, options = {}) {
  const context = buildServiceGenerationContext(opportunityPayload);
  const opportunityId = opportunityPayload._id || opportunityPayload.opportunityId || "";

  const systemInstruction = `You are a Principal Software Solutions Architect, Commercial SEO Strategist, and Technical Conversion Copywriter for Muhyo Tech.
Muhyo Tech is a high-end web development, Next.js engineering, full-stack architecture, and technical SEO agency based in Pakistan, serving global and local clients.

Your task is to generate an in-depth, production-ready, commercially potent, and deeply technical 360-Degree Service Draft in JSON format based on the given Service Opportunity.

STRICT QUALITY & TECHNICAL CRITERIA:
1. Return ONLY valid JSON with no markdown wrapping outside the JSON.
2. The generated service must be distinct, authoritative, and actionable. Never produce shallow or generic fluff.
3. Every problem must clearly define the technical/business bottleneck, and every solution/deliverable must explain how it is engineered (mention Next.js, Node.js, TypeScript, React Server Components, Tailwind, MongoDB, clean architecture where applicable).
4. Provide comprehensive arrays:
   - "problemsSolved": 3 to 4 detailed problem objects ({ title, description, icon }).
   - "deliverables": 4 to 6 tangible, concrete deliverables ({ title, description, icon }).
   - "features": 4 to 6 specific technical features ({ title, description }).
   - "benefits": 4 to 5 measurable commercial benefits ({ title, description }).
   - "processSteps": 5 to 7 detailed agile delivery steps ({ step, title, description }).
   - "technologies": 6 to 10 relevant technologies with specific category tags or names.
   - "clientRequirements": 4 to 6 clear prerequisites ({ title, description }).
   - "faqs": 5 to 6 in-depth FAQs addressing scope, exact timelines (e.g., 2-6 weeks), pricing models, revision policies, tech stack rationale, and maintenance support.
   - "targetAudienceProfiles": 2 to 3 buyer personas ({ role, label, pains: [...], triggers: [...] }).
   - "buyerIntentTriggers": 3 to 5 realistic search/commercial buying triggers.
   - "commonObjections": 2 to 3 common sales objections with persuasive technical responses ({ objection, response }).
   - "conversionStrategy": { primaryCtaText, secondaryCtaText, anchorTextOptions: [...], idealSearchIntents: [...] }.
   - "serviceAuthorityScore": Number between 80 and 95.
5. SEO:
   - "seoTitle": 40-60 characters, CTR-optimized (e.g., "Custom Next.js App Development | Muhyo Tech").
   - "seoDescription": 130-160 characters, compelling meta description with call to action.
   - "targetKeywords": 5 to 8 commercial and transactional search terms.
   - "localKeywords": 3 to 5 regional/local search keywords.
6. The service title & slug must be distinct from existing catalog services: (${context.existingCatalog.map((s) => s.title).join(", ")}).`;

  const prompt = `Generate an in-depth 360-Degree Service Draft for the following commercial opportunity:

OPPORTUNITY DATA:
- Proposed Service Name: ${context.opportunity.proposedServiceName}
- Commercial Intent: ${context.opportunity.commercialIntent}
- Problem Solved: ${context.opportunity.problem}
- Target Audience: ${context.opportunity.targetAudience}
- Target Industry: ${context.opportunity.targetIndustry}

EXISTING Muhyo Tech SERVICE CATALOG (Avoid duplicating these titles/slugs):
${JSON.stringify(context.existingCatalog, null, 2)}

Return JSON with exact top-level keys:
- "service": complete service data object with ALL detailed sections (title, slug, category, shortDescription, overview, fullDescription, problemsSolved, deliverables, features, benefits, processSteps, technologies, clientRequirements, faqs, targetAudienceProfiles, buyerIntentTriggers, commonObjections, conversionStrategy, serviceAuthorityScore, relatedServices, targetKeywords, localKeywords, seoTitle, seoDescription, ctaTitle, ctaDescription, ctaPrimaryText, ctaSecondaryText, deliveryNote, quoteNote)
- "positioning": object with { targetAudience, industries, primaryProblem, primarySolution, differentiator }
- "contentStrategy": object with { supportingTopicGroups, commercialIntents, recommendedBlogCount }
- "generationMetadata": object with { sourceOpportunityId, confidence, duplicateRisk, generatedAt, generatorVersion }`;

  let draftPayload = null;
  try {
    const rawAiOutput = await generateGeminiResponse(prompt, {
      systemInstruction,
      temperature: 0.35,
      responseMimeType: "application/json",
      timeoutMs: options.timeoutMs || 30000,
    });

    draftPayload = JSON.parse(rawAiOutput);
    
    // Ensure all critical top-level subfields exist
    if (!draftPayload.service && draftPayload.title) {
      draftPayload = { service: draftPayload };
    }
  } catch (err) {
    console.warn("[serviceGeneratorEngine] Gemini call failed/timed out, using robust fallback builder:", err.message);
    draftPayload = buildFallbackServiceDraft(context, opportunityId);
  }

  // Ensure metadata holds opportunity ID and version
  if (!draftPayload.generationMetadata) {
    draftPayload.generationMetadata = {};
  }
  draftPayload.generationMetadata.sourceOpportunityId = opportunityId;
  draftPayload.generationMetadata.generatorVersion = "v6_ai_service_generator_360";
  draftPayload.generationMetadata.generatedAt = new Date().toISOString();

  // Run Automated 360 Validation
  const validationReport = validateServiceDraft(draftPayload, getServiceIntelligenceSnapshotSync());

  return {
    success: true,
    data: draftPayload.service, // Dual compatibility: data holds direct service object
    draft: draftPayload,
    validationReport,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Regenerates a specific section of a service draft while preserving locked/approved sections.
 * 
 * @param {Object} existingDraft - Existing draft object
 * @param {string} sectionToRegenerate - Section name (e.g. 'seo', 'overview', 'faqs', 'problems', 'deliverables', 'benefits', 'features', 'processSteps', 'objections', 'targetAudienceProfiles', 'buyerIntentTriggers', 'conversionStrategy', 'supportingTopics')
 * @param {string} [instruction=""] - Optional custom instruction
 * @returns {Promise<Object>} Updated Service Draft
 */
export async function regenerateServiceSection(existingDraft = {}, sectionToRegenerate = "", instruction = "") {
  if (!existingDraft || (!existingDraft.service && !existingDraft.title)) {
    throw new Error("Invalid existing draft provided for section regeneration.");
  }

  const updatedDraft = JSON.parse(JSON.stringify(existingDraft.service ? existingDraft : { service: existingDraft }));
  const serviceTitle = updatedDraft.service.title || "Custom Service";

  try {
    const prompt = `Regenerate ONLY the '${sectionToRegenerate}' section for the service '${serviceTitle}'.
Custom Instruction: ${instruction || "Provide deep technical specificity, comprehensive business value, and commercial positioning."}

Return JSON containing ONLY the regenerated section payload key '${sectionToRegenerate}'.`;

    const rawOutput = await generateGeminiResponse(prompt, {
      temperature: 0.4,
      responseMimeType: "application/json",
      timeoutMs: 20000,
    });

    const parsedSection = JSON.parse(rawOutput);
    const newSectionData = parsedSection[sectionToRegenerate] !== undefined ? parsedSection[sectionToRegenerate] : parsedSection;

    if (sectionToRegenerate === "seo") {
      updatedDraft.service.seoTitle = newSectionData.seoTitle || updatedDraft.service.seoTitle;
      updatedDraft.service.seoDescription = newSectionData.seoDescription || updatedDraft.service.seoDescription;
      updatedDraft.service.targetKeywords = newSectionData.targetKeywords || updatedDraft.service.targetKeywords;
      updatedDraft.service.localKeywords = newSectionData.localKeywords || updatedDraft.service.localKeywords;
    } else if (sectionToRegenerate === "faqs") {
      updatedDraft.service.faqs = Array.isArray(newSectionData) ? newSectionData : newSectionData.faqs || updatedDraft.service.faqs;
    } else if (sectionToRegenerate === "problems" || sectionToRegenerate === "problemsSolved") {
      updatedDraft.service.problemsSolved = Array.isArray(newSectionData) ? newSectionData : newSectionData.problemsSolved || updatedDraft.service.problemsSolved;
    } else if (sectionToRegenerate === "deliverables") {
      updatedDraft.service.deliverables = Array.isArray(newSectionData) ? newSectionData : newSectionData.deliverables || updatedDraft.service.deliverables;
    } else if (sectionToRegenerate === "features") {
      updatedDraft.service.features = Array.isArray(newSectionData) ? newSectionData : newSectionData.features || updatedDraft.service.features;
    } else if (sectionToRegenerate === "benefits") {
      updatedDraft.service.benefits = Array.isArray(newSectionData) ? newSectionData : newSectionData.benefits || updatedDraft.service.benefits;
    } else if (sectionToRegenerate === "processSteps" || sectionToRegenerate === "process") {
      updatedDraft.service.processSteps = Array.isArray(newSectionData) ? newSectionData : newSectionData.processSteps || updatedDraft.service.processSteps;
    } else if (sectionToRegenerate === "technologies" || sectionToRegenerate === "techStack") {
      updatedDraft.service.technologies = Array.isArray(newSectionData) ? newSectionData : newSectionData.technologies || updatedDraft.service.technologies;
    } else if (sectionToRegenerate === "clientRequirements") {
      updatedDraft.service.clientRequirements = Array.isArray(newSectionData) ? newSectionData : newSectionData.clientRequirements || updatedDraft.service.clientRequirements;
    } else if (sectionToRegenerate === "objections" || sectionToRegenerate === "commonObjections") {
      updatedDraft.service.commonObjections = Array.isArray(newSectionData) ? newSectionData : newSectionData.commonObjections || updatedDraft.service.commonObjections;
    } else if (sectionToRegenerate === "targetAudienceProfiles") {
      updatedDraft.service.targetAudienceProfiles = Array.isArray(newSectionData) ? newSectionData : newSectionData.targetAudienceProfiles || updatedDraft.service.targetAudienceProfiles;
    } else if (sectionToRegenerate === "buyerIntentTriggers") {
      updatedDraft.service.buyerIntentTriggers = Array.isArray(newSectionData) ? newSectionData : newSectionData.buyerIntentTriggers || updatedDraft.service.buyerIntentTriggers;
    } else if (sectionToRegenerate === "conversionStrategy") {
      updatedDraft.service.conversionStrategy = typeof newSectionData === "object" ? newSectionData : updatedDraft.service.conversionStrategy;
    } else if (sectionToRegenerate === "overview") {
      updatedDraft.service.overview = typeof newSectionData === "string" ? newSectionData : newSectionData.overview || updatedDraft.service.overview;
    } else if (sectionToRegenerate === "supportingTopics" && updatedDraft.contentStrategy) {
      updatedDraft.contentStrategy.supportingTopicGroups = Array.isArray(newSectionData) ? newSectionData : newSectionData.supportingTopicGroups || updatedDraft.contentStrategy.supportingTopicGroups;
    }
  } catch (err) {
    console.warn(`[serviceGeneratorEngine] Section regeneration for '${sectionToRegenerate}' failed, keeping existing content:`, err.message);
  }

  const validationReport = validateServiceDraft(updatedDraft);
  return {
    success: true,
    data: updatedDraft.service,
    draft: updatedDraft,
    validationReport,
    regeneratedSection: sectionToRegenerate,
    regeneratedAt: new Date().toISOString(),
  };
}
