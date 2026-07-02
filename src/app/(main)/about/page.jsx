import About from "@/components/About";
import { portfolioData } from "@/lib/data";
import { AboutController } from "@/controllers/AboutController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, getSeoImage } from "@/lib/seo";

export const metadata = {
  title: "About Me | Muhyo Tech - Software Engineer",
  description:
    "Learn about the mission, expertise, and journey of Muhyo Tech, a dedicated full-stack developer building impactful digital products.",
  alternates: { canonical: buildCanonical("/about") },
};

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
  const about = serializedAbout || portfolioData.about;

  return (
    <div className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <About data={about} />
    </div>
  );
}
