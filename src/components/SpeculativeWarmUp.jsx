"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  startSpeculativeWarmUp,
  prefetchOnHover,
} from "@/lib/cache/speculativePrefetchEngine";

/**
 * SpeculativeWarmUp Component
 * 
 * - Silently pre-warms routes & content data during idle browser time.
 * - Listens for link hover / touch events for instant micro-prefetching.
 * - Zero impact on Initial Page Load / Core Web Vitals.
 */
export default function SpeculativeWarmUp() {
  const router = useRouter();

  useEffect(() => {
    // 1. Wait 2.5s after mount so Initial Render & Animations finish with 100% CPU dedication
    const timer = setTimeout(() => {
      startSpeculativeWarmUp(router);
    }, 2500);

    // 2. Global Hover / TouchStart Intent Listener
    const handlePointerOver = (e) => {
      const anchor = e.target?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      // Only internal routes (starting with / and not admin/api)
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/admin") &&
        !href.startsWith("/api") &&
        !href.startsWith("//")
      ) {
        prefetchOnHover(href, router);
      }
    };

    document.addEventListener("pointerover", handlePointerOver, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchstart", handlePointerOver, {
      passive: true,
      capture: true,
    });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerover", handlePointerOver, {
        capture: true,
      });
      document.removeEventListener("touchstart", handlePointerOver, {
        capture: true,
      });
    };
  }, [router]);

  return null;
}
