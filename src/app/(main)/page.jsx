import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import HomeFinalCTA from "@/components/HomeFinalCTA";
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
import { buildCanonical, getSeoImage } from "@/lib/seo";
import { getCanonicalServices } from "@/lib/servicesSeo";
import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";
import { resolveHomeSeo } from "@/lib/homeSeo";
import { SITE_URL } from "@/lib/config";
import { getAboutPageData } from "@/lib/content/getAboutPageData";

const compactHomeService = (service = {}) => ({
  _id: service._id,
  id: service.id,
  slug: service.slug,
  title: service.title,
  shortDescription: service.shortDescription,
  description: service.description,
  problemSolved: service.problemSolved,
  heroImage: service.heroImage,
  banner: service.banner,
  image: service.image,
  heroImageAlt: service.heroImageAlt,
  imageAlt: service.imageAlt,
  benefits: service.benefits,
  techStack: service.techStack?.slice?.(0, 4) || service.techStack,
  technologies: service.technologies?.slice?.(0, 4) || service.technologies,
});

const compactHomeProject = (project = {}) => ({
  _id: project._id,
  id: project.id,
  slug: project.slug,
  title: project.title,
  category: project.category,
  description: project.description,
  techStack: project.techStack?.slice?.(0, 4) || project.techStack,
  thumbnail: project.thumbnail,
  thumbnailImage: project.thumbnailImage,
  image: project.image,
  thumbnailAlt: project.thumbnailAlt,
  imageAlt: project.imageAlt,
  heroImageAlt: project.heroImageAlt,
  demoLink: project.demoLink,
  githubLink: project.githubLink,
});

const compactHomeBlog = (blog = {}) => ({
  _id: blog._id,
  id: blog.id,
  slug: blog.slug,
  title: blog.title,
  summary: blog.summary,
  image: blog.image,
  featuredImage: blog.featuredImage
    ? { url: blog.featuredImage.url, alt: blog.featuredImage.alt }
    : undefined,
  featured: blog.featured,
  category: blog.category,
  date: blog.date,
  readTime: blog.readTime,
  author: blog.author,
  tags: blog.tags,
  publishStatus: blog.publishStatus,
});

const compactHomeAbout = (about = {}) => ({
  name: about.name,
  avatarAlt: about.avatarAlt,
  typewriterWords: about.typewriterWords,
  hero: {
    badge: about.hero?.badge,
    title: about.hero?.title,
    headline: about.hero?.headline,
    description: about.hero?.description,
    image: about.hero?.image,
    imageAlt: about.hero?.imageAlt,
    highlights: about.hero?.highlights,
    ctas: about.hero?.ctas,
  },
});

// ISR (Incremental Static Regeneration) - High Speed
export const revalidate = 3600;

export async function generateMetadata() {
  let configuredSeo = null;
  try {
    await dbConnect();
    configuredSeo = await SiteConfig.findOne({}).select("seo siteTitle").lean();
  } catch {}

  const { title, description } = resolveHomeSeo(configuredSeo?.seo);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: buildCanonical("/") },
    openGraph: {
      title,
      description,
      url: buildCanonical("/"),
      siteName: configuredSeo?.siteTitle || "Muhyo Tech",
      images: [{ url: getSeoImage("/home-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech full-stack web development portfolio" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getSeoImage("/home-preview.png")],
    },
    keywords: [
      "full-stack web developer Lahore",
      "Next.js development Pakistan",
      "MERN web applications",
      "admin dashboard development",
    ],
    authors: [{ name: "Pir Ghulam Muhyo Din", url: SITE_URL }],
    creator: "Pir Ghulam Muhyo Din",
    publisher: "Muhyo Tech",
    robots: { index: true, follow: true },
  };
}

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
  const services = getCanonicalServices(
    dbFeaturedServices.length > 0
      ? dbFeaturedServices
      : portfolioData.services.filter((s) => s.featured),
  );
  const homeServices = services.slice(0, 3).map(compactHomeService);

  // 2. PROJECTS: Check DB featured first, fallback to data.js featured
  const dbFeaturedProjects = (dbProjects || []).filter(
    (p) => p.featured && p.publishStatus === "published" && !p._isFromDataJs,
  );
  const projects =
    dbFeaturedProjects.length > 0
      ? dbFeaturedProjects
      : portfolioData.projects.filter((p) => p.featured);
  const homeProjects = projects.slice(0, 4).map(compactHomeProject);

  // 3. BLOGS: Use optimized resolver
  const blogs = resolveFeaturedBlogs(dbBlogs, portfolioData.blogs);
  const homeBlogs = blogs.slice(0, 3).map(compactHomeBlog);
  // --- END FEATURED PATCH ---

  // Ensure about data prioritizes database - NO EARLY FALLBACK
  const serializedAbout = dbAbout ? serializeDoc(dbAbout) : null;
  const about = getAboutPageData(
    serializedAbout && serializedAbout.name
      ? serializedAbout
      : portfolioData.about,
  );
  const homeAbout = compactHomeAbout(about);

  // Ensure hero data prioritizes database
  const serializedHero = dbHero ? serializeDoc(dbHero) : null;
  const hero =
    serializedHero && serializedHero.description ? serializedHero : null;

  return (
    <>
      <Hero initialData={hero} />
      <About data={homeAbout} isHomePage={true} />
      <Skills data={skills} />
      <Services data={homeServices} showViewAll={true} />
      <Projects data={homeProjects} showViewAll={true} />
      <Blog data={homeBlogs} isHomePage={true} />
      <Contact isHomePage={true} />
      <HomeFinalCTA />
    </>
  );
}
