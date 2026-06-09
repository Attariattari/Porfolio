import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";

// Import Controllers for Professional Data Fetching
import { SkillController } from "@/controllers/SkillController";
import { ServiceController } from "@/controllers/ServiceController";
import { ProjectController } from "@/controllers/ProjectController";
import { BlogController } from "@/controllers/BlogController";
import { AboutController } from "@/controllers/AboutController";
import { HeroController } from "@/controllers/HeroController";
import { resolveFeaturedBlogs } from "@/lib/blogUtils";

// ISR (Incremental Static Regeneration) - High Speed
export const revalidate = 3600;

export const metadata = {
  title: "Full Stack Web Developer | Muhyo Tech",
  description:
    "Crafting scalable web applications and premium digital experiences. Specialist in Next.js, React, Node.js, and modern architecture.",
};

export default async function HomePage() {
  // Fetch real-time data from Mainframe (MongoDB)
  const [dbSkills, dbServices, dbProjects, dbBlogs, dbAbout, dbHero] =
    await Promise.all([
      SkillController.getAll().catch(() => []),
      ServiceController.getAll(true).catch(() => []),
      ProjectController.getAll(true).catch(() => []),
      BlogController.getAll(true).catch(() => []),
      AboutController.get().catch(() => null),
      HeroController.get().catch(() => null),
    ]);

  // IMPORTANT: Serialize Mongoose documents to plain objects for React serialization
  // Serialize and check for DB content
  const skills =
    (dbSkills?.length > 0 ? serializeDoc(dbSkills) : null) ||
    portfolioData.skills;
  // --- FEATURED CONTENT PATCH (STRICT PRIORITY: DB > data.js) ---
  // 1. SERVICES: Check DB featured first, fallback to data.js featured
  const dbFeaturedServices = (dbServices || []).filter(
    (s) => s.featured && s.publishStatus === "published" && !s._isFromDataJs,
  );
  const services =
    dbFeaturedServices.length > 0
      ? dbFeaturedServices
      : portfolioData.services.filter((s) => s.featured);

  // 2. PROJECTS: Check DB featured first, fallback to data.js featured
  const dbFeaturedProjects = (dbProjects || []).filter(
    (p) => p.featured && p.publishStatus === "published" && !p._isFromDataJs,
  );
  const projects =
    dbFeaturedProjects.length > 0
      ? dbFeaturedProjects
      : portfolioData.projects.filter((p) => p.featured);

  // 3. BLOGS: Use optimized resolver
  const blogs = resolveFeaturedBlogs(dbBlogs, portfolioData.blogs);
  // --- END FEATURED PATCH ---

  // Ensure about data prioritizes database - NO EARLY FALLBACK
  const serializedAbout = dbAbout ? serializeDoc(dbAbout) : null;
  const about =
    serializedAbout && serializedAbout.name ? serializedAbout : null;

  // Ensure hero data prioritizes database
  const serializedHero = dbHero ? serializeDoc(dbHero) : null;
  const hero =
    serializedHero && serializedHero.description ? serializedHero : null;

  return (
    <>
      <Hero initialData={hero} />
      <About data={about} isHomePage={true} />
      <Skills data={skills} />
      <Services data={services} showViewAll={true} />
      <Projects data={projects} showViewAll={true} />
      <Blog data={blogs} isHomePage={true} />
      <Contact isHomePage={true} about={about} />
    </>
  );
}
