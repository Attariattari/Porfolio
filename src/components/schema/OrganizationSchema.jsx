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
  let schema;

  try {
    await dbConnect();

    // Fetch site configuration and social links
    let config = await SiteConfig.findOne();

    // Fallback to defaults if no config exists
    if (!config) {
      config = {
        siteTitle: "Muhyo Tech",
        adminName: "Pir Ghulam Muhyo Din",
        location: "Chota, Mohlanwal Road, Badu Pura Chung, Lahore, 53720, Pakistan",
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

    const address = {
      "@type": "PostalAddress",
      streetAddress: "Chota, Mohlanwal Road, Badu Pura Chung",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      postalCode: "53720",
      addressCountry: "PK",
    };

    // Organization and LocalBusiness JSON-LD Structure
    const organizationSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: config.siteTitle || "Muhyo Tech",
          alternateName: "Muhyo Tech",
          url: SITE_URL,
          email: config.email || "MuhyoTech@gmail.com",
          logo: getSeoImage("/logo.png"),
          image: getSeoImage("/home-preview.png"),
          description:
            config.seo?.description ||
            "Full-stack web development, Next.js websites, admin dashboards, and scalable digital solutions.",
          sameAs: sameAsProfiles,
          address,
          founder: {
            "@type": "Person",
            name: config.adminName || "Pir Ghulam Muhyo Din",
            url: SITE_URL,
            jobTitle: "Founder & Lead Developer",
          },
          foundingDate: "2023",
          foundingLocation: config.location || "Lahore, Pakistan",
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
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: config.siteTitle || "Muhyo Tech",
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "LocalBusiness",
          "@id": `${SITE_URL}/#localbusiness`,
          name: "Muhyo Tech",
          url: SITE_URL,
          image: getSeoImage("/home-preview.png"),
          logo: getSeoImage("/logo.png"),
          telephone: "+92-322-4458481",
          email: config.email || "MuhyoTech@gmail.com",
          location: config.location || "Lahore, Punjab, Pakistan",
          address,
          areaServed: ["Lahore", "Pakistan"],
          priceRange: "$$",
          parentOrganization: {
            "@id": `${SITE_URL}/#organization`,
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+92-322-4458481",
            contactType: "Project inquiries",
            areaServed: "PK",
            availableLanguage: ["en", "ur"],
          },
          makesOffer: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Full Stack Web Development",
                description: "Custom web application development with modern technologies.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Next.js Website Development",
                description: "Modern websites, dashboards, and SEO-ready web applications.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Admin Dashboard Development",
                description: "Business dashboards, content management tools, and backend workflows.",
              },
            },
          ],
        },
      ],
    };

    schema = organizationSchema;
  } catch (error) {
    if (error.message?.includes("querySrv")) {
      console.warn("[OrganizationSchema] Warning: Database connection failed (querySrv), using minimal schema.");
    } else {
      console.error("[OrganizationSchema] Error:", error.message);
    }
    const fallbackGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "Muhyo Tech",
          url: SITE_URL,
          email: "MuhyoTech@gmail.com",
          logo: getSeoImage("/logo.png"),
          telephone: "+92 322 4458481",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Chota, Mohlanwal Road, Badu Pura Chung",
            addressLocality: "Lahore",
            addressRegion: "Punjab",
            postalCode: "53720",
            addressCountry: "PK",
          },
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: "Muhyo Tech",
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "ProfessionalService",
          "@id": `${SITE_URL}/#localbusiness`,
          name: "Muhyo Tech",
          url: SITE_URL,
          logo: getSeoImage("/logo.png"),
          image: getSeoImage("/home-preview.png"),
          telephone: "+92 322 4458481",
          email: "MuhyoTech@gmail.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Chota, Mohlanwal Road, Badu Pura Chung",
            addressLocality: "Lahore",
            addressRegion: "Punjab",
            postalCode: "53720",
            addressCountry: "PK",
          },
          areaServed: ["Lahore", "Pakistan"],
          parentOrganization: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
      ],
    };

    schema = fallbackGraph;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
