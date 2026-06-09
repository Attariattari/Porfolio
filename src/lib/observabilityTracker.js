/**
 * Enterprise Production Observability System
 * Tracks frontend and backend performance metrics
 */

const performanceMetrics = {
  frontend: {
    pageLoadTime: [],
    navigationTime: [],
    hydrationTime: [],
    lcp: [], // Largest Contentful Paint
    fcp: [], // First Contentful Paint
    cls: [], // Cumulative Layout Shift
    avgPageLoad: 0,
    avgNavigation: 0,
    avgHydration: 0,
    avgLcp: 0,
    avgFcp: 0,
    avgCls: 0,
  },
  backend: {
    apiResponseTime: [],
    dbQueryTime: [],
    cacheHitRate: 0,
    memoryUsage: [],
    cpuUsage: [],
    avgApiResponse: 0,
    avgDbQuery: 0,
    avgMemory: 0,
    avgCpu: 0,
  },
};

const MAX_METRICS = 500; // Keep last 500 measurements

/**
 * Frontend metrics tracker
 */
export const observabilityTracker = {
  /**
   * Record frontend Web Vitals
   */
  recordWebVitals: (vitals) => {
    if (vitals.pageLoadTime) {
      performanceMetrics.frontend.pageLoadTime.push(vitals.pageLoadTime);
      if (performanceMetrics.frontend.pageLoadTime.length > MAX_METRICS) {
        performanceMetrics.frontend.pageLoadTime.shift();
      }
      performanceMetrics.frontend.avgPageLoad =
        performanceMetrics.frontend.pageLoadTime.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.pageLoadTime.length;
    }

    if (vitals.navigationTime) {
      performanceMetrics.frontend.navigationTime.push(vitals.navigationTime);
      if (performanceMetrics.frontend.navigationTime.length > MAX_METRICS) {
        performanceMetrics.frontend.navigationTime.shift();
      }
      performanceMetrics.frontend.avgNavigation =
        performanceMetrics.frontend.navigationTime.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.navigationTime.length;
    }

    if (vitals.hydrationTime) {
      performanceMetrics.frontend.hydrationTime.push(vitals.hydrationTime);
      if (performanceMetrics.frontend.hydrationTime.length > MAX_METRICS) {
        performanceMetrics.frontend.hydrationTime.shift();
      }
      performanceMetrics.frontend.avgHydration =
        performanceMetrics.frontend.hydrationTime.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.hydrationTime.length;
    }

    if (vitals.lcp) {
      performanceMetrics.frontend.lcp.push(vitals.lcp);
      if (performanceMetrics.frontend.lcp.length > MAX_METRICS) {
        performanceMetrics.frontend.lcp.shift();
      }
      performanceMetrics.frontend.avgLcp =
        performanceMetrics.frontend.lcp.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.lcp.length;
    }

    if (vitals.fcp) {
      performanceMetrics.frontend.fcp.push(vitals.fcp);
      if (performanceMetrics.frontend.fcp.length > MAX_METRICS) {
        performanceMetrics.frontend.fcp.shift();
      }
      performanceMetrics.frontend.avgFcp =
        performanceMetrics.frontend.fcp.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.fcp.length;
    }

    if (vitals.cls !== undefined) {
      performanceMetrics.frontend.cls.push(vitals.cls);
      if (performanceMetrics.frontend.cls.length > MAX_METRICS) {
        performanceMetrics.frontend.cls.shift();
      }
      performanceMetrics.frontend.avgCls =
        performanceMetrics.frontend.cls.reduce((a, b) => a + b, 0) /
        performanceMetrics.frontend.cls.length;
    }
  },

  /**
   * Record backend API response time
   */
  recordApiResponseTime: (responseTime) => {
    performanceMetrics.backend.apiResponseTime.push(responseTime);
    if (performanceMetrics.backend.apiResponseTime.length > MAX_METRICS) {
      performanceMetrics.backend.apiResponseTime.shift();
    }
    performanceMetrics.backend.avgApiResponse =
      performanceMetrics.backend.apiResponseTime.reduce((a, b) => a + b, 0) /
      performanceMetrics.backend.apiResponseTime.length;
  },

  /**
   * Record database query time
   */
  recordDbQueryTime: (queryTime) => {
    performanceMetrics.backend.dbQueryTime.push(queryTime);
    if (performanceMetrics.backend.dbQueryTime.length > MAX_METRICS) {
      performanceMetrics.backend.dbQueryTime.shift();
    }
    performanceMetrics.backend.avgDbQuery =
      performanceMetrics.backend.dbQueryTime.reduce((a, b) => a + b, 0) /
      performanceMetrics.backend.dbQueryTime.length;
  },

  /**
   * Record cache hit rate
   */
  recordCacheHitRate: (hitRate) => {
    performanceMetrics.backend.cacheHitRate = hitRate;
  },

  /**
   * Record memory usage (in MB)
   */
  recordMemoryUsage: (memoryMb) => {
    performanceMetrics.backend.memoryUsage.push(memoryMb);
    if (performanceMetrics.backend.memoryUsage.length > MAX_METRICS) {
      performanceMetrics.backend.memoryUsage.shift();
    }
    performanceMetrics.backend.avgMemory =
      performanceMetrics.backend.memoryUsage.reduce((a, b) => a + b, 0) /
      performanceMetrics.backend.memoryUsage.length;
  },

  /**
   * Get current metrics
   */
  getMetrics: () => {
    return {
      frontend: {
        pageLoad: {
          current: performanceMetrics.frontend.pageLoadTime[performanceMetrics.frontend.pageLoadTime.length - 1] || 0,
          average: performanceMetrics.frontend.avgPageLoad,
          unit: "ms",
        },
        navigation: {
          current: performanceMetrics.frontend.navigationTime[performanceMetrics.frontend.navigationTime.length - 1] || 0,
          average: performanceMetrics.frontend.avgNavigation,
          unit: "ms",
        },
        hydration: {
          current: performanceMetrics.frontend.hydrationTime[performanceMetrics.frontend.hydrationTime.length - 1] || 0,
          average: performanceMetrics.frontend.avgHydration,
          unit: "ms",
        },
        lcp: {
          current: performanceMetrics.frontend.lcp[performanceMetrics.frontend.lcp.length - 1] || 0,
          average: performanceMetrics.frontend.avgLcp,
          unit: "ms",
          target: "2500ms", // Good LCP target
        },
        fcp: {
          current: performanceMetrics.frontend.fcp[performanceMetrics.frontend.fcp.length - 1] || 0,
          average: performanceMetrics.frontend.avgFcp,
          unit: "ms",
          target: "1800ms", // Good FCP target
        },
        cls: {
          current: performanceMetrics.frontend.cls[performanceMetrics.frontend.cls.length - 1] || 0,
          average: performanceMetrics.frontend.avgCls,
          unit: "score",
          target: "0.1", // Good CLS target
        },
      },
      backend: {
        apiResponse: {
          current: performanceMetrics.backend.apiResponseTime[performanceMetrics.backend.apiResponseTime.length - 1] || 0,
          average: performanceMetrics.backend.avgApiResponse,
          unit: "ms",
        },
        dbQuery: {
          current: performanceMetrics.backend.dbQueryTime[performanceMetrics.backend.dbQueryTime.length - 1] || 0,
          average: performanceMetrics.backend.avgDbQuery,
          unit: "ms",
        },
        cacheHitRate: {
          current: performanceMetrics.backend.cacheHitRate,
          unit: "%",
        },
        memory: {
          current: performanceMetrics.backend.memoryUsage[performanceMetrics.backend.memoryUsage.length - 1] || 0,
          average: performanceMetrics.backend.avgMemory,
          unit: "MB",
        },
      },
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get health status based on metrics
   */
  getHealth: () => {
    const metrics = observabilityTracker.getMetrics();
    const issues = [];

    // Check frontend metrics
    if (metrics.frontend.lcp.current > 2500) issues.push("LCP above target");
    if (metrics.frontend.fcp.current > 1800) issues.push("FCP above target");
    if (metrics.frontend.cls.current > 0.1) issues.push("CLS above target");
    if (metrics.frontend.pageLoad.average > 3000) issues.push("Page load time high");

    // Check backend metrics
    if (metrics.backend.apiResponse.average > 500) issues.push("API response time high");
    if (metrics.backend.dbQuery.average > 200) issues.push("DB query time high");
    if (metrics.backend.memory.current > 500) issues.push("Memory usage high");

    let status = "🟢 Excellent";
    if (issues.length > 0) {
      status = issues.length > 3 ? "🔴 Critical" : issues.length > 1 ? "🟠 Degraded" : "🟡 Caution";
    }

    return {
      status,
      issues,
      metrics,
    };
  },

  /**
   * Clear all metrics
   */
  clear: () => {
    performanceMetrics.frontend = {
      pageLoadTime: [],
      navigationTime: [],
      hydrationTime: [],
      lcp: [],
      fcp: [],
      cls: [],
      avgPageLoad: 0,
      avgNavigation: 0,
      avgHydration: 0,
      avgLcp: 0,
      avgFcp: 0,
      avgCls: 0,
    };
    performanceMetrics.backend = {
      apiResponseTime: [],
      dbQueryTime: [],
      cacheHitRate: 0,
      memoryUsage: [],
      cpuUsage: [],
      avgApiResponse: 0,
      avgDbQuery: 0,
      avgMemory: 0,
      avgCpu: 0,
    };
  },
};
