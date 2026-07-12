import { buildCanonical, getSeoImage } from "@/lib/seo";

export const metadata = {
  title: "Terms of Service | Muhyo Tech",
  description:
    "Read Muhyo Tech's Terms of Service. Strategic framework governing the technical collaboration and professional engagement at Muhyo Tech.",
  alternates: { canonical: buildCanonical("/terms") },
  openGraph: {
    title: "Terms of Service | Muhyo Tech - Terms Engagement",
    description:
      "Strategic framework governing the technical collaboration and professional engagement at Muhyo Tech.",
    url: buildCanonical("/terms"),
    images: [{ url: getSeoImage("/terms-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech Terms of Service" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Muhyo Tech",
    description: "Strategic framework governing the technical collaboration and professional engagement at Muhyo Tech.",
    images: [getSeoImage("/terms-preview.png")],
  },
};

export default function TermsLayout({ children }) {
  return children;
}
