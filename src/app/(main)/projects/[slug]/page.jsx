import { notFound } from "next/navigation";
import { ProjectController } from "@/controllers/ProjectController";
import ProjectDetailView from "@/components/ProjectDetailView";
import { serializeDoc } from "@/lib/mongooseHelper";
import { SITE_URL } from "@/lib/config";
import { buildCanonical, cleanSeoText, getSeoImage, removeBrandSuffix } from "@/lib/seo";
import { portfolioData } from "@/lib/data";

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

  if (!project || !["published", undefined, null].includes(project.publishStatus || project.status)) {
    return { title: "Project Not Found" };
  }

  const canonicalUrl = buildCanonical(`/projects/${project.slug}`);
  const description = cleanSeoText(project.seoDescription || project.shortDescription || project.description, 155);
  const image = getSeoImage(project.heroImage || project.thumbnailImage || project.image || project.thumbnail);

  return {
    title: removeBrandSuffix(project.seoTitle || project.title),
    description,
    keywords:
      (project.keywords || project.techStack || []).join(", ") || "Web Development, Engineering",
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
  const [project, allProjects] = await Promise.all([
    ProjectController.getOne(slug),
    ProjectController.getAll(true).catch(() => []),
  ]);

  if (!project || !["published", undefined, null].includes(project.publishStatus || project.status)) {
    notFound();
  }

  const serializedProjects = serializeDoc(allProjects || []);
  const relatedProjects = serializedProjects
    .filter((item) => item.slug && item.slug !== project.slug)
    .filter((item) => item.category === project.category || (item.techStack || []).some((tech) => (project.techStack || []).includes(tech)))
    .slice(0, 3);

  const relatedServices = (portfolioData.services || [])
    .filter((service) => (project.relatedServices || []).includes(service.slug))
    .slice(0, 3);

  const baseUrl = SITE_URL;
  const canonicalUrl = buildCanonical(`/projects/${project.slug}`);
  const image = getSeoImage(project.heroImage || project.thumbnailImage || project.image || project.thumbnail);

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: cleanSeoText(project.seoDescription || project.shortDescription || project.description, 155),
    image,
    creator: { "@id": `${baseUrl}/#organization` },
    about: (project.techStack || []).map((name) => ({ "@type": "Thing", name })),
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
      <ProjectDetailView
        project={project}
        relatedProjects={relatedProjects}
        relatedServices={relatedServices}
      />
    </>
  );
}
