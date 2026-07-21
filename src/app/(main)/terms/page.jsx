import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { termsDocument } from "@/lib/data";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the Muhyo Tech website, project inquiries, software services, content, and professional engagements.",
  alternates: { canonical: "/terms" },
  keywords: [
    "Muhyo Tech terms of service",
    "website development terms",
    "software services terms",
    "Muhyo Tech Lahore",
  ],
  openGraph: {
    title: "Terms of Service | Muhyo Tech",
    description:
      "Clear terms for using the Muhyo Tech website and discussing professional software and web-development services.",
    url: "https://www.muhyotech.com/terms",
    siteName: "Muhyo Tech",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Muhyo Tech",
    description: "Website-use and professional-engagement terms for Muhyo Tech.",
  },
  robots: { index: true, follow: true },
};



export default function TermsPage() {
  return <LegalDocumentPage document={termsDocument} />;
}
