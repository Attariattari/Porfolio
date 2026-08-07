import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { cacheManager } from "@/lib/cache";
import { revalidatePath } from "next/cache";

const FEATURED_LIMIT = 4;
const FEATURED_THRESHOLD = 76;

const plainText = (value = "") => String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const wordCount = (content = "") => plainText(content).split(/\s+/).filter(Boolean).length;
const countMatches = (content, pattern) => (String(content || "").match(pattern) || []).length;

function scoreFeaturedCandidate(blog, now) {
    const content = String(blog.content || "");
    const words = wordCount(content);
    const isPillar = blog.articleType === "pillar";
    const isAuthority = isPillar || ["standalone_authority", "verified_trend"].includes(blog.articleType);
    const minimumWords = isPillar ? 1800 : isAuthority ? 1600 : 700;
    const quality = Number(blog.qualityScore || 0);
    const seoDescriptionLength = String(blog.seoDescription || "").trim().length;
    const summaryLength = String(blog.summary || "").trim().length;
    const h2Count = countMatches(content, /<h2\b/gi);
    const h3Count = countMatches(content, /<h3\b/gi);
    const hasList = /<(ul|ol)\b/i.test(content);
    const hasTable = /<table\b/i.test(content);
    const hasFaq = /frequently asked|<h[23][^>]*>\s*faqs?\b/i.test(content);
    const practicalSignals = [hasList, /common mistakes/i.test(content), /best practices/i.test(content), /checklist/i.test(content), /step[- ]by[- ]step/i.test(content)].filter(Boolean).length;
    const publishedAt = new Date(blog.generatedAt || blog.createdAt || now);
    const ageDays = Number.isFinite(publishedAt.getTime())
        ? Math.max(0, (now - publishedAt) / 86400000)
        : 365;

    const qualityGate = blog.aiGenerated
        ? blog.qualityStatus === "passed" && quality >= 8
        : words >= minimumWords && summaryLength >= 100;
    const depthGate = words >= minimumWords;
    const structureGate = h2Count >= (isAuthority ? 8 : 5) && (!isAuthority || h3Count >= 3);
    const seoGate = Boolean(blog.seoTitle && blog.focusKeyword && seoDescriptionLength >= 120 && seoDescriptionLength <= 155);
    const authorityGate = isAuthority
        ? hasList && hasTable && hasFaq && practicalSignals >= 3
        : hasList && practicalSignals >= 2;
    const eligible = qualityGate && depthGate && structureGate && seoGate && authorityGate;

    const qualityScore = Math.min(30, (quality || (blog.aiGenerated ? 0 : 7)) * 3);
    const depthScore = Math.min(20, (words / minimumWords) * 16 + (words >= minimumWords * 1.35 ? 4 : 0));
    const structureScore = Math.min(15, h2Count * 1.4 + h3Count * 0.7 + (hasList ? 2 : 0) + (hasTable ? 1.5 : 0) + (hasFaq ? 1.5 : 0));
    const seoScore = [blog.seoTitle, blog.focusKeyword, seoDescriptionLength >= 120 && seoDescriptionLength <= 155, summaryLength >= 100, Array.isArray(blog.tags) && blog.tags.length >= 2].filter(Boolean).length * 2;
    const authorityScore = Math.min(10, practicalSignals * 1.5 + (isAuthority ? 2.5 : 1.5) + (blog.relatedServiceSlugs?.length ? 1.5 : 0));
    const imageScore = Math.min(10, 5 + Math.max(0, Number(blog.imageAuditScore || 0)) * 0.5);
    const freshnessScore = Math.max(0, 5 - ageDays / 30);
    const continuityScore = blog.featured ? 2 : 0;
    const score = qualityScore + depthScore + structureScore + seoScore + authorityScore + imageScore + freshnessScore + continuityScore;

    return {
        _id: blog._id,
        title: blog.title,
        category: blog.category || "Uncategorized",
        clusterKey: blog.clusterKey || "",
        eligible,
        score: parseFloat(Math.min(100, score).toFixed(2)),
        metrics: { words, quality, h2Count, h3Count, seoDescriptionLength, practicalSignals },
    };
}

