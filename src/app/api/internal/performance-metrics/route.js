/**
 * Performance Monitor API Endpoint
 * GET /api/internal/performance-metrics
 * 
 * Returns navigation performance metrics collected during the session
 */

import { performanceMonitor } from '@/lib/performanceMonitor';

export async function GET(req) {
  try {
    const stats = performanceMonitor.getStats();
    const breakdown = performanceMonitor.getTimingBreakdown();
    const recent = performanceMonitor.getRecent(20);

    return Response.json({
      success: true,
      data: {
        statistics: stats,
        timingBreakdown: breakdown,
        recentNavigations: recent,
        cacheStats: {
          // Cache info would go here
          status: 'active',
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
