import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { cacheManager } from "@/lib/cache";
import { revalidatePath } from "next/cache";

/**
 * Muhyo Tech - AI Featured Engine
 * Intelligently ranks and selects the top 5 featured blogs.
 */
/**
 * Muhyo Tech - AI Featured Engine
 * Intelligently ranks and selects the top 5 featured blogs.
 */
export async function updateFeaturedRankings(triggerBlogInfo = null) {
    const startTime = Date.now();
    try {
        await dbConnect();

        // 1. Fetch all published blogs
        const blogs = await Blog.find({
            publishStatus: "published",
        });

        if (blogs.length === 0) {
            console.log("[FeaturedEngine] No published blogs to rank.");
            return { success: true, message: "No published blogs to rank." };
        }

        // 2. Calculate featuredScore for each blog
        const now = new Date();
        const rankedBlogs = blogs.map((blog) => {
            const freshnessMetric = Math.max(
                0,
                10 - (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24 * 7),
            ); // Decay over 1 week
            const contentMetric = Math.min(10, (blog.content || "").length / 2000);

            const score =
                ((blog.qualityScore || 8) * 0.5 +
                    freshnessMetric * 0.3 +
                    contentMetric * 0.2) *
                10; // Scale to 0-100

            return {
                _id: blog._id,
                title: blog.title,
                score: parseFloat(score.toFixed(2)),
            };
        });

        // 3. Sort by score DESC
        rankedBlogs.sort((a, b) => b.score - a.score);

        // 4. Update Database for Top 5
        const top5Ids = rankedBlogs.slice(0, 5).map((b) => b._id.toString());

        const bulkOps = blogs.map((blog) => {
            const isTop5 = top5Ids.includes(blog._id.toString());
            const rankIndex = top5Ids.indexOf(blog._id.toString());
            const scoreObj = rankedBlogs.find((rb) => rb._id.equals(blog._id));

            return {
                updateOne: {
                    filter: { _id: blog._id },
                    update: {
                        $set: {
                            featured: isTop5,
                            featuredOrder: isTop5 ? rankIndex + 1 : 0,
                            featuredScore: scoreObj ? scoreObj.score : 0,
                        },
                    },
                },
            };
        });

        if (bulkOps.length > 0) {
            await Blog.bulkWrite(bulkOps);
        }

        // 5. Cache Invalidation
        await cacheManager.invalidateByTag("blogs");

        // Trigger Next.js Revalidation
        try {
            revalidatePath("/");
            revalidatePath("/blog");
        } catch (e) {
            // Expected in certain environments
        }

        const duration = Date.now() - startTime;

        // --- PROFESSIONAL LOGGING ---
        if (triggerBlogInfo) {
            const triggeredRank = rankedBlogs.find(
                (b) => b._id.toString() === triggerBlogInfo.id.toString(),
            );
            const enteredTop5 = top5Ids.includes(triggerBlogInfo.id.toString());

            console.log(`
[AI Featured Refresh]
Published Blog: ${triggerBlogInfo.title || "Unknown"}
Blog ID: ${triggerBlogInfo.id}
Featured Score: ${triggeredRank ? triggeredRank.score : "N/A"}
Entered Top 5: ${enteredTop5 ? "Yes" : "No"}

Ranking Duration: ${duration}ms
Updated Count: ${rankedBlogs.length}
            `);
        } else {
            console.log(
                `[FeaturedEngine] Synchronized ${rankedBlogs.length} blogs. Duration: ${duration}ms.`,
            );
        }

        return { success: true, count: rankedBlogs.length };
    } catch (error) {
        console.error("[AI Featured Refresh] Ranking failure:", error);
        return { success: false, error: error.message };
    }
}

/**
 * FAILSAFE TRIGGER: Centralized point for Rank Refresh
 * Ensures we only run when necessary and don't block main threads.
 */
export async function triggerFeaturedUpdate(blog) {
    // TRIGGER CONDITIONS:
    // publishStatus = "published" AND imageGenerated = true AND imageStatus = "completed"
    const canTrigger =
        blog.publishStatus === "published" &&
        blog.imageGenerated === true &&
        blog.imageStatus === "completed";

    if (!canTrigger) {
        return { success: false, message: "Trigger conditions not met." };
    }

    // Run rankings in background to avoid blocking the caller
    // Failsafe: Error handling inside updateFeaturedRankings
    updateFeaturedRankings({
        id: blog._id,
        title: blog.title,
    }).catch((err) => {
        console.error("[AI Featured Refresh] Failsafe caught error:", err);
    });

    return { success: true, message: "Ranking refresh triggered." };
}