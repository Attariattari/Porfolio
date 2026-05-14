import About from "@/components/About";
import { portfolioData } from "@/lib/data";
import { AboutController } from "@/controllers/AboutController";
import { serializeDoc } from "@/lib/mongooseHelper";

export const metadata = {
  title: "About Me | Muhyo Tech - Software Engineer",
  description:
    "Learn about the mission, expertise, and journey of Muhyo Tech, a dedicated full-stack developer building impactful digital products.",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Muhyo Tech",
  url: "https://muhyo-tech.vercel.app/about",
  image: "https://muhyo-tech.vercel.app/logo.png",
  sameAs: [
    "https://github.com/muhyo-tech", // Assuming standard handles
    "https://linkedin.com/in/muhyo-tech",
  ],
  jobTitle: "Full Stack Web Developer",
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
