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

/**
 * BlogController
 * Optimized with lean queries and caching for production.
 */
export const BlogController = {
    // 1. Get All Blogs - Optimized with lean() and field selection for list pages
    async getAll(filterPublished = false) {
        const cacheKey = `blogs_all_${filterPublished}`;

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const query = filterPublished ? { publishStatus: "published" } : {};

                    console.log(
                        `[BlogController] Fetching blogs (Published Only: ${filterPublished})`,
                    );

                    // P5 OPTIMIZATION: Select only needed fields for list pages
                    // Exclude: content (large body), comments, metadata
                    // Reduces payload by 80-90%
                    const dbBlogs = await Blog.find(query)
                        .select([
                            "title",
                            "slug",
                            "summary",
                            "image",
                            "category",
                            "tags",
                            "date",
                            "createdAt",
                            "featured",
                            "featuredOrder",
                            "order",
                            "publishStatus",
                            "author",
                            "readTime",
                            "aiGenerated",
                            "imageStatus",
                            "imageGenerated",
                            "_id",
                        ])
                        .sort({ featuredOrder: 1, order: 1, featured: -1, createdAt: -1 })
                        .lean();

                    const uploadedSlugs = new Set(dbBlogs.map((b) => b.slug));
                    const fallbackBlogs = portfolioData.blogs
                        .filter((b) => !uploadedSlugs.has(b.slug))
                        .map((b) => ({
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

                    return [...serializeDoc(dbBlogs), ...fallbackBlogs];
                },
                300, ["blogs"],
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
        try {
            await dbConnect();
            const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
            const query = {
                $or: [
                    { slug: identifier },
                    ...(isObjectId ? [{ _id: identifier }] : []),
                ],
            };

            const blog = await Blog.findOne(query).lean();

            if (blog) return serializeDoc(blog);

            // Fallback to static data
            const fallbackBlog = portfolioData.blogs.find(
                (b) => b.slug === identifier,
            );
            if (fallbackBlog) {
                return {
                    ...fallbackBlog,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }

            return null;
        } catch (error) {
            throw new Error(`Failed to fetch blog ${identifier}: ${error.message}`);
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
                // Trigger AI Featured Ranking (Failsafe handled inside)
                await triggerFeaturedUpdate(updated);

                try {
                    revalidatePath("/");
                    revalidatePath("/blog");
                } catch (e) {}
            }

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