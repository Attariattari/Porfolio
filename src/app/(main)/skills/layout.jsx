import { buildCanonical, getSeoImage } from "@/lib/seo";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata = {
  title: "Skills & Technology Expertise",
  description:
    "Explore Muhyo Tech expertise in Next.js, React, Node.js, MongoDB, APIs, responsive interfaces, and full-stack web application development.",
  alternates: { canonical: buildCanonical("/skills") },
  openGraph: {
    title: "Skills & Technology Expertise | Muhyo Tech",
    description:
      "Next.js, React, Node.js, MongoDB, API, and full-stack development expertise from Muhyo Tech.",
    url: buildCanonical("/skills"),
    images: [
      {
        url: getSeoImage("/home-preview.png"),
        width: 1200,
        height: 630,
        alt: "Muhyo Tech full-stack development skills",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills & Technology Expertise | Muhyo Tech",
    description:
      "Explore Muhyo Tech full-stack web development skills and technology expertise.",
    images: [getSeoImage("/home-preview.png")],
  },
};

export default function Layout({ children }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: buildCanonical("/") },
          { name: "Skills", url: buildCanonical("/skills") },
        ]}
      />
      {children}
    </>
  );
}
