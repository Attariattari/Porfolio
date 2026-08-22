"use client";

import { useEffect } from "react";
import {
  getPersistentCache,
  setPersistentCache,
  mergeCollectionDelta,
  getLatestTimestamp,
  emitPublicCacheUpdate,
} from "@/lib/cache/publicCache";

/**
 * PublicDeltaSync Component
 * Runs silently in the background on the public site.
 * Queries the server for incremental changes only (new blogs, updated services, edited projects)
 * and updates the local persistent cache seamlessly.
 */
export default function PublicDeltaSync() {
  useEffect(() => {
    let cancelled = false;

    const performIncrementalSync = async () => {
      try {
        // Collect timestamps of cached collections
        const cachedBlogs = getPersistentCache("blogs") || [];
        const cachedProjects = getPersistentCache("projects") || [];
        const cachedServices = getPersistentCache("services") || [];
        const cachedSkills = getPersistentCache("skills") || [];
        const cachedSettings = getPersistentCache("settings") || {};

        const timestamps = {
          blogs: getLatestTimestamp(cachedBlogs),
          projects: getLatestTimestamp(cachedProjects),
          services: getLatestTimestamp(cachedServices),
          skills: getLatestTimestamp(cachedSkills),
          settings: getLatestTimestamp(cachedSettings),
        };

        const res = await fetch("/api/sync/public", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamps }),
          cache: "no-store",
        });

        if (!res.ok || cancelled) return;
        const result = await res.json();

        if (!result.success || !result.hasUpdates || !result.deltas) return;

        // Apply deltas incrementally
        const { deltas } = result;

        if (deltas.blogs && deltas.blogs.length > 0) {
          const merged = mergeCollectionDelta(cachedBlogs, deltas.blogs);
          setPersistentCache("blogs", merged);
          emitPublicCacheUpdate("blogs", merged);
        }

        if (deltas.projects && deltas.projects.length > 0) {
          const merged = mergeCollectionDelta(cachedProjects, deltas.projects);
          setPersistentCache("projects", merged);
          emitPublicCacheUpdate("projects", merged);
        }

        if (deltas.services && deltas.services.length > 0) {
          const merged = mergeCollectionDelta(cachedServices, deltas.services);
          setPersistentCache("services", merged);
          emitPublicCacheUpdate("services", merged);
        }

        if (deltas.skills && deltas.skills.length > 0) {
          const merged = mergeCollectionDelta(cachedSkills, deltas.skills);
          setPersistentCache("skills", merged);
          emitPublicCacheUpdate("skills", merged);
        }

        if (deltas.settings) {
          setPersistentCache("settings", deltas.settings);
          emitPublicCacheUpdate("settings", deltas.settings);
        }
      } catch (err) {
        // Fail silently in background without disrupting user
      }
    };

    // Run when browser is idle (after 2 seconds) to avoid CPU contention during initial render
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => performIncrementalSync());
      } else {
        performIncrementalSync();
      }
    }, 2000);

    // Listen for instant network reconnection event
    const handleReconnected = () => {
      performIncrementalSync();
    };

    window.addEventListener("muhyo:network-reconnected", handleReconnected);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("muhyo:network-reconnected", handleReconnected);
    };
  }, []);

  return null;
}
