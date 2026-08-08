import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { sendNewsletterEmail } from "@/lib/newsletter";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socketCore";
import { withCache, cacheManager } from "@/lib/cache";
import {
    updateFeaturedRankings,
    triggerFeaturedUpdate,
} from "@/lib/ai/featuredEngine";
import { revalidatePath } from "next/cache";
import { isLegacyBlogSlug, normalizeBlogServiceLinks } from "@/lib/blogSeo";
import { scheduleInternalLinkAudit } from "@/lib/ai/blog/internalLinkingEngine";

const isPublicBlog = (blog = {}) => {
    const status = blog.publishStatus ?? blog.status ?? "published";
    return status === "published";
};

const revalidatePublicBlogPaths = (slug) => {
    try {
        revalidatePath("/");
        revalidatePath("/blog");
        revalidatePath("/sitemap.xml");
        revalidatePath("/llms.txt");
        if (slug) revalidatePath(`/blog/${slug}`);
    } catch {
        // Revalidation is unavailable when controllers run outside a Next.js
        // request (for example, maintenance scripts). The database write must
        // still succeed; the sitemap's five-minute ISR remains the fallback.
    }
};

/**
 * BlogController
 * Optimized with lean queries and caching for production.
 */
export const BlogController = {
    async getPublicPage({ offset = 0, limit = 15, category = "", search = "" } = {}) {
        const safeOffset = Math.max(0, Math.trunc(Number(offset) || 0));
        const safeLimit = Math.min(30, Math.max(1, Math.trunc(Number(limit) || 15)));
        try {
            await dbConnect();
            const query = {
                $or: [
                    { publishStatus: "published" },
                    { status: "published" },
                    { publishStatus: { $exists: false }, status: { $exists: false } },
                ],
            };
            if (category && category !== "All") query.category = category;
            if (search) {
                const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                query.$and = [{ $or: [{ title: { $regex: escaped, $options: "i" } }, { summary: { $regex: escaped, $options: "i" } }] }];
            }
            const projection = "title slug summary image featuredImage category tags date createdAt updatedAt generatedAt featured featuredOrder featuredScore qualityScore order publishStatus author readTime views";
            const [rows, total, categories] = await Promise.all([
                Blog.find(query).select(projection).sort({ featured: -1, featuredOrder: 1, createdAt: -1, order: 1 }).skip(safeOffset).limit(safeLimit + 1).lean(),
                Blog.countDocuments(query),
                Blog.distinct("category", { $or: query.$or }),
            ]);
            const serialized = serializeDoc(rows).filter((blog) => !isLegacyBlogSlug(blog.slug));
            return {
                items: serialized.slice(0, safeLimit),
                hasMore: safeOffset + safeLimit < total && serialized.length > safeLimit,
                total,
                categories: categories.filter(Boolean).sort(),
            };
        } catch (error) {
            const fallback = portfolioData.blogs.filter((blog) => isPublicBlog(blog) && !isLegacyBlogSlug(blog.slug));
            const filtered = fallback.filter((blog) =>
                (!category || category === "All" || blog.category === category) &&
                (!search || `${blog.title || ""} ${blog.summary || ""}`.toLowerCase().includes(String(search).toLowerCase())),
            );
            return {
                items: filtered.slice(safeOffset, safeOffset + safeLimit),
                hasMore: safeOffset + safeLimit < filtered.length,
                total: filtered.length,
                categories: [...new Set(fallback.map((blog) => blog.category).filter(Boolean))].sort(),
            };
        }
    },
    // 1. Get All Blogs - Optimized with lean() and field selection for list pages
    async getAll(filterPublished = false, options = {}) {
        const includeContent = options.includeContent === true;
        const cacheKey = filterPublished
            ? `blogs:list:published:${includeContent ? "full" : "summary"}`
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
                            "seoTitle",
                            "seoDescription",
                            "focusKeyword",
                            "searchIntent",
                            "relatedServiceSlugs",
                            "image",
                            "featuredImage",
                            "category",
                            "tags",
                            "date",
                            "createdAt",
                            "updatedAt",
                            "featured",
                            "featuredOrder",
                            "featuredScore",
                            "qualityScore",
                            "qualityMetrics",
                            "qualityStatus",
                            "order",
                            "publishStatus",
                            "author",
                            "readTime",
                            "aiGenerated",
                            "articleType",
                            "contentCategory",
                            "topicFamily",
                            "isTrend",
                            "clusterKey",
                            "clusterTitle",
                            "clusterOrder",
                            "parentPillarBlogId",
                            "topicPlanId",
                            "generatedAt",
                            "imageStatus",
                            "imageGenerated",
                            "imagePrompt",
                            "image_prompt",
                            "imageNegativePrompt",
                            "imageGenerationAttempts",
                            "manualImageUploadTokenId",
                            "socialKit",
                            "_id",
                        ])
                        .sort({ featured: -1, featuredOrder: 1, createdAt: -1, order: 1 })
                        .lean();

                    if (dbBlogs.length > 0) {
                        const serializedBlogs = serializeDoc(dbBlogs);
                        return filterPublished
                            ? serializedBlogs.filter((blog) => !isLegacyBlogSlug(blog.slug))
                            : serializedBlogs;
                    }

                    return portfolioData.blogs
                      .filter((blog) => !filterPublished || !isLegacyBlogSlug(blog.slug))
                      .map((b) => ({
                        title: b.title,
                        slug: b.slug,
                        summary: b.summary,
                        ...(includeContent ? { content: b.content } : {}),
                        seoTitle: b.seoTitle,
                        seoDescription: b.seoDescription,
                        focusKeyword: b.focusKeyword,
                        searchIntent: b.searchIntent,
                        relatedServiceSlugs: b.relatedServiceSlugs || [],
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
            return portfolioData.blogs
                .filter((blog) => !filterPublished || !isLegacyBlogSlug(blog.slug))
                .map((b) => ({...b, _isFromDataJs: true }));
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
                        return { ...serialized, content: normalizeBlogServiceLinks(serialized.content) };
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

            if (typeof data.content === "string") data.content = normalizeBlogServiceLinks(data.content);

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

                revalidatePublicBlogPaths(savedBlog.slug);
                await scheduleInternalLinkAudit(savedBlog._id);
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
            if (typeof data.content === "string") data.content = normalizeBlogServiceLinks(data.content);
            const updated = await Blog.findByIdAndUpdate(id, {
                ...data,
                updatedAt: new Date(),
            }, {
                new: true,
                runValidators: true,
            }).lean();

            if (!updated) return null;

            // Refresh discovery even when a post is unpublished: its URL must
            // then disappear from the public listing and XML sitemap.
            revalidatePublicBlogPaths(updated.slug);

            // Re-rank after every update so publishing, unpublishing, image
            // removal, and editorial score changes are reflected immediately.
            await updateFeaturedRankings({
                id: updated._id,
                title: updated.title,
            });
            await scheduleInternalLinkAudit(updated.publishStatus === "published" ? updated._id : null);

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
                revalidatePublicBlogPaths(deleted.slug);
                await scheduleInternalLinkAudit(null);
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
            revalidatePublicBlogPaths();
            await scheduleInternalLinkAudit(null);
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
