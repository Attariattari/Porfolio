/**
 * Organization JSON-LD Schema Component
 * Generates comprehensive organization schema for SEO validation
 * Used in Google Rich Results Test and search engine indexing
 */

import { SiteConfig } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { SITE_URL } from "@/lib/config";
import { getSeoImage } from "@/lib/seo";

export async function OrganizationSchema() {
  try {
    await dbConnect();

    // Fetch site configuration and social links
    let config = await SiteConfig.findOne();

    // Fallback to defaults if no config exists
    if (!config) {
      config = {
        siteTitle: "Muhyo Tech",
        adminName: "Pir Ghulam Muhyo Din",
        email: "attariattari549@gmail.com",
        location: "Lahore, Pakistan",
        seo: {
          description: "Full Stack Web Developer specializing in modern web applications",
        },
      };
    }

    // Build social profiles array
    const sameAsProfiles = [
      "https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/",
      "https://github.com/Attariattari",
      "https://x.com/GhulamMuhyo",
      "https://www.facebook.com/MuhammadMuhyoDinAttari",
      "https://wa.me/923224458481",
    ].filter(Boolean);

    // Organization JSON-LD Structure
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: config.siteTitle,
      alternateName: "Muhyo Tech",
      url: SITE_URL,
      logo: getSeoImage("/logo.png"),
      image: getSeoImage("/portfolio-hero.png"),
      description:
        config.seo?.description ||
        "Enterprise-grade full-stack web development and digital solutions",
      sameAs: sameAsProfiles,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+92-322-4458481",
        contactType: "Customer Service",
        email: config.email,
        areaServed: "PK",
        availableLanguage: ["en", "ur"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Lahore",
        addressRegion: "Punjab",
        postalCode: "54000",
        addressCountry: "PK",
        name: config.location,
      },
      founder: {
        "@type": "Person",
        name: config.adminName,
        url: SITE_URL,
        jobTitle: "Founder & Lead Developer",
        email: config.email,
      },
      foundingDate: "2023",
      foundingLocation: config.location,
      knowsAbout: [
        "Web Development",
        "Next.js",
        "React",
        "Node.js",
        "Full Stack Development",
        "Software Architecture",
        "Digital Solutions",
        "Cloud Infrastructure",
      ],
      services: [
        {
          "@type": "Service",
          name: "Full Stack Web Development",
          description: "Custom web application development with modern technologies",
        },
        {
          "@type": "Service",
          name: "UI/UX Design",
          description: "Professional user interface and experience design",
        },
        {
          "@type": "Service",
          name: "API Development",
          description: "RESTful and GraphQL API design and implementation",
        },
        {
          "@type": "Service",
          name: "Consulting",
          description: "Technical consulting and architecture planning",
        },
      ],
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    );
  } catch (error) {
    console.error("[OrganizationSchema] Error:", error.message);
    // Return minimal schema on error
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Muhyo Tech",
            url: SITE_URL,
            logo: getSeoImage("/logo.png"),
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+92-322-4458481",
              contactType: "Customer Service",
            },
          }),
        }}
      />
    );
  }
}
