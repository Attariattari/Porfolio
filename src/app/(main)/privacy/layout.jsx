import { buildCanonical, getSeoImage } from "@/lib/seo";

export const metadata = {
  title: "Privacy Policy | Muhyo Tech",
  description:
    "Read Muhyo Tech's Privacy Policy. High-fidelity data protection framework defining our digital integrity standards and how we handle your personal information.",
  alternates: { canonical: buildCanonical("/privacy") },
  openGraph: {
    title: "Privacy Policy | Muhyo Tech",
    description:
      "High-fidelity data protection framework defining the digital integrity standards at Muhyo Tech.",
    url: buildCanonical("/privacy"),
    images: [{ url: getSeoImage("/privacy-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech Privacy Policy" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Muhyo Tech",
    description: "High-fidelity data protection framework defining the digital integrity standards at Muhyo Tech.",
    images: [getSeoImage("/privacy-preview.png")],
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
