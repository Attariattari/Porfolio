import React from "react";
import Contact from "@/components/Contact";
import EditorialBackground from "@/components/ui/EditorialBackground";
import { buildCanonical, getSeoImage } from "@/lib/seo";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export const metadata = {
  title: { absolute: "Contact Muhyo Tech | Start a Web Development Project" },
  description:
    "Contact Muhyo Tech for Next.js websites, SaaS dashboards, backend systems, SEO optimization, and professional web development services.",
  alternates: { canonical: buildCanonical("/contact") },
  openGraph: {
    title: "Contact Muhyo Tech | Let's Connect & Start a Project",
    description:
      "Have an idea or project requirement? Get in touch with Muhyo Tech. Usually replies within 24 hours.",
    url: buildCanonical("/contact"),
    images: [{ url: getSeoImage("/contact-preview.png"), width: 1200, height: 630, alt: "Contact Muhyo Tech - Let's Connect" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Muhyo Tech | Let's Connect",
    description: "Have an idea or project requirement? Contact Muhyo Tech. Usually replies within 24 hours.",
    images: [getSeoImage("/contact-preview.png")],
  },
};

/**
 * Main Contact Page
 * Serves as a high-end wrapper for the Contact component,
 * providing page-level layout, depth, and supplemental trust sections.
 */
export default function ContactPage({ isHomePage = false }) {
  return (
    <div className="min-h-screen relative overflow-hidden ">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: buildCanonical("/") },
          { name: "Contact", url: buildCanonical("/contact") },
        ]}
      />
      {!isHomePage && <EditorialBackground text="CONTACT" />}

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-[-10%] w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-floating" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px]  rounded-full blur-[130px] pointer-events-none -z-10 animate-floating [animation-delay:3s]" />

      <section className="max-w-7xl mx-auto relative z-10" aria-label="Contact Muhyo Tech">
        <Contact />
      </section>

      {/* Side Scroll / Status Tracker */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-5 z-50">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i === 0
                ? "bg-accent scale-150 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                : "bg-border opacity-50"
            } transition-all duration-700`}
          />
        ))}
      </div>
    </div>
  );
}
