import { notFound } from "next/navigation";
import { ProjectController } from "@/controllers/ProjectController";
import ProjectDetailView from "@/components/ProjectDetailView";
import { serializeDoc } from "@/lib/mongooseHelper";

// 1. Enable ISR (Revalidate every hour)
export const revalidate = 3600;

// 2. Pre-render all existing projects at build time
export async function generateStaticParams() {
  const projects = await ProjectController.getAll(true);
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await ProjectController.getOne(slug);

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Muhyo Tech Project`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image || project.thumbnail],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await ProjectController.getOne(slug);

  if (!project) {
    notFound();
  }

  // Project is already serialized by the controller
  return <ProjectDetailView project={project} />;
}

