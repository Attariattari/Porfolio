/**
 * Research Cache & Fingerprint Engine
 * 
 * Manages deterministic fingerprinting and caching of research packages in MongoDB.
 * Prevents redundant, expensive external search and AI research calls.
 */

import crypto from "node:crypto";
import dbConnect from "../../../dbConnect.js";
import { BlogResearch } from "../../../../models/BlogResearch.js";

const DEFAULT_CACHE_TTL_DAYS = 7;

/**
 * Builds a deterministic research fingerprint based on relevant topic inputs.
 */
export function buildResearchFingerprint(topic = {}) {
  const normTitle = String(topic.title || topic.topicTitle || "").toLowerCase().trim();
  const normKeyword = String(topic.focusKeyword || "").toLowerCase().trim();
  const normIntent = String(topic.searchIntent || topic.intent || "informational").toLowerCase().trim();
  const normCategory = String(topic.contentCategory || topic.pillar || "").toLowerCase().trim();

  const rawKey = [normTitle, normKeyword, normIntent, normCategory].filter(Boolean).join("::");
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Retrieves valid cached research from MongoDB if unexpired.
 */
export async function getCachedResearch(fingerprint) {
  if (!fingerprint) return null;

  try {
    await dbConnect();
    const cached = await BlogResearch.findOne({
      researchFingerprint: fingerprint,
      status: { $in: ["completed", "cached", "partial"] },
      expiresAt: { $gt: new Date() },
    }).lean();

    if (cached) {
      console.log(`[ResearchCache] Cache HIT for fingerprint: ${fingerprint.slice(0, 10)}...`);
      return {
        ...cached,
        status: "cached",
      };
    }
  } catch (error) {
    console.warn("[ResearchCache] Cache lookup warning:", error.message);
  }

  return null;
}

/**
 * Saves or updates a research package in MongoDB.
 */
export async function saveResearchToCache(researchPackage = {}, ttlDays = DEFAULT_CACHE_TTL_DAYS) {
  if (!researchPackage.researchFingerprint) return null;

  try {
    await dbConnect();
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    const filter = { researchFingerprint: researchPackage.researchFingerprint };
    const update = {
      $set: {
        ...researchPackage,
        expiresAt,
        updatedAt: new Date(),
      },
    };
    const options = { upsert: true, new: true };

    const saved = await BlogResearch.findOneAndUpdate(filter, update, options);
    console.log(`[ResearchCache] Research saved to cache. Expires: ${expiresAt.toISOString().slice(0, 10)}`);
    return saved;
  } catch (error) {
    console.warn("[ResearchCache] Failed to save research to cache:", error.message);
    return null;
  }
}
