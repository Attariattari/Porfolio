import { notFound } from "next/navigation";
import { ProjectController } from "@/controllers/ProjectController";
import ProjectDetailView from "@/components/ProjectDetailView";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, cleanSeoText, getSeoImage } from "@/lib/seo";

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

  const canonicalUrl = buildCanonical(`/projects/${project.slug}`);
  const description = cleanSeoText(project.description, 155);
  const image = getSeoImage(project.image || project.thumbnail);

  return {
    title: `${project.title} | Muhyo Tech Project`,
    description,
    keywords:
      (project.techStack || []).join(", ") || "Web Development, Engineering",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: project.title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: project.title }],
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [image],
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
  const baseUrl = SITE_URL;
  const canonicalUrl = buildCanonical(`/projects/${project.slug}`);
  const image = getSeoImage(project.image || project.thumbnail);

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: cleanSeoText(project.description, 155),
    image,
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
