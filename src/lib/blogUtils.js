/**
 * Blog Utilities
 * Centralized logic for resolving blog data priority and filtering.
 */

/**
 * Resolves featured blogs with strict "Database-First" priority.
 *
 * Logic:
 * 1. If any blogs exist in the database that are marked as 'featured' and 'published',
 *    use ONLY those. This prevents mixing real data with stale fallback data.
 * 2. If no featured blogs are found in the database, fallback to the static data.js blogs.
 * 3. Supports AI-generated blogs which are stored in the database.
 *
 * @param {Array} dbBlogs - All blogs from the database (may include some auto-merged fallbacks)
 * @param {Array} staticBlogs - The original blogs from data.js
 * @returns {Array} - The resolved list of featured blogs
 */
export function resolveFeaturedBlogs(dbBlogs = [], staticBlogs = []) {
    const safeDbBlogs = Array.isArray(dbBlogs) ? dbBlogs : [];
    const safeStaticBlogs = Array.isArray(staticBlogs) ? staticBlogs : [];

    // 1. Separate real DB blogs from fallback blogs
    // Real DB blogs do not have the _isFromDataJs flag
    const realDbBlogs = safeDbBlogs.filter((b) => b && !b._isFromDataJs);

    // 2. Filter for real DB blogs that are marked as 'featured' and 'published'
    const dbFeatured = realDbBlogs.filter(
        (b) => b && !!b.featured && (!b.publishStatus || b.publishStatus === "published"),
    );

    // 3. Priority 1: If DB has featured blogs, use ONLY those (sorted by featuredOrder)
    if (dbFeatured.length > 0) {
        return dbFeatured.sort((a, b) => {
            const orderA = a.featuredOrder !== undefined ? a.featuredOrder : 999;
            const orderB = b.featuredOrder !== undefined ? b.featuredOrder : 999;
            return orderA - orderB;
        });
    }

    // 4. Priority 2 (Real-Time Fallback): If DB has blogs but none featured,
    // show the latest 3 DB blogs to ensure the content is always fresh.
    if (realDbBlogs.length > 0) {
        // They are already sorted by createdAt in BlogController.getAll
        return realDbBlogs.slice(0, 3);
    }

    // 5. Priority 3: Fallback to data.js featured blogs if DB is empty
    const staticFeatured = safeStaticBlogs.filter((b) => b && !!b.featured);
    if (staticFeatured.length > 0) return staticFeatured;

    // 6. Final Fallback: First 3 items from whatever list we have
    return safeDbBlogs.slice(0, 3);
}

const toTimestamp = (blog = {}) => {
    const value = blog.createdAt || blog.generatedAt || blog.date || blog.updatedAt;
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const fallbackTrendScore = (blog = {}, referenceTimestamp = toTimestamp(blog)) => {
    const quality = Number(blog.qualityScore);
    const qualityScore = Number.isFinite(quality) && quality > 0
        ? Math.min(100, quality * 10)
        : (blog.featured ? 78 : 55);
    const ageInDays = Math.max(0, (referenceTimestamp - toTimestamp(blog)) / 86400000);
    const freshnessScore = Math.max(0, 100 - ageInDays * 1.5);
    const completenessScore = [
        blog.image || blog.featuredImage?.url,
        blog.summary,
        blog.readTime,
        Array.isArray(blog.tags) && blog.tags.length > 0,
    ].filter(Boolean).length * 25;

    return qualityScore * 0.55 + freshnessScore * 0.3 + completenessScore * 0.15;
};

export const getBlogTrendScore = (blog = {}, referenceTimestamp) => {
    const aiScore = Number(blog.featuredScore);
    return Number.isFinite(aiScore) && aiScore > 0
        ? aiScore
        : fallbackTrendScore(blog, referenceTimestamp);
};

export function rankBlogsByMode(blogs = [], mode = "latest") {
    const ranked = [...(Array.isArray(blogs) ? blogs : [])];
    const referenceTimestamp = Math.max(0, ...ranked.map(toTimestamp));

    if (mode === "trending") {
        return ranked.sort((a, b) =>
            getBlogTrendScore(b, referenceTimestamp) - getBlogTrendScore(a, referenceTimestamp)
            || toTimestamp(b) - toTimestamp(a)
            || String(a.title || "").localeCompare(String(b.title || "")),
        );
    }

    if (mode === "picks") {
        return ranked.sort((a, b) => {
            const featuredDifference = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
            if (featuredDifference) return featuredDifference;

            const orderA = Number(a.featuredOrder) > 0 ? Number(a.featuredOrder) : 999;
            const orderB = Number(b.featuredOrder) > 0 ? Number(b.featuredOrder) : 999;
            return orderA - orderB
                || getBlogTrendScore(b, referenceTimestamp) - getBlogTrendScore(a, referenceTimestamp)
                || toTimestamp(b) - toTimestamp(a);
        });
    }

    return ranked.sort((a, b) =>
        toTimestamp(b) - toTimestamp(a)
        || (Number(a.order) || 999) - (Number(b.order) || 999),
    );
}

export function getTrendingBlogs(blogs = [], options = {}) {
    const { excludeSlug, limit = 2 } = options;
    return rankBlogsByMode(
        blogs.filter((blog) =>
            blog
            && (!blog.publishStatus || blog.publishStatus === "published")
            && blog.slug !== excludeSlug,
        ),
        "trending",
    ).slice(0, limit);
}
