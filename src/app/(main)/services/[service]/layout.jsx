import { ServiceController } from "@/controllers/ServiceController";
import { notFound } from "next/navigation";
import { buildCanonical, cleanSeoText, getSeoImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import FAQSchema from "@/components/seo/FAQSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { getServiceSearchContent } from "@/lib/serviceSearchContent";

const keywordList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
        .filter(Boolean)
    : [];

const removeBrandSuffix = (value = "") =>
  String(value)
    .replace(/\s*\|\s*Muhyo Tech\s*$/i, "")
    .trim();

const faqList = (service) =>
  Array.isArray(service?.faqs) && service.faqs.length
    ? service.faqs
    : Array.isArray(service?.faq)
      ? service.faq
      : [];

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) return { title: "Service Not Found" };
  const searchContent = getServiceSearchContent(service.slug || serviceSlug);
  const canonicalUrl = buildCanonical(`/services/${service.slug || serviceSlug}`);
  const description = cleanSeoText(
    searchContent?.metaDescription ||
      service.seoDescription ||
      service.shortDescription ||
      service.description,
    155,
  );
  const image = getSeoImage(service.heroImage || service.banner || service.image);
  const metadataTitle = removeBrandSuffix(
    searchContent?.metaTitle || service.seoTitle || service.title,
  );
  const metadataKeywords = [
    searchContent?.primaryKeyword,
    ...(searchContent?.keywords || []),
    ...keywordList(service.targetKeywords),
    ...keywordList(service.localKeywords),
    ...(Array.isArray(service.keywords) && service.keywords.length
      ? service.keywords
      : keywordList(service.techStack || service.technologies)),
  ];

  return {
    title: metadataTitle,
    description,
    keywords:
      Array.from(new Set(metadataKeywords.filter(Boolean))).join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${metadataTitle} | Muhyo Tech`,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: service.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${metadataTitle} | Muhyo Tech`,
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

  const searchContent = getServiceSearchContent(service.slug || serviceSlug);
  const canonicalUrl = buildCanonical(`/services/${service.slug || serviceSlug}`);
  const image = getSeoImage(service.heroImage || service.banner || service.image);
  const description = cleanSeoText(
    searchContent?.metaDescription || service.seoDescription || service.description,
    155,
  );
  const visibleFaqs = [
    ...(searchContent?.faqs || []),
    ...faqList(service),
  ].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.question === item.question) ===
      index,
  );
  const serviceDetailSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": searchContent?.h1 || service.title,
    "description": description,
    "url": canonicalUrl,
    "image": image,
    "serviceType": searchContent?.primaryKeyword || service.category || service.title,
    "areaServed": [
      { "@type": "City", "name": "Lahore" },
      { "@type": "Country", "name": "Pakistan" }
    ],
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
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Services", url: buildCanonical("/services") },
          { name: service.title, url: canonicalUrl },
        ]}
      />
      <FAQSchema faqs={visibleFaqs} />
      {children}
    </>
  );
}
