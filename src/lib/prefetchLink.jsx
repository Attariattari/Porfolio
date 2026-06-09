/**
 * Link Prefetch Utility
 * 
 * Enables intelligent prefetching of routes and their data
 * Works with Next.js Link component prefetch
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { navigationCache } from '@/lib/navigationCache';

/**
 * Enhanced Link component with data prefetching
 * 
 * Usage:
 * <PrefetchLink href="/blog" prefetchData={() => fetch('/api/blogs').then(r => r.json())}>
 *   Blog
 * </PrefetchLink>
 */
export function PrefetchLink({
  href,
  prefetchData,
  onPrefetchComplete,
  children,
  ...props
}) {
  const [isPrefetching, setIsPrefetching] = useState(false);

  const handleMouseEnter = async () => {
    if (!prefetchData || navigationCache.get(href)) {
      return; // Already cached
    }

    setIsPrefetching(true);
    try {
      const data = await prefetchData();
      navigationCache.set(href, data);
      if (onPrefetchComplete) {
        onPrefetchComplete(data);
      }
    } catch (error) {
      console.warn('[PrefetchLink] Prefetch failed:', error);
    } finally {
      setIsPrefetching(false);
    }
  };

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Route prefetcher - preload data for a route
 */
export async function prefetchRoute(route, fetchFn) {
  return navigationCache.prefetchRoute(route, fetchFn);
}

/**
 * Batch prefetch multiple routes
 */
export async function prefetchRoutes(routes) {
  return Promise.allSettled(
    routes.map(({ route, fetch }) => navigationCache.prefetchRoute(route, fetch))
  );
}

export default PrefetchLink;
