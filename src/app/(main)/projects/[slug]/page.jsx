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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://muhyo-tech.vercel.app";
  const canonicalUrl = baseUrl + "/projects/" + project.slug;

  return {
    title: `${project.title} | Muhyo Tech Project`,
    description: project.description,
    keywords:
      (project.techStack || []).join(", ") || "Web Development, Engineering",
    canonical: canonicalUrl,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image || project.thumbnail],
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
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

  // P3 SEO: Add comprehensive JSON-LD schema for projects
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://muhyo-tech.vercel.app";
  const canonicalUrl = baseUrl + "/projects/" + project.slug;

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    image: project.image || project.thumbnail,
    creator: {
      "@type": "Person",
      name: "Muhyo Tech",
      url: baseUrl,
    },
    programmingLanguage: project.techStack || [],
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <ProjectDetailView project={project} />
    </>
  );
}
