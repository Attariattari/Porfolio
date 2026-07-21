import BookCallClient from "./BookCallClient";
import { buildCanonical, getSeoImage } from "@/lib/seo";

export const metadata = {
  title: "Book a Website Development Project Call",
  description:
    "Book a strategy call with Muhyo Tech to discuss your website, web app, dashboard, SEO, or software project.",
  alternates: { canonical: buildCanonical("/book-a-call") },
  openGraph: {
    url: buildCanonical("/book-a-call"),
    images: [{ url: getSeoImage("/contact-preview.png"), width: 1200, height: 630, alt: "Book a website development call with Muhyo Tech" }],
  },
  twitter: { card: "summary_large_image", images: [getSeoImage("/contact-preview.png")] },
};

export default function BookCallPage() {
  return <BookCallClient />;
}
