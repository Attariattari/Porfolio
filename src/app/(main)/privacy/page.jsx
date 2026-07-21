import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { getSeoImage } from "@/lib/seo";
import { privacyDocument } from "@/lib/data";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Muhyo Tech collects, uses, protects, retains, and shares information across its website, forms, bookings, newsletter, and analytics.",
  alternates: { canonical: "/privacy" },
  keywords: [
    "Muhyo Tech privacy policy",
    "website privacy policy",
    "data protection Muhyo Tech",
    "Muhyo Tech Lahore",
  ],
  openGraph: {
    title: "Privacy Policy | Muhyo Tech",
    description:
      "Learn how Muhyo Tech handles website, inquiry, booking, newsletter, analytics, and uploaded-media information.",
    url: "https://www.muhyotech.com/privacy",
    siteName: "Muhyo Tech",
    type: "website",
    images: [{ url: getSeoImage("/privacy-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech privacy policy" }],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Muhyo Tech",
    description: "Clear information about privacy, data use, security, retention, and your choices at Muhyo Tech.",
    images: [getSeoImage("/privacy-preview.png")],
  },
  robots: { index: true, follow: true },
};



export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyDocument} />;
}
