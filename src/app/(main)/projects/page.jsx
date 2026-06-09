import Portfolio from "@/components/Portfolio";
import { portfolioData } from "@/lib/data";
import { ProjectController } from "@/controllers/ProjectController";
import { serializeDoc } from "@/lib/mongooseHelper";

// P1 OPTIMIZATION: Enable ISR (Incremental Static Regeneration)
// Revalidate every 5 minutes for optimal cache hit rate
export const revalidate = 300;

export const metadata = {
  title: "Engineering Portfolio | Featured Projects by Muhyo Tech",
  description:
    "Explore a curated showcase of high-performance web applications, specialized tools, and creative digital engineering solutions.",
};

export default async function ProjectsPage() {
  // Get merged projects: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbProjects = await ProjectController.getAll(true).catch(() => []);
  const projects =
    (dbProjects?.length > 0 ? serializeDoc(dbProjects) : null) ||
    portfolioData.projects;

  return <Portfolio projects={projects} />;
}
