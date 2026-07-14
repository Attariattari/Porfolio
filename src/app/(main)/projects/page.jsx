import Portfolio from "@/components/Portfolio";
import { portfolioData } from "@/lib/data";
import { ProjectController } from "@/controllers/ProjectController";
import { serializeDoc } from "@/lib/mongooseHelper";
import { buildCanonical, getSeoImage } from "@/lib/seo";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal cache hit rate
export const revalidate = 300;

export const metadata = {
  title: "Projects",
  description:
    "Explore Muhyo Tech projects including modern websites, full-stack applications, admin dashboards, and scalable solutions built with Next.js and MERN.",
  alternates: { canonical: buildCanonical("/projects") },
  openGraph: {
    title: "Projects | Muhyo Tech",
    description:
      "Modern websites, full-stack web applications, admin dashboards, and scalable digital solutions built by Muhyo Tech.",
    url: buildCanonical("/projects"),
    images: [{ url: getSeoImage("/projects-preview.png"), width: 1200, height: 630, alt: "Muhyo Tech - Engineering Modern Digital Products" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Muhyo Tech",
    description: "Explore high-performance web applications, scalable SaaS architectures, and digital products built by Muhyo Tech.",
    images: [getSeoImage("/projects-preview.png")],
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
