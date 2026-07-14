import React from "react";
import ServicesClient from "./ServicesClient";
import { portfolioData } from "@/lib/data";
import { ServiceController } from "@/controllers/ServiceController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, getSeoImage } from "@/lib/seo";
import FAQSchema from "@/components/seo/FAQSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { servicesPageFaqs } from "@/lib/servicesSeo";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal performance
export const revalidate = 300;

export const metadata = {
  title: "Web Development Services in Lahore",
  description:
    "Muhyo Tech offers custom websites, Next.js apps, MERN stack development, admin dashboards, and SEO-friendly web solutions in Lahore and beyond.",
  alternates: { canonical: buildCanonical("/services") },
  openGraph: {
    title: "Web Development Services in Lahore | Muhyo Tech",
    description:
      "Muhyo Tech offers custom websites, Next.js apps, MERN stack development, admin dashboards, and SEO-friendly web solutions in Lahore and beyond.",
    url: buildCanonical("/services"),
    images: [{ url: getSeoImage("/services-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech - Web Development Services in Lahore" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Development Services in Lahore | Muhyo Tech",
    description:
      "Muhyo Tech offers custom websites, Next.js apps, MERN stack development, admin dashboards, and SEO-friendly web solutions in Lahore and beyond.",
    images: [getSeoImage("/services-preview.png")],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web Development Services in Lahore",
  provider: {
    "@type": "Organization",
    name: "Muhyo Tech",
    url: SITE_URL,
  },
  url: buildCanonical("/services"),
  image: getSeoImage("/services-preview.png"),
  serviceType:
    "Web Development, Next.js Development, MERN Stack Development, Admin Dashboard Development, Custom Website Development",
  areaServed: {
    "@type": "Place",
    name: "Lahore, Pakistan",
  },
};

export default async function ServicesPage() {
  // Get merged services: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbServices = await ServiceController.getAll(true).catch(() => []);
  const services =
    (dbServices?.length > 0 ? serializeDoc(dbServices) : null) ||
    portfolioData.services;
  const servicesPageData = {
    serviceFeatures: portfolioData.serviceFeatures,
    serviceProcess: portfolioData.serviceProcess,
    servicesPage: portfolioData.siteConfig.servicesPage,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Services", url: buildCanonical("/services") },
        ]}
      />
      <FAQSchema faqs={servicesPageFaqs} />
      <ServicesClient services={services} pageData={servicesPageData} />
    </>
  );
}
