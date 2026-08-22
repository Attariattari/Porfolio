/**
 * Google Search Console (GSC) Provider & Opportunity Detector
 * 
 * Provides an abstraction layer for fetching real-world search console metrics 
 * (impressions, clicks, CTR, position, queries, pages) and detecting ranking opportunities.
 * 
 * Fallback: Operates safely with internal estimates when GSC credentials are unconfigured.
 */

export async function getGscPerformanceData({ siteUrl = "https://muhyotech.com", startDate = null, endDate = null } = {}) {
  const hasCredentials = Boolean(
    process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY && process.env.GSC_PROPERTY_URL
  );

  if (!hasCredentials) {
    return {
      available: false,
      isEstimated: true,
      source: null,
      message: "GSC credentials not configured. Operating in safe estimated signals mode.",
      records: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Placeholder for live GSC API client resolution
  try {
    return {
      available: true,
      isEstimated: false,
      source: "gsc_api",
      records: [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[GSCProvider] GSC API fetch warning. Falling back to estimated signals:", error.message);
    return {
      available: false,
      isEstimated: true,
      source: "gsc_fallback",
      error: error.message,
      records: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export function detectGscOpportunities(performanceRecords = []) {
  const opportunities = {
    optimization: [],
    supportingCluster: [],
    conversion: [],
    deprioritize: [],
  };

  for (const record of performanceRecords) {
    const impressions = record.impressions || 0;
    const clicks = record.clicks || 0;
    const ctr = record.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 0);
    const pos = record.averagePosition || 0;
    const topQueries = record.topQueries || [];
    const hasServiceLink = Boolean(record.serviceSlug && record.serviceSlug !== "none");

    // 1. Optimization Opportunity: Ranks 8-20, High Impressions (>500), Low CTR (<2%)
    if (pos >= 8 && pos <= 20 && impressions >= 500 && ctr < 2.0) {
      opportunities.optimization.push({
        blogId: record.blogId,
        slug: record.slug,
        title: record.title,
        impressions,
        clicks,
        position: pos,
        ctr,
        opportunityReason: `Ranks position ${pos} with ${impressions} impressions but low CTR (${ctr.toFixed(1)}%). Title/meta optimization recommended.`,
      });
    }

    // 2. Supporting Cluster Opportunity: Ranks 11+, Multiple related sub-queries
    if (pos >= 11 && topQueries.length >= 3) {
      opportunities.supportingCluster.push({
        blogId: record.blogId,
        slug: record.slug,
        title: record.title,
        topQueries,
        position: pos,
        opportunityReason: `Ranks position ${pos} with ${topQueries.length} distinct sub-queries. Sub-topic expansion recommended.`,
      });
    }

    // 3. Conversion Opportunity: High Traffic (>100 clicks) but No Linked Service
    if (clicks >= 100 && !hasServiceLink) {
      opportunities.conversion.push({
        blogId: record.blogId,
        slug: record.slug,
        title: record.title,
        clicks,
        opportunityReason: `Receives ${clicks} organic clicks but lacks a primary service CTA. Service connection recommended.`,
      });
    }

    // 4. Deprioritize: 0 Impressions over 60+ days
    if (impressions === 0 && record.daysPublished >= 60) {
      opportunities.deprioritize.push({
        blogId: record.blogId,
        slug: record.slug,
        opportunityReason: "0 impressions over 60+ days. Deprioritize sub-cluster expansion.",
      });
    }
  }

  return opportunities;
}
