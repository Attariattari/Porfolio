import { ServiceController } from "@/controllers/ServiceController";
import { notFound } from "next/navigation";
import { buildCanonical, cleanSeoText, getSeoImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";

const keywordList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
        .filter(Boolean)
    : [];

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) return { title: "Service Not Found" };
  const canonicalUrl = buildCanonical(`/services/${service.slug || serviceSlug}`);
  const description = cleanSeoText(
    service.seoDescription || service.shortDescription || service.description,
    155,
  );
  const image = getSeoImage(service.heroImage || service.banner || service.image);

  return {
    title: service.seoTitle || `${service.title} | Muhyo Tech`,
    description,
    keywords:
      Array.isArray(service.keywords) && service.keywords.length
        ? service.keywords.join(", ")
        : keywordList(service.techStack || service.technologies).join(", "),
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
    "description": cleanSeoText(service.seoDescription || service.description, 155),
    "url": buildCanonical(`/services/${service.slug || serviceSlug}`),
    "image": getSeoImage(service.heroImage || service.banner || service.image),
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
