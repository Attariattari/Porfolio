import Portfolio from "@/components/Portfolio";
import { portfolioData } from "@/lib/data";
import { ProjectController } from "@/controllers/ProjectController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { buildCanonical, getSeoImage } from "@/lib/seo";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal cache hit rate
export const revalidate = 300;

export const metadata = {
  title: "Engineering Portfolio | Featured Projects by Muhyo Tech",
  description:
    "Explore Muhyo Tech projects including high-performance websites, SaaS dashboards, admin systems, real estate platforms, and custom web applications.",
  alternates: { canonical: buildCanonical("/projects") },
  openGraph: {
    title: "Muhyo Tech Projects - Web Apps, SaaS Dashboards & Platforms",
    description:
      "A curated portfolio of high-performance websites, SaaS dashboards, admin systems, and custom web applications.",
    url: buildCanonical("/projects"),
    images: [{ url: getSeoImage("/portfolio-hero.png"), width: 1200, height: 630, alt: "Muhyo Tech projects" }],
    type: "website",
  },
};

export default async function ProjectsPage() {
  // Get merged projects: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbProjects = await ProjectController.getAll(true).catch(() => []);
  const projects =
    (dbProjects?.length > 0 ? serializeDoc(dbProjects) : null) ||
    portfolioData.projects;

  return <Portfolio projects={projects} />;
}
