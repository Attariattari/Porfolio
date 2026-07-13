import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { withCache, cacheManager } from "@/lib/cache";
import {
    updateFeaturedRankings,
    triggerFeaturedUpdate,
} from "@/lib/ai/featuredEngine";
import { revalidatePath } from "next/cache";

const isPublicBlog = (blog = {}) => {
    const status = blog.publishStatus ?? blog.status ?? "published";
    return status === "published";
};

/**
 * BlogController
 * Optimized with lean queries and caching for production.
 */
export const BlogController = {
    // 1. Get All Blogs - Optimized with lean() and field selection for list pages
    async getAll(filterPublished = false, options = {}) {
        const includeContent = options.includeContent === true;
        const cacheKey = filterPublished
            ? "blogs:list:published"
            : `admin:blogs:list:${includeContent ? "full" : "summary"}`;

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const query = filterPublished
                        ? {
                            $or: [
                                { publishStatus: "published" },
                                { status: "published" },
                                { publishStatus: { $exists: false }, status: { $exists: false } },
                            ],
                        }
                        : {};

                    // P5 OPTIMIZATION: Select only needed fields for list pages.
                    // Admin edit screens can opt into content with includeContent.
                    const dbBlogs = await Blog.find(query)
                        .select([
                            "title",
                            "slug",
                            "summary",
                            ...(includeContent ? ["content"] : []),
                            "image",
                            "featuredImage",
                            "category",
                            "tags",
                            "date",
                            "createdAt",
                            "featured",
                            "featuredOrder",
                            "featuredScore",
                            "qualityScore",
                            "qualityMetrics",
                            "order",
                            "publishStatus",
                            "author",
                            "readTime",
                            "aiGenerated",
                            "generatedAt",
                            "imageStatus",
                            "imageGenerated",
                            "imagePrompt",
                            "image_prompt",
                            "imageNegativePrompt",
                            "imageGenerationAttempts",
                            "manualImageUploadTokenId",
                            "_id",
                        ])
                        .sort({ featuredOrder: 1, order: 1, featured: -1, createdAt: -1 })
                        .lean();

                    if (dbBlogs.length > 0) {
                        return serializeDoc(dbBlogs);
                    }

                    return portfolioData.blogs.map((b) => ({
                        title: b.title,
                        slug: b.slug,
                        summary: b.summary,
                        image: b.image,
                        category: b.category,
                        tags: b.tags || [],
                        date: b.date,
                        featured: b.featured || false,
                        featuredOrder: b.featuredOrder || undefined,
                        author: b.author,
                        readTime: b.readTime || "5 min read",
                        _isFromDataJs: true,
                        _dbId: null,
                        publishStatus: "published",
                    }));
                },
                filterPublished ? 900 : 300,
                ["blogs", filterPublished ? "public:blogs" : "admin:blogs"],
            );
        } catch (error) {
            console.error(
                "[BlogController.getAll] Database connection timeout or failure:",
                error.message,
            );
            // Fallback to static data if DB is offline
            return portfolioData.blogs.map((b) => ({...b, _isFromDataJs: true }));
        }
    },

    // 2. Get One Blog - Optimized with lean()
    async getOne(identifier) {
        const fallbackBlog = portfolioData.blogs.find(
            (b) => b.slug === identifier || b._id === identifier,
        );

        try {
            return await withCache(
                `blogs:detail:${identifier}`,
                async () => {
                    await dbConnect();
                    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
                    const query = {
                        $or: [
                            { slug: identifier },
                            ...(isObjectId ? [{ _id: identifier }] : []),
                        ],
                    };

                    const blog = await Blog.findOne(query).lean();

                    if (blog) {
                        const serialized = serializeDoc(blog);
                        if (!isPublicBlog(serialized)) {
                            return null;
                        }
                        return serialized;
                    }

                    if (fallbackBlog) {
                        return {
                            ...fallbackBlog,
                            _isFromDataJs: true,
                            publishStatus: "published",
                        };
                    }

                    return null;
                },
                3600,
                ["blogs", "public:blogs"],
            );
        } catch (error) {
            console.error(
                `[BlogController.getOne] Database connection timeout or failure for ${identifier}:`,
                error.message,
            );

            if (fallbackBlog) {
                return {
                    ...fallbackBlog,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }

            return null;
        }
    },

    // 3. Create New Blog
    async create(data) {
        try {
            await dbConnect();

            if (data.title && !data.slug) {
                data.slug = data.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            }

            const savedBlog = await Blog.create(data);
            const serialized = serializeDoc(savedBlog);

            // Background tasks
            if (savedBlog.publishStatus === "published") {
                sendNewsletterEmail("blog", savedBlog).catch((err) => {
                    console.error("[BlogController] Newsletter dispatch failure:", err);
                });

                // Trigger AI Featured Ranking (Failsafe handled inside)
                await triggerFeaturedUpdate(savedBlog);

                try {
                    revalidatePath("/");
                    revalidatePath("/blog");
                } catch (e) {}
            }

            emitSocketEvent(SOCKET_EVENTS.NEW_BLOG, serialized);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            await cacheManager.invalidateByTag("blogs");

            return serialized;
        } catch (error) {
            throw new Error(`Failed to create blog: ${error.message}`);
        }
    },

    // 4. Update Blog
    async update(id, data) {
        try {
            await dbConnect();
            const updated = await Blog.findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            }).lean();

            if (!updated) return null;

            if (updated.publishStatus === "published") {
                try {
                    revalidatePath("/");
                    revalidatePath("/blog");
                    revalidatePath(`/blog/${updated.slug}`);
                } catch (e) {}
            }

            // Re-rank after every update so publishing, unpublishing, image
            // removal, and editorial score changes are reflected immediately.
            await updateFeaturedRankings({
                id: updated._id,
                title: updated.title,
            });

            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            await cacheManager.invalidateByTag("blogs");
            return serializeDoc(updated);
        } catch (error) {
            throw new Error(`Failed to update blog: ${error.message}`);
        }
    },

    // 5. Delete One Blog
    async deleteOne(id) {
        try {
            await dbConnect();
            const deleted = await Blog.findByIdAndDelete(id).lean();
            if (deleted) {
                await updateFeaturedRankings();
                emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
                await cacheManager.invalidateByTag("blogs");
            }
            return deleted;
        } catch (error) {
            throw new Error(`Failed to delete blog: ${error.message}`);
        }
    },

    // 6. Delete All Blogs
    async deleteAll() {
        try {
            await dbConnect();
            const result = await Blog.deleteMany({});
            await cacheManager.invalidateByTag("blogs");
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return result;
        } catch (error) {
            throw new Error(`Failed to clear blogs: ${error.message}`);
        }
    },

    // 7. Reorder Blogs
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
            await Blog.collection.bulkWrite(bulkOps);

            await cacheManager.invalidateByTag("blogs");
            emitSocketEvent(SOCKET_EVENTS.BLOGS_REORDERED);
            emitSocketEvent(SOCKET_EVENTS.STATS_UPDATED);
            return true;
        } catch (error) {
            throw new Error(`Failed to reorder blogs: ${error.message}`);
        }
    },
};
