"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  Database,
} from "lucide-react";

export function ProductionHealthMonitor() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/internal/observability?action=health");
      const result = await response.json();

      if (result.success) {
        setHealth(result.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError(result.message || "Failed to fetch health data");
      }
    } catch (err) {
      setError(err.message);
      console.error("Health fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
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

  if (error && !health) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-400">Health Monitor Error</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const { metrics } = health;

  const getMetricHealth = (current, target, lowerIsBetter = true) => {
    if (typeof target === "string") {
      target = parseFloat(target);
    }
    if (lowerIsBetter) {
      if (current <= target) return "good";
      if (current <= target * 1.5) return "fair";
      return "poor";
    } else {
      if (current >= target) return "good";
      if (current >= target * 0.8) return "fair";
      return "poor";
    }
  };

  const MetricCard = ({ icon: Icon, label, current, unit, target, lowerIsBetter = true }) => {
    const metricHealth = getMetricHealth(current, target, lowerIsBetter);
    const healthColor =
      metricHealth === "good" ? "text-green-400" : metricHealth === "fair" ? "text-yellow-400" : "text-red-400";

    return (
      <div className="bg-slate-700/50 rounded p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide flex items-center gap-2">
              <Icon className="w-3 h-3" />
              {label}
            </p>
            <p className={`text-2xl font-bold ${healthColor}`}>
              {current.toFixed(1)}{unit}
            </p>
            {target && (
              <p className="text-xs text-gray-500 mt-1">Target: {target}{unit}</p>
            )}
          </div>
          {metricHealth === "good" && <CheckCircle className="w-4 h-4 text-green-400" />}
          {metricHealth === "fair" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
          {metricHealth === "poor" && <AlertCircle className="w-4 h-4 text-red-400" />}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Production Health Monitor
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdate}</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">System Status</p>
            <div className={`text-2xl font-bold ${health.status.includes("Excellent") ? "text-green-400" : health.status.includes("Critical") ? "text-red-400" : health.status.includes("Degraded") ? "text-orange-400" : "text-yellow-400"}`}>
              {health.status}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Issues Detected</p>
            <p className="text-3xl font-bold text-white">{health.issues?.length || 0}</p>
          </div>
        </div>

        {/* Issues List */}
        {health.issues && health.issues.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm font-semibold text-white mb-2">Detected Issues:</p>
            <ul className="space-y-1">
              {health.issues.map((issue, idx) => (
                <li key={idx} className="text-sm text-yellow-300 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Frontend Metrics */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="font-semibold text-white mb-4">Frontend Performance</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            icon={Zap}
            label="Page Load"
            current={metrics.frontend.pageLoad.average}
            unit="ms"
            target="3000"
          />
          <MetricCard
            icon={Zap}
            label="Navigation"
            current={metrics.frontend.navigation.average}
            unit="ms"
            target="2000"
          />
          <MetricCard
            icon={Clock}
            label="LCP"
            current={metrics.frontend.lcp.current}
            unit="ms"
            target={metrics.frontend.lcp.target}
          />
          <MetricCard
            icon={Clock}
            label="FCP"
            current={metrics.frontend.fcp.current}
            unit="ms"
            target={metrics.frontend.fcp.target}
          />
          <MetricCard
            icon={Activity}
            label="CLS"
            current={metrics.frontend.cls.current}
            unit=""
            target={metrics.frontend.cls.target}
          />
          <MetricCard
            icon={Clock}
            label="Hydration"
            current={metrics.frontend.hydration.average}
            unit="ms"
            target="1000"
          />
        </div>
      </div>

      {/* Backend Metrics */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="font-semibold text-white mb-4">Backend Performance</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            icon={Zap}
            label="API Response"
            current={metrics.backend.apiResponse.average}
            unit="ms"
            target="500"
          />
          <MetricCard
            icon={Database}
            label="DB Query"
            current={metrics.backend.dbQuery.average}
            unit="ms"
            target="200"
          />
          <MetricCard
            icon={Activity}
            label="Cache Hit Rate"
            current={metrics.backend.cacheHitRate}
            unit="%"
            target="80"
            lowerIsBetter={false}
          />
          <MetricCard
            icon={Database}
            label="Memory Usage"
            current={metrics.backend.memory.average}
            unit="MB"
            target="500"
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <p className="font-semibold text-white mb-3">Performance Recommendations</p>
        <div className="space-y-2 text-sm text-gray-300">
          {metrics.frontend.lcp.current > 2500 && (
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Optimize Largest Contentful Paint: Reduce hero image size or use lazy loading</span>
            </div>
          )}
          {metrics.frontend.pageLoad.average > 3000 && (
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Page load time is high: Consider code splitting or reducing bundle size</span>
            </div>
          )}
          {metrics.backend.apiResponse.average > 500 && (
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>API response time is slow: Check database queries and enable caching</span>
            </div>
          )}
          {metrics.backend.cacheHitRate < 50 && (
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Cache hit rate is low: Review cache TTL and key strategy</span>
            </div>
          )}
          {metrics.backend.memory.average > 500 && (
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>Memory usage is high: Check for memory leaks or optimize queries</span>
            </div>
          )}
          {health.issues && health.issues.length === 0 && (
            <div className="flex gap-2 text-green-300">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>All systems operating optimally!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
