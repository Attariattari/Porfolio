/**
 * Main Layout Providers
 * 
 * Sets up React Query and other providers for the main site
 * with optimized caching configuration for navigation
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function MainProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // P0 OPTIMIZATION: Aggressive caching for repeat visits
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache memory
        retry: 1, // Single retry on failure
        refetchOnWindowFocus: false, // Don't refetch on tab focus
        refetchOnReconnect: 'stale', // Only refetch if data is stale
        refetchOnMount: 'stale', // Only refetch if data is stale
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
