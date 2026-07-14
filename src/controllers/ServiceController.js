import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Service from "@/models/Service";
import { servicesSeedData } from "@/data/services.seed";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { cacheManager, withCache } from "@/lib/cache";
import { ensureMuhyoTechAlt, getServiceMediaAlt } from "@/lib/mediaAlt";

const QUOTE_NOTE =
  "Pricing depends on project requirements, features, timeline, and scope. Book a call to discuss your project and receive a custom quote.";

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : item?.name || item?.title || ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const toObjectArray = (value, fallbackDescription = "") => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(",");
  return list
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        const title = item.trim();
        return title ? { title, description: fallbackDescription } : null;
      }
      return item;
    })
    .filter(Boolean);
};

export const normalizeServiceData = (service = {}) => {
  const slug = service.slug || slugify(service.title);
  const status = service.status || service.publishStatus || "published";
  const heroImage =
    service.heroImage || service.banner || service.image || service.images?.[0] || "";
  const shortDescription = service.shortDescription || service.description || "";
  const technologies = service.technologies?.length
    ? service.technologies
    : toStringArray(service.techStack);
  const techStack = toStringArray(technologies).length
    ? toStringArray(technologies)
    : toStringArray(service.techStack);
  const problemsSolved = toObjectArray(service.problemsSolved).length
    ? toObjectArray(service.problemsSolved)
    : service.problemSolved
      ? [{ title: "Business challenge", description: service.problemSolved }]
      : [];
  const processSteps = toObjectArray(service.processSteps).length
    ? service.processSteps.map((step, index) => ({
        step: step.step || index + 1,
        title: step.title || `Step ${index + 1}`,
        description: step.description || "",
      }))
    : toObjectArray(service.process).map((step, index) => ({
        step: index + 1,
        title: step.title || `Step ${index + 1}`,
        description: step.description || "",
      }));
  const faqs = service.faqs?.length ? service.faqs : service.faq || [];
  const targetKeywords = toStringArray(service.targetKeywords).length
    ? toStringArray(service.targetKeywords)
    : toStringArray(service.keywords);
  const localKeywords = toStringArray(service.localKeywords);
  const relatedServices = toStringArray(service.relatedServices);
  const images = Array.isArray(service.images) ? service.images : [];

  return {
    ...service,
    slug,
    shortDescription,
    description: shortDescription,
    heroImage,
    heroImageAlt: getServiceMediaAlt(service),
    imageAlts: images.map((_, index) =>
      ensureMuhyoTechAlt(
        service.imageAlts?.[index],
        `${service.title || "web development"} service image ${index + 1}`,
      ),
    ),
    banner: heroImage,
    image: heroImage,
    overview: service.overview || service.fullDescription || service.description || shortDescription,
    fullDescription: service.fullDescription || service.overview || service.description || shortDescription,
    problemsSolved,
    problemSolved: service.problemSolved || problemsSolved[0]?.description || shortDescription,
    deliverables: toObjectArray(service.deliverables),
    features: toObjectArray(service.features),
    benefits: toObjectArray(service.benefits),
    processSteps,
    process: processSteps.map(({ title, description }) => ({ title, description })),
    technologies,
    techStack,
    clientRequirements: service.clientRequirements || [],
    relatedProjects: service.relatedProjects || [],
    relatedServices,
    faqs,
    faq: faqs,
    quoteNote: service.quoteNote || QUOTE_NOTE,
    status,
    publishStatus: status,
    isFeatured: Boolean(service.isFeatured ?? service.featured),
    featured: Boolean(service.featured ?? service.isFeatured),
    sortOrder: Number(service.sortOrder ?? service.order ?? 0),
    order: Number(service.order ?? service.sortOrder ?? 0),
    keywords: toStringArray(service.keywords),
    targetKeywords,
    localKeywords,
  };
};

const mergeMissing = (existing, incoming) => {
  const merged = { ...incoming };

  for (const [key, value] of Object.entries(existing || {})) {
    const existingHasValue =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0);

    if (existingHasValue) {
      merged[key] = value;
    }
  }

  return {
    ...merged,
    slug: incoming.slug || existing.slug,
    updatedAt: new Date(),
  };
};

const invalidateServices = async () => {
  await Promise.all([
    cacheManager.invalidateByTag("services"),
    cacheManager.invalidateByTag("public:services"),
    cacheManager.invalidateByTag("admin:services:list"),
  ]).catch(() => {});
};

const stripImportOnlyFields = (service) => {
  const cleaned = { ...service };
  delete cleaned.id;
  delete cleaned.legacySlugs;
  delete cleaned._isFromDataJs;
  delete cleaned._dbId;
  return cleaned;
};

