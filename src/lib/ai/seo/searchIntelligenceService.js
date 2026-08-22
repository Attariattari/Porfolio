/**
 * Search Intelligence Master Service & Caching Layer (Phase 5)
 * 
 * Coordinates GSC search analytics fetch, signal normalization, query clustering, 
 * opportunity analysis, and persistent caching in MongoDB (SearchOpportunity & ContentPerformance).
 * 
 * Includes 100% fail-safe fallback (available = false) when GSC is unconfigured or unavailable.
 */

import mongoose from "mongoose";
import dbConnect from "../../dbConnect.js";
import { SearchOpportunity } from "../../../models/SearchOpportunity.js";
import { fetchGscSearchAnalytics } from "./gscApiClient.js";
import { normalizeGscDataset } from "./searchDataNormalizer.js";
import { clusterSearchQueries } from "./searchQueryClusterer.js";
import { analyzeSearchOpportunities } from "./searchOpportunityAnalyzer.js";

// Fast in-memory cache to prevent repeated DB / API calls
let memoryCache = {
  lastSyncAt: null,
  available: false,
  source: null,
  opportunities: [],
  queryCount: 0,
  clusterCount: 0,
};

export async function syncSearchIntelligence({ startDate = null, endDate = null } = {}) {
  const syncResult = {
    available: false,
    source: null,
    queryCount: 0,
    clusterCount: 0,
    opportunitiesCount: 0,
    error: null,
    timestamp: new Date().toISOString(),
  };

  try {
    const rawGsc = await fetchGscSearchAnalytics({ startDate, endDate, rowLimit: 500 });
    
    if (!rawGsc.available) {
      syncResult.available = false;
      syncResult.source = rawGsc.source || "unconfigured";
      syncResult.error = rawGsc.error || rawGsc.message;
      memoryCache = { ...syncResult, opportunities: [] };
      return syncResult;
    }

    const normalizedRecords = normalizeGscDataset(rawGsc.rows, { startDate: rawGsc.startDate, endDate: rawGsc.endDate });
    const queryClusters = clusterSearchQueries(normalizedRecords);

    // Fetch existing blogs and topic plans for gap analysis
    let blogs = [];
    let topicPlans = [];

    try {
      await dbConnect();
      const BlogModel = mongoose.models.Blog;
      const PlanModel = mongoose.models.BlogTopicPlan;
      if (BlogModel) blogs = await BlogModel.find({}).lean().catch(() => []);
      if (PlanModel) topicPlans = await PlanModel.find({}).lean().catch(() => []);
    } catch {
      // Non-critical database connection catch
    }

    const opportunities = analyzeSearchOpportunities({ clusters: queryClusters, blogs, topicPlans });

    // Persist opportunities into MongoDB if database connected
    try {
      await dbConnect();
      for (const opp of opportunities.slice(0, 100)) {
        await SearchOpportunity.findOneAndUpdate(
          { queryCluster: opp.queryCluster },
          {
            ...opp,
            source: rawGsc.source,
            lastSyncAt: new Date(),
          },
          { upsert: true, new: true }
        ).catch(() => {});
      }
    } catch (dbErr) {
      console.warn("[SearchIntelligenceService] Opportunity DB persistence warning:", dbErr.message);
    }

    syncResult.available = true;
    syncResult.source = rawGsc.source;
    syncResult.queryCount = normalizedRecords.length;
    syncResult.clusterCount = queryClusters.length;
    syncResult.opportunitiesCount = opportunities.length;

    memoryCache = {
      ...syncResult,
      opportunities,
      lastSyncAt: new Date().toISOString(),
    };

    return syncResult;
  } catch (error) {
    console.warn("[SearchIntelligenceService] Sync warning. Degrading gracefully:", error.message);
    syncResult.error = error.message;
    syncResult.available = false;
    memoryCache = { ...syncResult, opportunities: [] };
    return syncResult;
  }
}

export async function getCachedSearchOpportunities({ minScore = 50, limit = 20 } = {}) {
  // If memory cache is fresh (< 30 minutes), return it directly
  if (memoryCache.lastSyncAt && (Date.now() - new Date(memoryCache.lastSyncAt).getTime()) < 30 * 60 * 1000) {
    const filtered = memoryCache.opportunities
      .filter((o) => (o.opportunityScore || 0) >= minScore)
      .slice(0, limit);

    return {
      available: memoryCache.available,
      source: memoryCache.source,
      count: filtered.length,
      opportunities: filtered,
      lastSyncAt: memoryCache.lastSyncAt,
    };
  }

  // Otherwise, attempt DB lookup
  try {
    await dbConnect();
    const docs = await SearchOpportunity.find({ opportunityScore: { $gte: minScore } })
      .sort({ opportunityScore: -1 })
      .limit(limit)
      .lean();

    if (docs.length > 0) {
      return {
        available: true,
        source: "search_opportunity_db",
        count: docs.length,
        opportunities: docs,
        lastSyncAt: docs[0].lastSyncAt || new Date().toISOString(),
      };
    }
  } catch {
    // Database catch
  }

  return {
    available: false,
    source: null,
    count: 0,
    opportunities: [],
    lastSyncAt: null,
  };
}

export async function getSearchIntelligenceStatus() {
  const gscConfigured = Boolean(
    process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY && process.env.GSC_PROPERTY_URL
  );

  let storedOpportunityCount = 0;
  try {
    await dbConnect();
    storedOpportunityCount = await SearchOpportunity.countDocuments().catch(() => 0);
  } catch {
    // Database catch
  }

  return {
    gscConfigured,
    available: memoryCache.available || storedOpportunityCount > 0,
    source: memoryCache.source || (storedOpportunityCount > 0 ? "search_opportunity_db" : "unconfigured"),
    lastSyncAt: memoryCache.lastSyncAt,
    queryCount: memoryCache.queryCount,
    clusterCount: memoryCache.clusterCount,
    storedOpportunityCount,
    timestamp: new Date().toISOString(),
  };
}
