/**
 * useNavigationCache Hook
 * 
 * Provides client-side caching for route navigation
 * Integrates with React Query for optimal performance
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { navigationCache } from '@/lib/navigationCache';
import { scrollRestoration } from '@/lib/scrollRestoration';
import { performanceMonitor } from '@/lib/performanceMonitor';

export function useNavigationCache() {
  const pathname = usePathname();
  const navigationStartRef = useRef(null);
  const previousPathnameRef = useRef(null);

  // Track navigation timing
  useEffect(() => {
    navigationStartRef.current = performance.now();
    performanceMonitor.startNavigation(pathname);

    // Check if this is a repeat visit
    const cached = navigationCache.get(pathname);
    if (cached) {
      performanceMonitor.markRepeatVisit();
    }

    // Save scroll position for previous route
    if (previousPathnameRef.current) {
      scrollRestoration.savePosition(previousPathnameRef.current);
    }

    previousPathnameRef.current = pathname;

    return () => {
      // Navigation is ending - record metrics
      const endTime = performance.now();
      const duration = endTime - (navigationStartRef.current || endTime);
      
      performanceMonitor.endNavigation({
        fromCache: !!cached,
        cacheHit: !!cached,
      });
    };
  }, [pathname]);

  // Get cache and set
  const getCachedData = useCallback((route) => {
    return navigationCache.get(route);
  }, []);

  const setCachedData = useCallback((route, data) => {
    navigationCache.set(route, data);
  }, []);

  const invalidateCache = useCallback((route) => {
    navigationCache.invalidate(route);
  }, []);

  const invalidatePattern = useCallback((pattern) => {
    navigationCache.invalidatePattern(pattern);
  }, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    invalidatePattern,
    currentRoute: pathname,
  };
}

export default useNavigationCache;
