"use client";

import { useState, useEffect } from "react";
import {
  getPersistentCache,
  setPersistentCache,
} from "@/lib/cache/publicCache";

/**
 * usePublicContent Hook
 * Provides instant 0ms persistent rendering from localStorage with automatic background sync.
 */
export function usePublicContent(collectionKey, initialServerData) {
  const [data, setData] = useState(() => {
    if (
      initialServerData &&
      (Array.isArray(initialServerData)
        ? initialServerData.length > 0
        : Object.keys(initialServerData).length > 0)
    ) {
      return initialServerData;
    }
    const cached = getPersistentCache(collectionKey);
    return cached || initialServerData;
  });

  useEffect(() => {
    // Save fresh server data to persistent cache
    if (initialServerData) {
      setPersistentCache(collectionKey, initialServerData);
    }

    // Listen for background incremental delta updates
    const handleUpdate = (event) => {
      if (event.detail?.collectionKey === collectionKey && event.detail?.data) {
        setData(event.detail.data);
      }
    };

    window.addEventListener("muhyo:public-cache-update", handleUpdate);
    return () => window.removeEventListener("muhyo:public-cache-update", handleUpdate);
  }, [collectionKey, initialServerData]);

  return data;
}
