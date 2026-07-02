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
    // 1. Separate real DB blogs from fallback blogs
    // Real DB blogs do not have the _isFromDataJs flag
    const realDbBlogs = dbBlogs.filter((b) => !b._isFromDataJs);

    // 2. Filter for real DB blogs that are marked as 'featured' and 'published'
    const dbFeatured = realDbBlogs.filter(
        (b) => !!b.featured && (!b.publishStatus || b.publishStatus === "published"),
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
    const staticFeatured = staticBlogs.filter((b) => !!b.featured);
    if (staticFeatured.length > 0) return staticFeatured;

    // 6. Final Fallback: First 3 items from whatever list we have
    return dbBlogs.slice(0, 3);
}
