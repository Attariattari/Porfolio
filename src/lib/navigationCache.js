/**
 * Navigation Cache Management System
 * 
 * Purpose: Manage client-side caching of page data to enable instant navigation
 * Features:
 * - In-memory cache with sessionStorage persistence
 * - Automatic cache invalidation
 * - Background refresh without blocking UI
 * - Graceful fallback to server data
 */

const CACHE_PREFIX = 'nav-cache-';
const CACHE_METADATA_KEY = 'nav-cache-metadata';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes default

class NavigationCache {
  constructor() {
    this.memory = new Map();
    this.listeners = new Set();
    this.pendingRefreshes = new Map();
  }

  /**
   * Generate cache key from route
   */
  getCacheKey(route) {
    return `${CACHE_PREFIX}${route}`;
  }

  /**
   * Set route cache
   */
  set(route, data, ttl = CACHE_TTL) {
    const key = this.getCacheKey(route);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      version: 1,
    };

    // Memory cache
    this.memory.set(route, cacheEntry);

    // SessionStorage persistence
    try {
      sessionStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (e) {
      console.warn('[NavigationCache] SessionStorage unavailable:', e);
    }

    this.notifyListeners('cache-set', { route, entry: cacheEntry });
  }

  /**
   * Get route cache
   */
  get(route) {
    const key = this.getCacheKey(route);
    
    // Check memory first
    if (this.memory.has(route)) {
      const entry = this.memory.get(route);
      if (!this.isExpired(entry)) {
        return entry.data;
      }
      this.memory.delete(route);
    }

    // Check sessionStorage
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const entry = JSON.parse(cached);
        if (!this.isExpired(entry)) {
          this.memory.set(route, entry);
          return entry.data;
        }
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[NavigationCache] SessionStorage read error:', e);
    }

    return null;
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(entry) {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Invalidate specific route cache
   */
  invalidate(route) {
    const key = this.getCacheKey(route);
    this.memory.delete(route);
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('[NavigationCache] SessionStorage removal error:', e);
    }
    this.notifyListeners('cache-invalidated', { route });
  }

  /**
   * Invalidate cache by pattern (e.g., 'projects/*')
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const route of this.memory.keys()) {
      if (regex.test(route)) {
        this.invalidate(route);
      }
    }
  }

  /**
   * Clear all caches
   */
  clear() {
    this.memory.clear();
    try {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith(CACHE_PREFIX));
      keys.forEach(k => sessionStorage.removeItem(k));
    } catch (e) {
      console.warn('[NavigationCache] SessionStorage clear error:', e);
    }
    this.notifyListeners('cache-cleared', {});
  }

  /**
   * Register cache listener
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (e) {
        console.error('[NavigationCache] Listener error:', e);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalSize = 0;
    let expiredCount = 0;
    let activeCount = 0;

    for (const entry of this.memory.values()) {
      if (this.isExpired(entry)) {
        expiredCount++;
      } else {
        activeCount++;
        try {
          totalSize += JSON.stringify(entry).length;
        } catch (e) {}
      }
    }

    return {
      totalEntries: this.memory.size,
      activeEntries: activeCount,
      expiredEntries: expiredCount,
      estimatedSizeKB: (totalSize / 1024).toFixed(2),
    };
  }

  /**
   * Warm up cache before navigation
   */
  async prefetchRoute(route, fetchFn) {
    if (this.get(route)) {
      return; // Already cached
    }

    // Prevent duplicate fetches
    if (this.pendingRefreshes.has(route)) {
      return this.pendingRefreshes.get(route);
    }

    const promise = (async () => {
      try {
        const data = await fetchFn();
        this.set(route, data);
        return data;
      } catch (error) {
        console.error('[NavigationCache] Prefetch error:', error);
        return null;
      } finally {
        this.pendingRefreshes.delete(route);
      }
    })();

    this.pendingRefreshes.set(route, promise);
    return promise;
  }
}

// Export singleton instance
export const navigationCache = new NavigationCache();

export default NavigationCache;
