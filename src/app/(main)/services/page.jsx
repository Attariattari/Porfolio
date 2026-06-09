import React from "react";
import ServicesClient from "./ServicesClient";
import { portfolioData } from "@/lib/data";
import { ServiceController } from "@/controllers/ServiceController";
import { serializeDoc } from "@/lib/mongooseHelper";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal performance
export const revalidate = 300;

export const metadata = {
  title: "Professional Web Development Services | Muhyo Tech",
  description:
    "Specialized engineering solutions for modern brands. From full-stack Next.js architecture to custom digital products.",
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Web Development Services",
  provider: {
    "@type": "Person",
    name: "Muhyo Tech",
  },
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