function selectFeatured(rankedBlogs) {
    const selected = [];
    const categoryCounts = new Map();
    const usedClusters = new Set();

    for (const candidate of rankedBlogs) {
        if (!candidate.eligible || candidate.score < FEATURED_THRESHOLD) continue;
        const categoryCount = categoryCounts.get(candidate.category) || 0;
        if (categoryCount >= 2) continue;
        if (candidate.clusterKey && usedClusters.has(candidate.clusterKey)) continue;
        selected.push(candidate);
        categoryCounts.set(candidate.category, categoryCount + 1);
        if (candidate.clusterKey) usedClusters.add(candidate.clusterKey);
        if (selected.length === FEATURED_LIMIT) break;
    }

    return selected;
}

/**
 * Muhyo Tech - AI Featured Engine
 * Intelligently qualifies and selects up to four Featured blogs.
 */
export async function updateFeaturedRankings(triggerBlogInfo = null) {
    const startTime = Date.now();
    try {
        await dbConnect();

        // 1. Rank only published blogs that have a usable cover image.
        const blogs = await Blog.find({
            publishStatus: "published",
            $or: [
                { image: { $type: "string", $ne: "" } },
                { "featuredImage.url": { $type: "string", $ne: "" } },
            ],
        });

        if (blogs.length === 0) {
            await Blog.updateMany(
                { featured: true },
                { $set: { featured: false, featuredOrder: 0, featuredScore: 0 } },
            );
            await cacheManager.invalidateByTag("blogs");
            console.log("[FeaturedEngine] No published blogs to rank.");
            return { success: true, message: "No published blogs to rank." };
        }

        // 2. Score real editorial quality instead of automatically rewarding recency.
        const now = new Date();
        const rankedBlogs = blogs.map((blog) => scoreFeaturedCandidate(blog, now));

        // 3. Sort by score DESC
        rankedBlogs.sort((a, b) => b.score - a.score);

        // 4. Feature only blogs that clear the threshold and diversity rules.
        const selectedBlogs = selectFeatured(rankedBlogs);
        const selectedIds = selectedBlogs.map((blog) => blog._id.toString());

        const bulkOps = blogs.map((blog) => {
            const isSelected = selectedIds.includes(blog._id.toString());
            const rankIndex = selectedIds.indexOf(blog._id.toString());
            const scoreObj = rankedBlogs.find((rb) => rb._id.equals(blog._id));

            return {
                updateOne: {
                    filter: { _id: blog._id },
                    update: {
                        $set: {
                            featured: isSelected,
                            featuredOrder: isSelected ? rankIndex + 1 : 0,
                            featuredScore: scoreObj ? scoreObj.score : 0,
                        },
                    },
                },
            };
        });

        if (bulkOps.length > 0) {
            await Blog.bulkWrite(bulkOps);
        }

        // Also clear stale flags from blogs that became unpublished or lost
        // their image and therefore were not part of the eligible query.
        await Blog.updateMany(
            { _id: { $nin: selectedIds }, featured: true },
            { $set: { featured: false, featuredOrder: 0, featuredScore: 0 } },
        );

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
            const enteredFeatured = selectedIds.includes(triggerBlogInfo.id.toString());

            console.log(`
[AI Featured Refresh]
Published Blog: ${triggerBlogInfo.title || "Unknown"}
Blog ID: ${triggerBlogInfo.id}
Featured Score: ${triggeredRank ? triggeredRank.score : "N/A"}
Qualified as Featured: ${enteredFeatured ? "Yes" : "No"}

Ranking Duration: ${duration}ms
Updated Count: ${rankedBlogs.length}
            `);
        } else {
            console.log(
                `[FeaturedEngine] Synchronized ${rankedBlogs.length} blogs. Duration: ${duration}ms.`,
            );
        }

        return { success: true, count: rankedBlogs.length, featuredCount: selectedIds.length, threshold: FEATURED_THRESHOLD };
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
    const eligibleImageStatuses = new Set(["completed", "generated", "uploaded"]);
    const hasImage = Boolean(blog.featuredImage?.url || blog.image);
    const canTrigger =
        blog.publishStatus === "published" &&
        hasImage &&
        eligibleImageStatuses.has(blog.imageStatus);

    if (!canTrigger) {
        return { success: false, message: "Trigger conditions not met." };
    }

    // Await the small database ranking operation so Vercel cannot freeze the
    // invocation before the featured flags are persisted.
    const result = await updateFeaturedRankings({
        id: blog._id,
        title: blog.title,
    });

    return result.success
        ? { success: true, message: "Ranking refresh completed." }
        : result;
}
