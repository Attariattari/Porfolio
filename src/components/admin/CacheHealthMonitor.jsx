"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Activity, Database } from "lucide-react";

export function CacheHealthMonitor() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchCacheHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/internal/cache-health");
      const data = await response.json();

      if (data.success) {
        setHealth(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError(data.message || "Failed to fetch cache health");
      }
    } catch (err) {
      setError(err.message);
      console.error("Cache health fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCacheHealth();
    const interval = setInterval(fetchCacheHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-400">Cache Health Error</h3>
            <p className="text-sm text-red-300 mt-1">{error || "Failed to load cache metrics"}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    healthy: "text-green-400",
    degraded: "text-yellow-400",
    unhealthy: "text-red-400",
    idle: "text-gray-400",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Cache Health Monitor
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdate}</p>
        </div>
        <button
          onClick={fetchCacheHealth}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition"
        >
          Refresh
        </button>
      </div>

      {/* Main Status Card */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Overall Status</p>
            <div className={`text-2xl font-bold ${statusColors[health.status]}`}>
              {health.health}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Uptime</p>
            <p className="text-xl font-semibold text-white">{health.uptime}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Hit Rate */}
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Hit Rate</p>
            <p className="text-2xl font-bold text-blue-400">{health.metrics.hitRate}</p>
            <p className="text-xs text-gray-500 mt-1">{health.metrics.totalRequests} total</p>
          </div>

          {/* Cache Hits */}
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Cache Hits</p>
            <p className="text-2xl font-bold text-green-400">{health.metrics.cacheHits}</p>
          </div>

          {/* Cache Misses */}
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Cache Misses</p>
            <p className="text-2xl font-bold text-orange-400">{health.metrics.cacheMisses}</p>
          </div>

          {/* Cache Errors */}
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Errors</p>
            <p className="text-2xl font-bold text-red-400">{health.metrics.cacheErrors}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cache Statistics */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache Statistics
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Writes:</span>
              <span className="font-semibold text-white">{health.metrics.cacheWrites}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Invalidations:</span>
              <span className="font-semibold text-white">{health.metrics.cacheInvalidations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Memory Cache Size:</span>
              <span className="font-semibold text-white">{health.memory.cacheSize} entries</span>
            </div>
          </div>
        </div>

        {/* Redis Status */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Redis Status
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Configured:</span>
              <span className="font-semibold">
                {health.redis.configured ? (
                  <span className="text-green-400">✓ Yes</span>
                ) : (
                  <span className="text-yellow-400">✗ No</span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Connected:</span>
              <span className="font-semibold">
                {health.redis.connected ? (
                  <span className="text-green-400">✓ Yes</span>
                ) : (
                  <span className="text-red-400">✗ No</span>
                )}
              </span>
            </div>
            {health.redis.error && (
              <div className="mt-2 p-2 bg-red-900/30 rounded border border-red-700/50">
                <p className="text-xs text-red-300">{health.redis.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-3">Recommendations</p>
          <div className="space-y-2">
            {health.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`flex gap-3 p-3 rounded border ${
                  rec.type === "error"
                    ? "bg-red-900/20 border-red-700/50"
                    : rec.type === "warning"
                      ? "bg-yellow-900/20 border-yellow-700/50"
                      : rec.type === "success"
                        ? "bg-green-900/20 border-green-700/50"
                        : "bg-blue-900/20 border-blue-700/50"
                }`}
              >
                {rec.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                {rec.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                {(rec.type === "success" || rec.type === "info") && (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-gray-200">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Error */}
      {health.lastError && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-300 mb-2">Last Error</p>
          <p className="text-xs text-red-200 font-mono break-words">{health.lastError}</p>
        </div>
      )}
    </div>
  );
}