const uniqueServicesBySlug = (services = []) => {
  const seen = new Set();
  return services.filter((service) => {
    const key = service.slug || service._id || service.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getCanonicalSeedService = (slug = "") =>
  servicesSeedData.find(
    (service) =>
      service.slug === slug ||
      (Array.isArray(service.legacySlugs) && service.legacySlugs.includes(slug)),
  );

const canonicalizePublicService = (service = {}) => {
  const normalized = normalizeServiceData(service);
  const canonicalSeedService = getCanonicalSeedService(normalized.slug);

  if (!canonicalSeedService || canonicalSeedService.slug === normalized.slug) {
    return normalized;
  }

  return {
    ...normalizeServiceData(canonicalSeedService),
    _dbId: normalized._id || normalized._dbId || null,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
};

export const ServiceController = {
  async getAll(filterPublished = false) {
    const cacheKey = filterPublished ? "services:list:published" : "admin:services:list";

    try {
      return await withCache(
        cacheKey,
        async () => {
          await dbConnect();
          const query = filterPublished
            ? {
                $or: [
                  { status: "published" },
                  { publishStatus: "published" },
                  { status: { $exists: false }, publishStatus: { $exists: false } },
                ],
              }
            : {};

          const dbServices = await Service.find(query)
            .sort({ sortOrder: 1, order: 1, isFeatured: -1, featured: -1, createdAt: -1 })
            .lean();

          if (!filterPublished && dbServices.length > 0) {
            return uniqueServicesBySlug(serializeDoc(dbServices).map(normalizeServiceData));
          }

          const normalizedDbServices = serializeDoc(dbServices).map(
            canonicalizePublicService,
          );
          const uploadedSlugs = new Set(
            normalizedDbServices.map((service) => service.slug),
          );
          const fallbackServices = servicesSeedData
            .filter((service) => !uploadedSlugs.has(service.slug))
            .map((service) => ({
              ...normalizeServiceData(service),
              _isFromDataJs: true,
              _dbId: null,
              publishStatus: "published",
              status: "published",
            }));

          return uniqueServicesBySlug([
            ...normalizedDbServices,
            ...fallbackServices,
          ]);
        },
        300,
        ["services", filterPublished ? "public:services" : "admin:services:list"],
      );
    } catch (error) {
      console.error("[ServiceController.getAll] Error:", error);
      return servicesSeedData.map((service) => ({
        ...normalizeServiceData(service),
        _isFromDataJs: true,
      }));
    }
  },

  async getOne(identifier) {
    const cacheKey = `services:detail:${identifier}`;
    const fallbackService = servicesSeedData.find(
      (service) => service.id?.toString() === identifier || service.slug === identifier,
    );

    try {
      return await withCache(
        cacheKey,
        async () => {
          await dbConnect();

          const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
          const query = {
            $or: [{ slug: identifier }, ...(isObjectId ? [{ _id: identifier }] : [])],
          };

          const service = await Service.findOne(query).lean();

          if (service) {
            const normalized = normalizeServiceData(serializeDoc(service));
            if (normalized.status !== "published" && normalized.publishStatus !== "published") {
              return null;
            }
            return normalized;
          }

          if (fallbackService) {
            return {
              ...normalizeServiceData(fallbackService),
              _isFromDataJs: true,
              publishStatus: "published",
              status: "published",
            };
          }

          return null;
        },
        900,
        ["services", "public:services"],
      );
    } catch (error) {
      console.error(`[ServiceController.getOne] Error for ${identifier}:`, error.message);

      if (fallbackService) {
        return {
          ...normalizeServiceData(fallbackService),
          _isFromDataJs: true,
          publishStatus: "published",
          status: "published",
        };
      }

      return null;
    }
  },

  async getById(id) {
    return await ServiceController.getOne(id);
  },

  async create(data) {
    try {
      await dbConnect();
      const normalized = normalizeServiceData(data);
      const existing = await Service.findOne({ slug: normalized.slug }).lean();

      if (existing) {
        normalized.heroImageAlt = getServiceMediaAlt({
          ...normalized,
          heroImageAlt: data.heroImageAlt || existing.heroImageAlt,
        });
        normalized.imageAlts = data.imageAlts || existing.imageAlts || [];
        const updated = await Service.findByIdAndUpdate(
          existing._id,
          { ...normalized, updatedAt: new Date() },
          {
            new: true,
            runValidators: true,
          },
        ).lean();
        const serialized = normalizeServiceData(serializeDoc(updated));

        emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
        emitSocketEvent("service:updated", serialized);
        emitSocketEvent("public-data:updated", { type: "service" });
        await invalidateServices();

        return serialized;
      }

      const savedService = await Service.create(normalized);
      const serialized = normalizeServiceData(serializeDoc(savedService));

      sendNewsletterEmail("service", savedService).catch((err) => {
        console.error("[ServiceController] Newsletter dispatch failure:", err);
      });
      emitSocketEvent(SOCKET_EVENTS.NEW_SERVICE, serialized);
      emitSocketEvent("service:created", serialized);
      emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
      emitSocketEvent("public-data:updated", { type: "service" });
      await invalidateServices();

      return serialized;
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  },

  async update(id, data) {
    try {
      await dbConnect();
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { slug: id };
      const existing = await Service.findOne(query).lean();
      if (!existing) return null;
      const normalized = normalizeServiceData({
        ...data,
        heroImageAlt: data.heroImageAlt || existing.heroImageAlt,
        imageAlts: data.imageAlts || existing.imageAlts,
      });
      const updated = await Service.findOneAndUpdate(query, normalized, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updated) return null;

      const serialized = normalizeServiceData(serializeDoc(updated));
      emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
      emitSocketEvent("service:updated", serialized);
      emitSocketEvent("public-data:updated", { type: "service" });
      await invalidateServices();
      return serialized;
    } catch (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  },

  async deleteOne(id) {
    try {
      await dbConnect();
      const deleted = await Service.findByIdAndDelete(id).lean();
      if (deleted) {
        emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
        emitSocketEvent("public-data:updated", { type: "service" });
        await invalidateServices();
      }
      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  },

  async deleteAll() {
    try {
      await dbConnect();
      const result = await Service.deleteMany({});
      emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
      emitSocketEvent("public-data:updated", { type: "service" });
      await invalidateServices();
      return result;
    } catch (error) {
      throw new Error(`Failed to clear services: ${error.message}`);
    }
  },

  async reorder(ids) {
    try {
      await dbConnect();

      const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length === 0) return { success: true };

      const bulkOps = validIds.map((id, index) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) },
          update: { $set: { order: Number(index), sortOrder: Number(index) } },
        },
      }));

      await Service.collection.bulkWrite(bulkOps);

      emitSocketEvent(SOCKET_EVENTS.SERVICES_REORDERED);
      emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
      emitSocketEvent("public-data:updated", { type: "service" });
      await invalidateServices();
      return true;
    } catch (error) {
      throw new Error(`Failed to reorder services: ${error.message}`);
    }
  },

  async importFromSeed({ mode = "safe" } = {}) {
    await dbConnect();

    const summary = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      items: [],
    };

    for (const seedService of servicesSeedData) {
      try {
        const normalized = normalizeServiceData(seedService);
        if (!normalized.slug || !normalized.title) {
          summary.skipped += 1;
          summary.items.push({
            title: normalized.title || "Untitled service",
            status: "skipped",
            reason: "Missing title or slug",
          });
          continue;
        }

        const lookupSlugs = [
          normalized.slug,
          ...(Array.isArray(normalized.legacySlugs) ? normalized.legacySlugs : []),
        ].filter(Boolean);
        const existing = await Service.findOne({ slug: { $in: lookupSlugs } }).lean();
        if (existing) {
          const updateData = stripImportOnlyFields(
            mode === "force" ? normalized : mergeMissing(existing, normalized),
          );
          if (existing.slug && existing.slug !== normalized.slug) {
            updateData.slug = existing.slug;
          }
          delete updateData._id;
          delete updateData.createdAt;

          await Service.updateOne(
            { _id: existing._id },
            { $set: { ...updateData, updatedAt: new Date() } },
            { runValidators: true },
          );
          summary.updated += 1;
          summary.items.push({ slug: normalized.slug, title: normalized.title, status: "updated" });
        } else {
          await Service.create(stripImportOnlyFields(normalized));
          summary.created += 1;
          summary.items.push({ slug: normalized.slug, title: normalized.title, status: "created" });
        }
      } catch (error) {
        summary.errors += 1;
        summary.items.push({
          slug: seedService.slug,
          title: seedService.title,
          status: "error",
          reason: error.message,
        });
      }
    }

    await invalidateServices();
    emitSocketEvent("services:imported", summary);
    emitSocketEvent("public-data:updated", { type: "service" });
    emitSocketEvent("cache:invalidated", {
      tags: ["services", "public:services", "admin:services:list"],
    });

    return summary;
  },
};
