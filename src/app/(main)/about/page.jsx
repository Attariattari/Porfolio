import About from "@/components/About";
import { portfolioData } from "@/lib/data";
import { AboutController } from "@/controllers/AboutController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, ensureSeoDescription, getSeoImage } from "@/lib/seo";
import { getAboutPageData } from "@/lib/content/getAboutPageData";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

export async function generateMetadata() {
  const profile = await AboutController.get().catch(() => null);
  const title = profile?.seoTitle || "About Muhyo Tech | Full-Stack Developer in Lahore";
  const description = ensureSeoDescription(
    profile?.seoDescription,
    "Meet Pir Ghulam Muhyo Din, the full-stack developer behind Muhyo Tech, building Next.js websites, MERN applications, and business dashboards in Lahore.",
  );
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: buildCanonical("/about") },
    openGraph: {
      title,
      description,
      url: buildCanonical("/about"),
      images: [{ url: getSeoImage("/about-preview.png"), width: 1200, height: 630, alt: "Pir Ghulam Muhyo Din - Muhyo Tech founder and Full-Stack Web Developer" }],
      type: "profile",
    },
    twitter: { card: "summary_large_image", title, description, images: [getSeoImage("/about-preview.png")] },
  };
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#person`,
  name: "Pir Ghulam Muhyo Din",
  alternateName: "Muhyo Tech",
  url: buildCanonical("/about"),
  image: getSeoImage("/about-portrait-new.jpg"),
  sameAs: [
    "https://www.linkedin.com/in/ghulam-muhyo-din-web-designer/",
    "https://github.com/Attariattari",
    "https://x.com/GhulamMuhyo",
    "https://www.facebook.com/MuhammadMuhyoDinAttari",
  ],
  jobTitle: "Full Stack Web Developer",
  worksFor: {
    "@type": "Organization",
    name: "Muhyo Tech",
    url: SITE_URL,
  },
  description:
    "Specializing in Next.js, React, and Node.js with a focus on premium UI/UX.",
};

export default async function AboutPage() {
  // Professional Hybrid Fetching - IMPORTANT: Serialize Mongoose docs
  const dbAbout = await AboutController.get().catch(() => null);
  const serializedAbout = dbAbout ? serializeDoc(dbAbout) : null;
  const about = getAboutPageData(serializedAbout || portfolioData.about);

  return (
    <div className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "About", url: buildCanonical("/about") },
        ]}
      />
      <About data={about} />
    </div>
  );
}
