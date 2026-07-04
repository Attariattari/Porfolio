import mongoose from "mongoose";
import { Project } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { withCache } from "@/lib/cache";

/**
 * ProjectController
 * Optimized for production performance with lean queries, caching, and efficient merging.
 */
export const ProjectController = {
    // 1. Get All Projects - Optimized with lean(), caching, and efficient merge
    async getAll(filterPublished = false) {
        const cacheKey = `projects_all_${filterPublished}`;
        
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();

                    const query = filterPublished ? { publishStatus: "published" } : {};

                    // Use .lean() for faster execution and smaller memory footprint
                    const dbProjects = await Project.find(query)
                        .sort({ order: 1, featured: -1, createdAt: -1 })
                        .lean();

                    // Merge with fallback data only if necessary
                    const uploadedTitles = new Set(dbProjects.map((p) => p.title));
                    const fallbackProjects = portfolioData.projects
                        .filter((p) => !uploadedTitles.has(p.title))
                        .map((p) => ({
                            ...p,
                            _isFromDataJs: true,
                            _dbId: null,
                            publishStatus: "published",
                        }));

                    // Combine and return serialized results
                    return [...serializeDoc(dbProjects), ...fallbackProjects];
                },
                300, // 5 minute cache
                ["projects"]
            );
        } catch (error) {
            console.error("[ProjectController.getAll] Error:", error);
            return portfolioData.projects.map((p) => ({ ...p, _isFromDataJs: true }));
        }
    },

    // 2. Get One Project By SLUG or ID - Optimized with lean()
    async getOne(identifier) {
        try {
            await dbConnect();

            const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
            const query = {
                $or: [
                    { slug: identifier },
                    ...(isObjectId ? [{ _id: identifier }] : []),
                ],
            };

            const project = await Project.findOne(query).lean();

            if (project) return serializeDoc(project);

            // Fallback to static data
            const fallbackProject = portfolioData.projects.find(
                (p) =>
                p.id?.toString() === identifier ||
                p.slug === identifier ||
                p.title.toLowerCase().replace(/\s+/g, "-") === identifier,
            );

            if (fallbackProject) {
                return {
                    ...fallbackProject,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }

            return null;
        } catch (error) {
            throw new Error(
                `Failed to fetch project ${identifier}: ${error.message}`,
            );
        }
    },

    // 3. Create New Project
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

            const savedProject = await Project.create(data);
            const serialized = serializeDoc(savedProject);

            // Background tasks
            sendNewsletterEmail("project", savedProject).catch(() => {});
            emitSocketEvent(SOCKET_EVENTS.NEW_PROJECT, serialized);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);

            return serialized;
        } catch (error) {
            throw new Error(`Failed to create project: ${error.message}`);
        }
    },

    // 4. Update Project
    async update(id, data) {
        try {
            await dbConnect();
            const updatedProject = await Project.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).lean();

            if (!updatedProject) return null;

            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return serializeDoc(updatedProject);
        } catch (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
    },

    // 5. Delete One Project
    async deleteOne(id) {
        try {
            await dbConnect();
            const deletedProject = await Project.findByIdAndDelete(id).lean();
            if (deletedProject) {
                emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            }
            return deletedProject;
        } catch (error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    },

    // 6. Delete All Projects
    async deleteAll() {
        try {
            await dbConnect();
            const result = await Project.deleteMany({});
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return result;
        } catch (error) {
            throw new Error(`Failed to clear projects: ${error.message}`);
        }
    },

    // 7. Reorder Projects
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

            // Use native collection bulkWrite for better compatibility and to avoid schema validation side-effects
            await Project.collection.bulkWrite(bulkOps);

            emitSocketEvent(SOCKET_EVENTS.PROJECTS_REORDERED);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return true;
        } catch (error) {
            throw new Error(`Failed to reorder projects: ${error.message}`);
        }
    },
};
