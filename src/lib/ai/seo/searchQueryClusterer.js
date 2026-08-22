/**
 * Search Query Clusterer (Phase 5)
 * 
 * Groups normalized search queries into coherent query clusters.
 * Uses token overlap, technology entity extraction, and search intent alignment
 * to preserve distinct topic boundaries (e.g. keeps "Next.js caching" separate from "Next.js authentication").
 */

const CORE_TECH_ENTITIES = ["next.js", "nextjs", "react", "mongodb", "node.js", "nodejs", "express", "tailwind", "api", "seo", "security", "docker", "auth"];

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function extractCoreSubtopicTokens(text = "") {
  const tokens = tokenize(text);
  // Exclude brand/platform tokens to focus on actual subject tokens
  return tokens.filter((t) => !CORE_TECH_ENTITIES.includes(t) && !["how", "to", "for", "in", "with", "and", "the", "a", "an", "best", "guide", "tutorial"].includes(t));
}

function calculateTokenOverlap(queryA, queryB) {
  const tokensA = new Set(extractCoreSubtopicTokens(queryA));
  const tokensB = new Set(extractCoreSubtopicTokens(queryB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }

  const minSize = Math.min(tokensA.size, tokensB.size);
  return intersection / minSize;
}

export function clusterSearchQueries(records = []) {
  if (!Array.isArray(records) || records.length === 0) return [];

  const clusters = [];

  // Sort queries by impressions descending so highest-demand query becomes cluster seed
  const sorted = [...records].sort((a, b) => (b.impressions || 0) - (a.impressions || 0));

  for (const record of sorted) {
    let assignedCluster = null;

    for (const cluster of clusters) {
      const overlap = calculateTokenOverlap(record.query, cluster.primaryQuery);
      // Require strong subtopic token overlap (>= 0.6) to merge
      if (overlap >= 0.6) {
        assignedCluster = cluster;
        break;
      }
    }

    if (assignedCluster) {
      assignedCluster.queries.push(record);
      assignedCluster.totalImpressions += record.impressions || 0;
      assignedCluster.totalClicks += record.clicks || 0;
      // Weighted position calculation
      assignedCluster.minPosition = Math.min(assignedCluster.minPosition, record.averagePosition || 99);
    } else {
      clusters.push({
        clusterKey: record.query.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        primaryQuery: record.query,
        queries: [record],
        totalImpressions: record.impressions || 0,
        totalClicks: record.clicks || 0,
        minPosition: record.averagePosition || 99,
        page: record.page || "",
      });
    }
  }

  return clusters.map((cluster) => {
    const avgPosition = Math.round((cluster.queries.reduce((sum, q) => sum + (q.averagePosition || 0), 0) / cluster.queries.length) * 10) / 10;
    const ctr = cluster.totalImpressions > 0 ? Math.round(((cluster.totalClicks / cluster.totalImpressions) * 100) * 100) / 100 : 0;

    return {
      clusterKey: cluster.clusterKey,
      primaryQuery: cluster.primaryQuery,
      relatedQueries: cluster.queries,
      totalImpressions: cluster.totalImpressions,
      totalClicks: cluster.totalClicks,
      ctr,
      averagePosition: avgPosition,
      page: cluster.page,
    };
  });
}
