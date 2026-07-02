import { ServiceController } from "@/controllers/ServiceController";
import { notFound } from "next/navigation";
import { buildCanonical, cleanSeoText, getSeoImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) return { title: "Service Not Found" };
  const canonicalUrl = buildCanonical(`/services/${service.slug || serviceSlug}`);
  const description = cleanSeoText(service.description, 155);
  const image = getSeoImage(service.image);

  return {
    title: `${service.title} | Muhyo Tech Services`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: service.title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: service.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description,
      images: [image],
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
    "description": cleanSeoText(service.description, 155),
    "url": buildCanonical(`/services/${service.slug || serviceSlug}`),
    "image": getSeoImage(service.image),
    "provider": {
      "@type": "Organization",
      "name": "Muhyo Tech",
      "url": SITE_URL
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
