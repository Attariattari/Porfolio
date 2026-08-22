/**
 * Search Signals Provider Abstraction Layer (Phase 5)
 * 
 * Provides an interface for retrieving search console & opportunity signals.
 * Incorporates real GSC evidence when available, or returns structured default responses 
 * marking metrics as estimated when live external APIs are unconfigured.
 */

import { getCachedSearchOpportunities } from "../seo/searchIntelligenceService.js";

export async function getSearchSignals(topic = {}) {
  const query = topic.focusKeyword || topic.title || "";
  const normQuery = String(query).toLowerCase().trim();

  try {
    const opps = await getCachedSearchOpportunities({ minScore: 0, limit: 100 });
    
    if (opps.available && Array.isArray(opps.opportunities)) {
      const match = opps.opportunities.find((o) => {
        const primary = String(o.primaryQuery || o.queryCluster || "").toLowerCase();
        return primary.includes(normQuery) || normQuery.includes(primary);
      });

      if (match) {
        return {
          available: true,
          source: opps.source || "gsc_api",
          query,
          isEstimated: false,
          data: {
            searchVolume: null, // First-party GSC data, NOT universal keyword volume
            keywordDifficulty: null,
            cpc: null,
            gscImpressions: match.impressions || null,
            gscClicks: match.clicks || null,
            gscCtr: match.ctr || null,
            gscPosition: match.averagePosition || null,
          },
          recommendedAction: match.recommendedAction || "no_action",
          timestamp: new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.warn("[SearchSignalsProvider] Signals lookup warning. Returning default abstraction:", error.message);
  }

  return {
    available: false,
    source: null,
    query,
    isEstimated: true,
    data: {
      searchVolume: null,
      keywordDifficulty: null,
      cpc: null,
      gscImpressions: null,
      gscClicks: null,
      gscCtr: null,
      gscPosition: null,
    },
    timestamp: new Date().toISOString(),
  };
}
