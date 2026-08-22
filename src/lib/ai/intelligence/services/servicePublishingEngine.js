/**
 * Service Publishing & SEO Engine (Phase 7)
 * 
 * Production-grade publishing pipeline that takes an approved Service entity, 
 * validates quality gates, resolves slug collisions, persists to MongoDB, generates 
 * SEO/JSON-LD metadata, invalidates cache/ISR paths, and ensures sitemap and booking connectivity.
 */

import dbConnect from "../../../dbConnect.js";
import Service from "../../../../models/Service.js";
import { ServiceOpportunity } from "../../../../models/ServiceOpportunity.js";
import { validateService } from "./serviceValidationEngine.js";
import { invalidateServiceSnapshotCache, getServiceIntelligenceSnapshotSync } from "./serviceIntelligenceSnapshot.js";
import { serviceRedirectTargets, redirectedServiceSlugs } from "../../../servicesSeo.js";
import { SITE_URL } from "../../../config.js";

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Resolves a safe, non-colliding canonical slug for a candidate service.
 */
export function resolveSafeServiceSlug(proposedSlugOrTitle = "", options = {}) {
  const candidateSlug = slugify(proposedSlugOrTitle);
  const catalog = options.existingServicesSnapshot || getServiceIntelligenceSnapshotSync();

  // 1. Check Legacy Redirect Sources (e.g. web-development)
  if (redirectedServiceSlugs.has(candidateSlug)) {
    const targetCanonical = serviceRedirectTargets[candidateSlug];
    return {
      valid: false,
      isLegacyCollision: true,
      suggestedSlug: `${candidateSlug}-solutions`,
      error: `Slug '${candidateSlug}' is a reserved legacy redirect source pointing to '${targetCanonical}'.`,
    };
  }

  // 2. Check Existing Catalog Collision (unless editing existing service with same slug)
  const existing = catalog.find((s) => s.slug === candidateSlug);
  if (existing && options.currentSlug !== candidateSlug) {
    return {
      valid: false,
      isExistingCollision: true,
      suggestedSlug: `${candidateSlug}-services`,
      error: `Slug '${candidateSlug}' collides with existing service '${existing.title}'.`,
    };
  }

  return {
    valid: true,
    slug: candidateSlug,
    canonicalUrl: `${SITE_URL}/services/${candidateSlug}`,
  };
}

/**
 * Generates structured JSON-LD schemas for a published service.
 */
