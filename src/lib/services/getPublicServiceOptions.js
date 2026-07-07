import { ServiceController } from "@/controllers/ServiceController";

const isPublished = (service = {}) => {
  const status = service.status || service.publishStatus || "published";
  return status === "published";
};

const toSafeOption = (service = {}) => {
  const slug = service.slug || service._id?.toString?.() || "";
  const title = service.title || "";

  if (!slug || !title) return null;

  return {
    title,
    slug,
    category: service.category || "",
  };
};

export async function getPublicServiceOptions() {
  const services = await ServiceController.getAll(true);
  const seen = new Set();

  return services
    .filter(isPublished)
    .map(toSafeOption)
    .filter(Boolean)
    .filter((service) => {
      if (seen.has(service.slug)) return false;
      seen.add(service.slug);
      return true;
    });
}

export async function findPublicServiceOption(value) {
  if (!value) return null;
  const options = await getPublicServiceOptions();
  return options.find((service) => service.slug === value) || null;
}
