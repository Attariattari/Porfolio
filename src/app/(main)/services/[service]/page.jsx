import { notFound } from "next/navigation";
import { ServiceController } from "@/controllers/ServiceController";
import { ProjectController } from "@/controllers/ProjectController";
import ServiceDetailClient from "./ServiceDetailClient";

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item : item?.name || item?.title || "",
      )
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const getRelatedProjects = async (service) => {
  const projects = await ProjectController.getAll(true).catch(() => []);
  const explicitRelated = normalizeArray(service.relatedProjects);
  const serviceTech = normalizeArray(service.technologies).length
    ? normalizeArray(service.technologies)
    : normalizeArray(service.techStack);
  const serviceCategory = String(service.category || service.slug || "")
    .toLowerCase()
    .replace(/-/g, " ");

  const scoreProject = (project) => {
    const projectKey = String(project.slug || project._id || project.title);
    const explicitScore = explicitRelated.includes(projectKey) ? 20 : 0;
    const categoryScore =
      serviceCategory &&
      [project.category, project.purpose, project.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(serviceCategory))
        ? 6
        : 0;
    const techScore = normalizeArray(project.techStack).filter((tech) =>
      serviceTech.some(
        (serviceTechItem) =>
          String(serviceTechItem).toLowerCase() === String(tech).toLowerCase(),
      ),
    ).length;

    return explicitScore + categoryScore + techScore;
  };

  return projects
    .map((project) => ({ project, score: scoreProject(project) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ project }) => project);
};

const getRelatedServices = async (service) => {
  const relatedSlugs = normalizeArray(service.relatedServices);
  if (relatedSlugs.length === 0) return [];

  const services = await ServiceController.getAll(true).catch(() => []);
  const relatedSet = new Set(relatedSlugs);

  return services
    .filter((item) => relatedSet.has(item.slug) && item.slug !== service.slug)
    .sort(
      (a, b) =>
        relatedSlugs.indexOf(a.slug) - relatedSlugs.indexOf(b.slug),
    )
    .slice(0, 4);
};

export default async function ServiceDetailPage({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) {
    notFound();
  }

  const [relatedProjects, relatedServices] = await Promise.all([
    getRelatedProjects(service),
    getRelatedServices(service),
  ]);

  return (
    <ServiceDetailClient
      service={service}
      relatedProjects={relatedProjects}
      relatedServices={relatedServices}
    />
  );
}
