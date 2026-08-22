/**
 * Service Intelligence Snapshot & Cache Manager (Phase 3)
 * 
 * Provides a high-performance, in-memory cached snapshot of active MongoDB services
 * enriched with Knowledge Base and Classification profiles.
 * 
 * Features:
 * - Authoritative runtime source: Live MongoDB Service collection
 * - Seed fallback resilience
 * - Zero N+1 DB queries during batch topic matching
 * - Cache invalidation interface for admin service updates
 */

import mongoose from "mongoose";
import dbConnect from "../../../dbConnect.js";
import Service from "../../../../models/Service.js";
import { servicesSeedData } from "../../../../data/services.seed.js";
import { getServiceKnowledgeProfile } from "./serviceKnowledgeBase.js";
import { classifyService } from "./serviceClassificationEngine.js";

let cachedSnapshot = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Normalizes a raw DB or seed service object into a unified intelligence snapshot item.
 */
function normalizeSnapshotItem(svc) {
  const slug = svc.slug || "";
  const kbProfile = getServiceKnowledgeProfile(slug);
  const classProfile = svc.classification?.primaryCategory ? svc.classification : classifyService(slug);

  const title = svc.title || classProfile?.serviceTitle || slug;
  const shortDescription = svc.shortDescription || svc.description || kbProfile?.whatItIs || "";
  const fullDescription = svc.fullDescription || svc.overview || shortDescription;

  const problemsSolved = Array.isArray(svc.problemsSolved)
    ? svc.problemsSolved.map((p) => (typeof p === "string" ? p : p.title || p.description))
    : (kbProfile?.problemsSolved || []);

  const deliverables = Array.isArray(svc.deliverables)
    ? svc.deliverables.map((d) => (typeof d === "string" ? d : d.title || d.description))
    : (kbProfile?.deliverables || []);

  const technologies = Array.isArray(svc.technologies) && svc.technologies.length > 0
    ? svc.technologies
    : (Array.isArray(svc.techStack) ? svc.techStack : (classProfile?.technologies || []));

  const keywords = Array.isArray(svc.keywords)
    ? svc.keywords
    : (Array.isArray(svc.targetKeywords) ? svc.targetKeywords : []);

  return {
    slug,
    title,
    category: svc.category || classProfile?.primaryCategory || "Web Development",
    shortDescription,
    fullDescription,
    problemsSolved,
    deliverables,
    technologies: technologies.map((t) => String(t).toLowerCase()),
    keywords: keywords.map((k) => String(k).toLowerCase()),
    targetAudienceProfiles: svc.targetAudienceProfiles?.length ? svc.targetAudienceProfiles : (kbProfile?.whoNeedsIt || []),
    buyerIntentTriggers: svc.buyerIntentTriggers?.length ? svc.buyerIntentTriggers : (kbProfile?.whenTheyNeedIt || []),
    commonObjections: svc.commonObjections?.length ? svc.commonObjections : (kbProfile?.commonObjections || []),
    classification: classProfile,
    knowledgeBase: kbProfile,
    status: svc.status || svc.publishStatus || "published",
    isFeatured: Boolean(svc.isFeatured ?? svc.featured),
  };
}

/**
 * Returns the normalized Service Intelligence Snapshot array.
 * 
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<Array<Object>>}
 */
export async function getServiceIntelligenceSnapshot(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cachedSnapshot && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSnapshot;
  }

  let dbDocs = [];

  try {
    await dbConnect();
    if (mongoose.connection && mongoose.connection.readyState === 1 && Service) {
      dbDocs = await Service.find({
        $or: [{ status: "published" }, { publishStatus: "published" }, { status: { $exists: false } }]
      }).lean();
    }
  } catch (err) {
    console.warn("[ServiceSnapshot] DB query warning (falling back to seed):", err.message);
  }

  const rawList = dbDocs.length > 0 ? dbDocs : servicesSeedData;
  const snapshot = rawList.map(normalizeSnapshotItem);

  cachedSnapshot = snapshot;
  lastCacheTime = now;

  return snapshot;
}

/**
 * Synchronous fallback getter for non-async contexts.
 */
export function getServiceIntelligenceSnapshotSync() {
  if (cachedSnapshot) return cachedSnapshot;
  return servicesSeedData.map(normalizeSnapshotItem);
}

/**
 * Invalidates the snapshot cache forcing a refresh on next call.
 */
export function invalidateServiceSnapshotCache() {
  cachedSnapshot = null;
  lastCacheTime = 0;
}