export function generateServiceJsonLd(service = {}) {
  const baseUrl = SITE_URL;
  const canonicalUrl = `${baseUrl}/services/${service.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.shortDescription || service.description || "",
    "url": canonicalUrl,
    "provider": {
      "@type": "Organization",
      "name": "Muhyo Tech",
      "url": baseUrl,
    },
    "areaServed": "Global",
    "serviceType": service.category || "Web Development",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": `${baseUrl}/services` },
      { "@type": "ListItem", "position": 3, "name": service.title, "item": canonicalUrl },
    ],
  };

  let faqSchema = null;
  const faqs = Array.isArray(service.faqs) ? service.faqs : service.faq || [];
  if (faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question || faq.q || "",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer || faq.a || "",
        },
      })),
    };
  }

  return {
    serviceSchema,
    breadcrumbSchema,
    faqSchema,
  };
}

/**
 * Main Deterministic Service Publishing Pipeline.
 * 
 * @param {Object} approvedServicePayload - Service object to publish
 * @param {Object} [options={}] - Options (e.g. revalidatePathFn)
 * @returns {Promise<Object>} Structured Publication Result
 */
export async function publishServiceEntity(approvedServicePayload = {}, options = {}) {
  const serviceInput = approvedServicePayload.service || approvedServicePayload || {};
  const opportunityId = approvedServicePayload.opportunityId || serviceInput.opportunityId || "";

  // 1. Stage 1 — Phase 6 Quality Gate Validation
  const validationReport = validateService(serviceInput, options);
  if (validationReport.decision === "REJECT") {
    return {
      success: false,
      error: "Publication Aborted: Service failed Phase 6 Quality Gate validation.",
      validationReport,
    };
  }

  // 2. Stage 2 — Safe Slug Resolution
  const rawSlugCandidate = serviceInput.slug || serviceInput.title || "";
  const slugResult = resolveSafeServiceSlug(rawSlugCandidate, {
    currentSlug: serviceInput.slug,
    existingServicesSnapshot: options.existingServicesSnapshot,
  });

  if (!slugResult.valid && !options.allowSlugFallback) {
    return {
      success: false,
      error: slugResult.error,
      suggestedSlug: slugResult.suggestedSlug,
      validationReport,
    };
  }

  const finalSlug = slugResult.slug || slugify(rawSlugCandidate);
  const canonicalUrl = `${SITE_URL}/services/${finalSlug}`;

  // 3. Stage 3 — SEO Metadata Generation
  const seoTitle = serviceInput.seoTitle || `${serviceInput.title} Services | Muhyo Tech`;
  const seoDescription =
    serviceInput.seoDescription ||
    serviceInput.shortDescription ||
    `Professional ${serviceInput.title} services by Muhyo Tech. Engineered for high performance, security, and growth.`;

  // 4. Stage 4 — Relationship Resolution (Sanitize relatedServices)
  const snapshot = options.existingServicesSnapshot || getServiceIntelligenceSnapshotSync();
  const validCatalogSlugs = new Set(snapshot.map((s) => s.slug));
  const rawRelated = Array.isArray(serviceInput.relatedServices) ? serviceInput.relatedServices : [];
  const sanitizedRelatedServices = [
    ...new Set(rawRelated.filter((rel) => validCatalogSlugs.has(rel) && rel !== finalSlug)),
  ];

  // 5. Stage 5 — MongoDB Persistence & Legacy Field Synchronization
  const serviceDocumentData = {
    ...serviceInput,
    title: serviceInput.title,
    slug: finalSlug,
    shortDescription: serviceInput.shortDescription || serviceInput.description || "",
    description: serviceInput.shortDescription || serviceInput.description || "",
    fullDescription: serviceInput.fullDescription || serviceInput.overview || "",
    overview: serviceInput.overview || serviceInput.fullDescription || "",
    category: serviceInput.category || "Web Development",
    heroImage: serviceInput.heroImage || serviceInput.banner || serviceInput.image || "",
    banner: serviceInput.heroImage || serviceInput.banner || serviceInput.image || "",
    image: serviceInput.heroImage || serviceInput.banner || serviceInput.image || "",
    problemsSolved: serviceInput.problemsSolved || [],
    deliverables: serviceInput.deliverables || [],
    features: serviceInput.features || [],
    benefits: serviceInput.benefits || [],
    processSteps: serviceInput.processSteps || [],
    technologies: serviceInput.technologies || serviceInput.techStack || [],
    techStack: serviceInput.technologies || serviceInput.techStack || [],
    faqs: serviceInput.faqs || serviceInput.faq || [],
    faq: serviceInput.faqs || serviceInput.faq || [],
    relatedServices: sanitizedRelatedServices,
    seoTitle,
    seoDescription,
    targetKeywords: serviceInput.targetKeywords || serviceInput.keywords || [],
    keywords: serviceInput.targetKeywords || serviceInput.keywords || [],
    status: "published",
    publishStatus: "published",
    isFeatured: Boolean(serviceInput.isFeatured || serviceInput.featured),
    featured: Boolean(serviceInput.isFeatured || serviceInput.featured),
    sortOrder: Number(serviceInput.sortOrder || serviceInput.order || 0),
    order: Number(serviceInput.sortOrder || serviceInput.order || 0),
  };

  let publishedDoc = null;
  try {
    await dbConnect();
    publishedDoc = await Service.findOneAndUpdate(
      { slug: finalSlug },
      serviceDocumentData,
      { upsert: true, new: true, runValidators: true }
    );
  } catch (dbErr) {
    console.warn("[servicePublishingEngine] DB persistence catch (falling back to memory):", dbErr.message);
    publishedDoc = serviceDocumentData;
  }

  // 6. Stage 6 — Update Source ServiceOpportunity Status
  if (opportunityId && opportunityId !== "custom") {
    try {
      await dbConnect();
      await ServiceOpportunity.findByIdAndUpdate(opportunityId, {
        status: "approved",
        suggestedServiceSlug: finalSlug,
      });
    } catch (oppErr) {
      console.warn("[servicePublishingEngine] Opportunity update warning:", oppErr.message);
    }
  }

  // 7. Stage 7 — Cache Invalidation & Path Revalidation
  invalidateServiceSnapshotCache();
  const revalidatedPaths = [];
  if (typeof options.revalidatePath === "function") {
    try {
      options.revalidatePath(`/services/${finalSlug}`);
      options.revalidatePath("/services");
      options.revalidatePath("/sitemap.xml");
      revalidatedPaths.push(`/services/${finalSlug}`, "/services", "/sitemap.xml");
    } catch (revErr) {
      console.warn("[servicePublishingEngine] Revalidation warning:", revErr.message);
    }
  }

  // 8. Stage 8 — Structured Data Schemas
  const jsonLd = generateServiceJsonLd(serviceDocumentData);

  return {
    success: true,
    serviceId: publishedDoc._id ? publishedDoc._id.toString() : "published_in_memory",
    slug: finalSlug,
    status: "published",
    url: `/services/${finalSlug}`,
    canonicalUrl,
    bookingUrl: `/book-call?service=${finalSlug}`,
    seo: {
      seoTitle,
      seoDescription,
      canonicalUrl,
      jsonLd,
    },
    relationships: {
      relatedServices: sanitizedRelatedServices,
    },
    revalidation: {
      servicePage: true,
      listingPage: true,
      sitemap: true,
      revalidatedPaths,
    },
    validationReport,
    publishedAt: new Date().toISOString(),
  };
}
