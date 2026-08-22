/**
 * Google Search Console (GSC) Performance Collector (Phase 8)
 * 
 * Safely collects search performance signals from Google Search Console v3 API
 * for published blog pages (/blog/[slug]):
 * - Impressions
 * - Clicks
 * - CTR
 * - Average Position
 * - Search Queries
 * 
 * FAIL-SAFE & NON-BLOCKING GUARANTEE:
 * - If GSC credentials are missing, API call fails, or rate limits occur,
 *   logs warning and returns available = false with an empty performance map.
 * - NEVER fails blog generation, topic queue execution, or publishing flows.
 */

import { fetchGscSearchAnalytics } from "../../seo/gscApiClient.js";

function extractBlogSlugFromUrl(url = "") {
  try {
    const parsed = new URL(url, "https://muhyotech.com");
    const pathname = parsed.pathname || "";
    const match = pathname.match(/^\/blog\/([^/]+)$/i);
    return match ? match[1].toLowerCase().trim() : null;
  } catch {
    const match = String(url).match(/\/blog\/([^/?#]+)/i);
    return match ? match[1].toLowerCase().trim() : null;
  }
}

/**
 * Collects and maps GSC search performance signals to published blog documents.
 * 
 * @param {Array<Object>} [publishedBlogs=[]] - Array of published blog objects ({ _id, slug, title })
 * @param {Object} [options={}] - Options ({ startDate, endDate, rowLimit })
 * @returns {Promise<Object>} Performance map keyed by blog slug
 */
export async function collectGscPerformance(publishedBlogs = [], options = {}) {
  const performanceMap = new Map();

  try {
    const gscResult = await fetchGscSearchAnalytics({
      startDate: options.startDate || null,
      endDate: options.endDate || null,
      dimensions: ["query", "page"],
      rowLimit: options.rowLimit || 1000,
    });

    if (!gscResult.available || !Array.isArray(gscResult.rows)) {
      return {
        available: false,
        source: gscResult.source || "unconfigured",
        message: gscResult.error || gscResult.message || "GSC data unavailable.",
        performanceMap,
        timestamp: new Date().toISOString(),
      };
    }

    const publishedSlugs = new Set((publishedBlogs || []).map((b) => b?.slug?.toLowerCase()).filter(Boolean));

    for (const row of gscResult.rows) {
      const keys = Array.isArray(row.keys) ? row.keys : [];
      const query = keys[0] || "";
      const pageUrl = keys[1] || "";

      const slug = extractBlogSlugFromUrl(pageUrl);
      if (!slug) continue;

      // Only match against known published blog slugs if pool is provided
      if (publishedSlugs.size > 0 && !publishedSlugs.has(slug)) {
        continue;
      }

      const clicks = Number(row.clicks || 0);
      const impressions = Number(row.impressions || 0);
      const position = Number(row.position || 0);

      let record = performanceMap.get(slug);
      if (!record) {
        record = {
          slug,
          clicks: 0,
          impressions: 0,
          positionSum: 0,
          queryCount: 0,
          topQueries: [],
        };
        performanceMap.set(slug, record);
      }

      record.clicks += clicks;
      record.impressions += impressions;
      record.positionSum += position * impressions;
      record.queryCount += 1;

      if (query && record.topQueries.length < 10) {
        record.topQueries.push({ query, clicks, impressions, position: Math.round(position * 10) / 10 });
      }
    }

    // Finalize averages per blog slug
    for (const [slug, record] of performanceMap.entries()) {
      record.averagePosition = record.impressions > 0 ? Math.round((record.positionSum / record.impressions) * 10) / 10 : 0;
      record.ctr = record.impressions > 0 ? Math.round((record.clicks / record.impressions) * 10000) / 100 : 0;
      record.topQueries.sort((a, b) => b.impressions - a.impressions);
    }

    return {
      available: true,
      source: "gsc_api",
      totalBlogsMatched: performanceMap.size,
      performanceMap,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[GSC-Performance] Graceful catch: Collection failed:", error.message);
    return {
      available: false,
      source: "gsc_error",
      error: error.message,
      performanceMap,
      timestamp: new Date().toISOString(),
    };
  }
}
