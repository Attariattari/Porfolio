import BookCallClient from "../book-call/BookCallClient";
import { buildCanonical, getSeoImage } from "@/lib/seo";

export const metadata = {
  title: "Book a Website Development Project Call",
  description:
    "Book a project discussion with Muhyo Tech for websites, web applications, admin dashboards, redesigns, API integrations, and full-stack development.",
  alternates: { canonical: buildCanonical("/book-a-call") },
  openGraph: {
    url: buildCanonical("/book-a-call"),
    images: [{ url: getSeoImage("/contact-preview.png"), width: 1200, height: 630, alt: "Book a website development call with Muhyo Tech" }],
  },
  twitter: { card: "summary_large_image", images: [getSeoImage("/contact-preview.png")] },
};

export default async function BookACallPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <BookCallClient initialServiceSlug={resolvedSearchParams?.service || ""} />;
}
