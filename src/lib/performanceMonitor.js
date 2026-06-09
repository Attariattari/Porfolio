/**
 * Navigation Performance Monitor
 * 
 * Purpose: Track and report navigation performance metrics
 * Metrics tracked:
 * - Time to Interactive (TTI)
 * - First Paint (FP)
 * - First Contentful Paint (FCP)
 * - Page Load Time
 * - Navigation Timing
 * - Cache Hit Rate
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.sessions = new Map();
    this.navigationStart = null;
    this.currentRoute = null;
    this.maxMetrics = 100;
  }

  /**
   * Start tracking a navigation
   */
  startNavigation(route) {
    this.navigationStart = {
      route,
      startTime: performance.now(),
      timestamp: new Date().toISOString(),
      isRepeatVisit: false,
    };
    this.currentRoute = route;
  }

  /**
   * Complete navigation tracking
   */
  endNavigation(options = {}) {
    if (!this.navigationStart) return;

    const endTime = performance.now();
    const duration = endTime - this.navigationStart.startTime;

    const metric = {
      ...this.navigationStart,
      endTime,
      duration,
      fromCache: options.fromCache || false,
      showedLoader: options.showedLoader || false,
      dataFetched: options.dataFetched || false,
      cacheHit: options.cacheHit || false,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.navigationStart = null;
    return metric;
  }

  /**
   * Mark navigation as repeat visit
   */
  markRepeatVisit() {
    if (this.navigationStart) {
      this.navigationStart.isRepeatVisit = true;
    }
  }

  /**
   * Record a complete navigation with timing
   */
  recordNavigation(route, duration, fromCache = false, showedLoader = false) {
    const metric = {
      route,
      timestamp: new Date().toISOString(),
      duration,
      fromCache,
      showedLoader,
      isRepeatVisit: !showedLoader,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    return metric;
  }

  /**
   * Get metrics for a specific route
   */
  getRouteMetrics(route) {
    return this.metrics.filter(m => m.route === route);
  }

  /**
   * Get statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalNavigations: 0,
        averageDuration: 0,
        averageDurationFromCache: 0,
        averageDurationFresh: 0,
        cacheHitRate: 0,
        loaderShownRate: 0,
        fastNavigations: 0,
        slowNavigations: 0,
      };
    }

    const cachedMetrics = this.metrics.filter(m => m.fromCache);
    const freshMetrics = this.metrics.filter(m => !m.fromCache);
    const loaderMetrics = this.metrics.filter(m => m.showedLoader);

    const FAST_THRESHOLD = 300; // 300ms
    const SLOW_THRESHOLD = 2000; // 2 seconds

    return {
      totalNavigations: this.metrics.length,
      averageDuration: (this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length).toFixed(2),
      averageDurationFromCache: cachedMetrics.length > 0 
        ? (cachedMetrics.reduce((sum, m) => sum + m.duration, 0) / cachedMetrics.length).toFixed(2)
        : 'N/A',
      averageDurationFresh: freshMetrics.length > 0
        ? (freshMetrics.reduce((sum, m) => sum + m.duration, 0) / freshMetrics.length).toFixed(2)
        : 'N/A',
      cacheHitRate: ((cachedMetrics.length / this.metrics.length) * 100).toFixed(1),
      loaderShownRate: ((loaderMetrics.length / this.metrics.length) * 100).toFixed(1),
      fastNavigations: this.metrics.filter(m => m.duration < FAST_THRESHOLD).length,
      slowNavigations: this.metrics.filter(m => m.duration > SLOW_THRESHOLD).length,
      minDuration: Math.min(...this.metrics.map(m => m.duration)).toFixed(2),
      maxDuration: Math.max(...this.metrics.map(m => m.duration)).toFixed(2),
    };
  }

  /**
   * Get recent navigations
   */
  getRecent(count = 10) {
    return this.metrics.slice(-count).reverse();
  }

  /**
   * Get timing breakdown
   */
  getTimingBreakdown() {
    const breakdown = {
      instant: this.metrics.filter(m => m.duration < 100).length,
      fast: this.metrics.filter(m => m.duration >= 100 && m.duration < 300).length,
      moderate: this.metrics.filter(m => m.duration >= 300 && m.duration < 1000).length,
      slow: this.metrics.filter(m => m.duration >= 1000 && m.duration < 2000).length,
      verySlow: this.metrics.filter(m => m.duration >= 2000).length,
    };

    return {
      ...breakdown,
      total: this.metrics.length,
      breakdown,
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.navigationStart = null;
  }

  /**
   * Export metrics as JSON
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      timingBreakdown: this.getTimingBreakdown(),
      recentNavigations: this.getRecent(20),
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.getStats();
    const breakdown = this.getTimingBreakdown();

    return `
╔════════════════════════════════════════════════════════════════╗
║         NAVIGATION PERFORMANCE REPORT                          ║
╠════════════════════════════════════════════════════════════════╣
║ Total Navigations: ${String(stats.totalNavigations).padEnd(40)}║
║ Average Duration: ${String(stats.averageDuration + 'ms').padEnd(40)}║
║ Cached Average: ${String(stats.averageDurationFromCache + 'ms').padEnd(43)}║
║ Fresh Average: ${String(stats.averageDurationFresh + 'ms').padEnd(44)}║
║ Cache Hit Rate: ${String(stats.cacheHitRate + '%').padEnd(42)}║
║ Loader Shown: ${String(stats.loaderShownRate + '%').padEnd(44)}║
║                                                                ║
║ TIMING BREAKDOWN:                                              ║
║   Instant (<100ms): ${String(breakdown.instant).padEnd(44)}║
║   Fast (100-300ms): ${String(breakdown.fast).padEnd(44)}║
║   Moderate (300-1s): ${String(breakdown.moderate).padEnd(43)}║
║   Slow (1-2s): ${String(breakdown.slow).padEnd(51)}║
║   Very Slow (>2s): ${String(breakdown.verySlow).padEnd(47)}║
╚════════════════════════════════════════════════════════════════╝
    `;
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
