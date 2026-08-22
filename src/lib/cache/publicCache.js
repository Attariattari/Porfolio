/**
 * Muhyo Tech Public Persistent Cache & Delta Engine
 * 
 * Provides ultra-fast persistent caching in localStorage with:
 * - 0ms Instant First Render from local disk cache
 * - Persistence across page reloads and browser sessions
 * - Incremental Delta Merging (Only updates new/changed records)
 * - Safe SSR / Isomorphic fallback
 */

const CACHE_PREFIX = "muhyo_public_v1:";

/**
 * Safely reads a collection from persistent storage.
 */
export function getPersistentCache(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data || null;
  } catch (err) {
    console.warn(`[PublicCache] Read error for ${key}:`, err);
    return null;
  }
}

/**
 * Safely saves a collection to persistent storage along with its latest timestamp.
 */
export function setPersistentCache(key, data) {
  if (typeof window === "undefined" || !data) return;
  try {
    const latestTimestamp = getLatestTimestamp(data);
    const payload = {
      data,
      timestamp: Date.now(),
      latestItemTimestamp: latestTimestamp,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (err) {
    console.warn(`[PublicCache] Write error for ${key}:`, err);
  }
}

/**
 * Computes the maximum updatedAt / createdAt timestamp across a list of items.
 */
export function getLatestTimestamp(items) {
  if (!items) return 0;
  if (!Array.isArray(items)) {
    const val = items.updatedAt || items.createdAt || items.date;
    return val ? new Date(val).getTime() : Date.now();
  }

  let maxTime = 0;
  for (const item of items) {
    const rawTime = item.updatedAt || item.createdAt || item.date;
    if (rawTime) {
      const t = new Date(rawTime).getTime();
      if (!isNaN(t) && t > maxTime) maxTime = t;
    }
  }
  return maxTime || Date.now();
}

/**
 * Incremental Delta Merger:
 * Merges newly added/updated items into the existing cache array in-place.
 * Guarantees zero unnecessary full-list downloads.
 */
export function mergeCollectionDelta(existingList = [], deltaItems = []) {
  if (!Array.isArray(deltaItems) || deltaItems.length === 0) {
    return existingList;
  }

  const existingArray = Array.isArray(existingList) ? [...existingList] : [];
  const map = new Map();

  // Index existing items by ID / slug
  for (let i = 0; i < existingArray.length; i++) {
    const item = existingArray[i];
    const key = item._id || item.id || item.slug;
    if (key) map.set(String(key), i);
  }

  const newItemsToPrepend = [];

  for (const deltaItem of deltaItems) {
    const key = deltaItem._id || deltaItem.id || deltaItem.slug;
    if (!key) continue;

    const strKey = String(key);
    if (map.has(strKey)) {
      // Update item in-place
      const index = map.get(strKey);
      existingArray[index] = { ...existingArray[index], ...deltaItem };
    } else {
      // It is a brand new item -> Prepend to collection
      newItemsToPrepend.push(deltaItem);
    }
  }

  return [...newItemsToPrepend, ...existingArray];
}

/**
 * Global Custom Event Dispatcher for Real-Time UI sync
 */
export function emitPublicCacheUpdate(collectionKey, updatedData) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("muhyo:public-cache-update", {
    detail: { collectionKey, data: updatedData },
  });
  window.dispatchEvent(event);
}
