import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { Service } from "@/models/Portfolio";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { withCache } from "@/lib/cache";

/**
 * ServiceController
 * Optimized for production performance with lean queries and caching.
 */
export const ServiceController = {
    // 1. Get All Services - Optimized with lean(), caching, and efficient merge
    async getAll(filterPublished = false) {
        const cacheKey = `services_all_${filterPublished}`;
        
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();
                    const query = filterPublished ? { publishStatus: "published" } : {};

                    const dbServices = await Service.find(query)
                        .sort({ order: 1, featured: -1, createdAt: -1 })
                        .lean();

                    const uploadedTitles = new Set(dbServices.map((s) => s.title));
                    const fallbackServices = portfolioData.services
                        .filter((s) => !uploadedTitles.has(s.title))
                        .map((s) => ({
                            ...s,
                            _isFromDataJs: true,
                            _dbId: null,
                            publishStatus: "published",
                        }));

                    return [...serializeDoc(dbServices), ...fallbackServices];
                },
                300, // 5 minute cache
                ["services"]
            );
        } catch (error) {
            console.error("[ServiceController.getAll] Error:", error);
            return portfolioData.services.map((s) => ({ ...s, _isFromDataJs: true }));
        }
    },

    // 2. Get One Service (ID or SLUG) - Optimized with lean()
    async getOne(identifier) {
        const fallbackService = portfolioData.services.find(
            (s) => s.id?.toString() === identifier || s.slug === identifier,
        );

        try {
            await dbConnect();

            const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
            const query = {
                $or: [
                    { slug: identifier },
                    ...(isObjectId ? [{ _id: identifier }] : []),
                ],
            };

            const service = await Service.findOne(query).lean();

            if (service) return serializeDoc(service);

            // Fallback to static data
            if (fallbackService) {
                return {
                    ...fallbackService,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }

            return null;
        } catch (error) {
            console.error(
                `[ServiceController.getOne] Error for ${identifier}:`,
                error.message,
            );

            if (fallbackService) {
                return {
                    ...fallbackService,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }

            return null;
        }
    },

    // GET BY ID (Legacy)
    async getById(id) {
        return await ServiceController.getOne(id);
    },

    // 3. Create New Service
    async create(data) {
        try {
            await dbConnect();

            // Auto-generate slug if not present
            if (!data.slug && data.title) {
                data.slug = data.title
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/[\s_-]+/g, "-")
                    .replace(/^-+|-+$/g, "");
            }

            const savedService = await Service.create(data);
            const serialized = serializeDoc(savedService);

            // Background tasks
            sendNewsletterEmail("service", savedService).catch((err) => {
                console.error("[ServiceController] Newsletter dispatch failure:", err);
            });
            emitSocketEvent(SOCKET_EVENTS.NEW_SERVICE, serialized);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);

            return serialized;
        } catch (error) {
            throw new Error(`Failed to create service: ${error.message}`);
        }
    },

    // 4. Update Service
    async update(id, data) {
        try {
            await dbConnect();
            const updated = await Service.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).lean();

            if (!updated) return null;

            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return serializeDoc(updated);
        } catch (error) {
            throw new Error(`Failed to update service: ${error.message}`);
        }
    },

    // 5. Delete One Service
    async deleteOne(id) {
        try {
            await dbConnect();
            const deleted = await Service.findByIdAndDelete(id).lean();
            if (deleted) {
                emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            }
            return deleted;
        } catch (error) {
            throw new Error(`Failed to delete service: ${error.message}`);
        }
    },

    // 6. Delete All Services
    async deleteAll() {
        try {
            await dbConnect();
            const result = await Service.deleteMany({});
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return result;
        } catch (error) {
            throw new Error(`Failed to clear services: ${error.message}`);
        }
    },

    // 7. Reorder Services
    async reorder(ids) {
        try {
            await dbConnect();

            const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

            if (validIds.length === 0) return { success: true };

            const bulkOps = validIds.map((id, index) => ({
                updateOne: {
                    filter: { _id: new mongoose.Types.ObjectId(id) },
                    update: { $set: { order: Number(index) } },
                },
            }));

            // Use native collection bulkWrite for better compatibility and to avoid schema side-effects
            await Service.collection.bulkWrite(bulkOps);

            emitSocketEvent(SOCKET_EVENTS.SERVICES_REORDERED);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return true;
        } catch (error) {
            throw new Error(`Failed to reorder services: ${error.message}`);
        }
    },
};
