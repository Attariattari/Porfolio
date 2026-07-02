import React from "react";
import Contact from "@/components/Contact";
import EditorialBackground from "@/components/ui/EditorialBackground";
import { buildCanonical } from "@/lib/seo";

export const metadata = {
  title: "Contact Muhyo Tech | Start Your Web Development Project",
  description:
    "Contact Muhyo Tech for Next.js websites, SaaS dashboards, backend systems, SEO optimization, and professional web development services.",
  alternates: { canonical: buildCanonical("/contact") },
};

/**
 * Main Contact Page
 * Serves as a high-end wrapper for the Contact component,
 * providing page-level layout, depth, and supplemental trust sections.
 */
export default function ContactPage({ isHomePage = false }) {
  return (
    <div className="min-h-screen relative overflow-hidden ">
      {!isHomePage && <EditorialBackground text="CONTACT" />}

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-[-10%] w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-floating" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px]  rounded-full blur-[130px] pointer-events-none -z-10 animate-floating [animation-delay:3s]" />

      <main className="max-w-7xl mx-auto relative z-10">
        <Contact />
      </main>

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
