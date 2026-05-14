import { ServiceController } from "@/controllers/ServiceController";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.title} | Muhyo Tech Services`,
    description: service.description,
    openGraph: {
      title: service.title,
      description: service.description,
      images: [service.image],
    },
  };
}

export default async function ServiceLayout({ children, params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) {
    notFound();
  }

  const serviceDetailSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.description,
    "provider": {
      "@type": "Person",
      "name": "Muhyo Tech"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceDetailSchema) }}
      />
      {children}
    </>
  );
}
