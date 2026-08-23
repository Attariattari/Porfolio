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
 * 2. If real database blogs exist but none qualify, return an empty list.
 *    This prevents ordinary recent posts from being presented as Featured.
 * 3. Use static featured blogs only while the database has no real blogs.
 * 4. Supports AI-generated blogs which are stored in the database.
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

    // 4. A populated database with no qualified Featured articles must remain
    // empty. Recent publication alone is not a Featured qualification.
    if (realDbBlogs.length > 0) {
        return [];
    }

    // 5. Priority 3: Fallback to data.js featured blogs if DB is empty
    const staticFeatured = safeStaticBlogs.filter((b) => b && !!b.featured);
    if (staticFeatured.length > 0) return staticFeatured;

    return [];
}

export const toTimestamp = (blog = {}) => {
    const value = blog.createdAt || blog.generatedAt || blog.date || blog.updatedAt;
    const timestamp = value ? new Date(value).getTime() : 0;
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const getBlogHash = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getBlogTrendScore = (blog = {}, referenceTimestamp) => {
    const rawAiScore = Number(blog.featuredScore);
    if (Number.isFinite(rawAiScore) && rawAiScore > 0) {
        return rawAiScore <= 10 ? rawAiScore * 10 : rawAiScore;
    }

    const title = String(blog.title || "");
    const slug = String(blog.slug || "");
    const hash = getBlogHash(slug || title);

    let topicBoost = 0;
    const lowerText = `${title} ${blog.category || ""} ${(blog.tags || []).join(" ")}`.toLowerCase();
    if (lowerText.includes("architecture") || lowerText.includes("microservices")) topicBoost += 22;
    if (lowerText.includes("security") || lowerText.includes("auth") || lowerText.includes("jwt")) topicBoost += 18;
    if (lowerText.includes("scale") || lowerText.includes("sharding") || lowerText.includes("performance")) topicBoost += 16;
    if (lowerText.includes("saas") || lowerText.includes("llm") || lowerText.includes("ai")) topicBoost += 20;
    if (lowerText.includes("next.js") || lowerText.includes("react") || lowerText.includes("node")) topicBoost += 14;

    const realViews = Number(blog.views) || 0;
    const viewFactor = realViews > 0 ? Math.min(30, realViews * 3) : ((hash % 25) + 12);

    const readMin = parseInt(String(blog.readTime || "5"), 10) || 5;
    const depthScore = Math.min(20, readMin * 2.5);

    const baseQuality = Number(blog.qualityScore) > 0
        ? (Number(blog.qualityScore) <= 10 ? Number(blog.qualityScore) * 10 : Number(blog.qualityScore))
        : 65 + (hash % 25);

    return baseQuality * 0.35 + topicBoost * 0.30 + viewFactor * 0.20 + depthScore * 0.15;
};

export const getBlogEditorPickScore = (blog = {}) => {
    if (blog.featured) {
        const order = Number(blog.featuredOrder);
        return 1000 - (Number.isFinite(order) && order > 0 ? order * 10 : 0);
    }

    const title = String(blog.title || "").toLowerCase();
    const cat = String(blog.category || "").toLowerCase();
    const hash = getBlogHash(blog.slug || title);

    let editorialPillarScore = 40;
    if (title.includes("blueprint") || title.includes("resilience") || title.includes("guide")) editorialPillarScore += 30;
    if (title.includes("foundation") || title.includes("architecture") || title.includes("trust")) editorialPillarScore += 25;
    if (cat.includes("architecture") || cat.includes("security")) editorialPillarScore += 20;
    if (title.includes("product engineer") || title.includes("scale")) editorialPillarScore += 22;

    editorialPillarScore += (hash % 18);
    return editorialPillarScore;
};

export function rankBlogsByMode(blogs = [], mode = "latest") {
    const ranked = [...(Array.isArray(blogs) ? blogs : [])];
    const referenceTimestamp = Math.max(0, ...ranked.map(toTimestamp));

    if (mode === "trending") {
        return ranked.sort((a, b) => {
            const scoreA = getBlogTrendScore(a, referenceTimestamp);
            const scoreB = getBlogTrendScore(b, referenceTimestamp);
            return scoreB - scoreA
                || toTimestamp(b) - toTimestamp(a)
                || String(a.title || "").localeCompare(String(b.title || ""));
        });
    }

    if (mode === "picks") {
        return ranked.sort((a, b) => {
            const scoreA = getBlogEditorPickScore(a);
            const scoreB = getBlogEditorPickScore(b);
            return scoreB - scoreA
                || toTimestamp(b) - toTimestamp(a)
                || String(a.title || "").localeCompare(String(b.title || ""));
        });
    }

    return ranked.sort((a, b) => {
        const diff = toTimestamp(b) - toTimestamp(a);
        if (diff !== 0) return diff;
        return (Number(a.order) || 999) - (Number(b.order) || 999);
    });
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
