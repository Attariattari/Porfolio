/**
 * Navigation Performance Watcher
 * 
 * Tracks and optimizes navigation performance globally
 * - Monitors route transitions
 * - Manages cache invalidation
 * - Tracks performance metrics
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNavigationCache } from '@/lib/hooks/useNavigationCache';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';
import { navigationCache } from '@/lib/navigationCache';
import { scrollRestoration } from '@/lib/scrollRestoration';
import { performanceMonitor } from '@/lib/performanceMonitor';

/**
 * Development mode performance logger
 */
function logPerformanceMetrics() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Check if user wants to see perf metrics
    const showMetrics = sessionStorage.getItem('show-perf-metrics');
    if (showMetrics) {
      const stats = performanceMonitor.getStats();
      const breakdown = performanceMonitor.getTimingBreakdown();
      
      console.log('%c📊 NAVIGATION PERFORMANCE', 'font-size: 14px; font-weight: bold; color: #00d084;');
      console.table({
        'Total Navigations': stats.totalNavigations,
        'Avg Duration': stats.averageDuration + 'ms',
        'Cache Hit Rate': stats.cacheHitRate + '%',
        'Instant Navigation': breakdown.instant,
        'Fast Navigation': breakdown.fast,
      });
    }
  }
}

export default function NavigationWatcher() {
  const pathname = usePathname();
  useNavigationCache();
  useScrollRestoration();

  useEffect(() => {
    // Log performance metrics in development
    logPerformanceMetrics();

    // Set up cache invalidation patterns for admin updates
    // When data is updated in admin, invalidate related caches
    const handleCacheInvalidation = (event) => {
      if (event.detail?.type === 'admin-update') {
        const { entityType } = event.detail;
        
        // Invalidate relevant route caches
        const patterns = {
          'project': '/projects/*',
          'blog': '/blog/*',
          'skill': '/*',
          'service': '/services/*',
        };

        const pattern = patterns[entityType];
        if (pattern) {
          navigationCache.invalidatePattern(pattern);
        }
      }
    };

    window.addEventListener('nav-cache-invalidate', handleCacheInvalidation);

    return () => {
      window.removeEventListener('nav-cache-invalidate', handleCacheInvalidation);
    };
  }, [pathname]);

  return null;
}

/**
 * Helper to trigger cache invalidation from admin
 */
export function invalidateNavigationCache(entityType) {
  window.dispatchEvent(
    new CustomEvent('nav-cache-invalidate', {
      detail: { type: 'admin-update', entityType },
    })
  );
}
