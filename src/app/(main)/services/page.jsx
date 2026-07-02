import React from "react";
import ServicesClient from "./ServicesClient";
import { portfolioData } from "@/lib/data";
import { ServiceController } from "@/controllers/ServiceController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, getSeoImage } from "@/lib/seo";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal performance
export const revalidate = 300;

export const metadata = {
  title: "Professional Web Development Services | Muhyo Tech",
  description:
    "Professional Next.js development, SaaS dashboards, backend APIs, UI/UX design, SEO optimization, cloud infrastructure, and custom digital products.",
  alternates: { canonical: buildCanonical("/services") },
  openGraph: {
    title: "Muhyo Tech Services - Next.js, SaaS, Backend & SEO",
    description:
      "Professional Next.js development, SaaS dashboards, backend APIs, UI/UX design, SEO optimization, and custom digital products.",
    url: buildCanonical("/services"),
    images: [{ url: getSeoImage("/portfolio-hero.png"), width: 1200, height: 630, alt: "Muhyo Tech services" }],
    type: "website",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web Development Services",
  provider: {
    "@type": "Organization",
    name: "Muhyo Tech",
    url: SITE_URL,
  },
  url: buildCanonical("/services"),
  image: getSeoImage("/portfolio-hero.png"),
  serviceType: "Software Engineering",
  areaServed: "Worldwide",
};

export default async function ServicesPage() {
  // Get merged services: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbServices = await ServiceController.getAll(true).catch(() => []);
  const services =
    (dbServices?.length > 0 ? serializeDoc(dbServices) : null) ||
    portfolioData.services;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <ServicesClient services={services} initialData={portfolioData} />
    </>
  );
}
