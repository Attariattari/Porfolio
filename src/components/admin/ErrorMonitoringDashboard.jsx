"use client";

import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, BarChart3, Clock } from "lucide-react";

export function ErrorMonitoringDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("health");
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchErrorData = async () => {
    try {
      setLoading(true);
      const endpoint =
        selectedTab === "health"
          ? "/api/internal/error-monitoring?action=health"
          : "/api/internal/error-monitoring?action=all&limit=50";

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError(result.message || "Failed to fetch error data");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error monitoring fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorData();
    const interval = setInterval(fetchErrorData, 30000);
    return () => clearInterval(interval);
  }, [selectedTab]);

  if (loading && !data) {
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

  if (error && !data) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-400">Error Monitoring Error</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Error Monitoring Dashboard
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdate}</p>
        </div>
        <button
          onClick={fetchErrorData}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setSelectedTab("health")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            selectedTab === "health"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Health
        </button>
        <button
          onClick={() => setSelectedTab("errors")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            selectedTab === "errors"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Recent Errors
        </button>
      </div>

      {/* Health Tab */}
      {selectedTab === "health" && data && (
        <div className="space-y-4">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Overall Status</p>
                <div className={`text-2xl font-bold ${
                  data.status.includes("Healthy")
                    ? "text-green-400"
                    : data.status.includes("Critical")
                      ? "text-red-400"
                      : data.status.includes("Degraded")
                        ? "text-orange-400"
                        : "text-yellow-400"
                }`}>
                  {data.status}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Total Errors</p>
                <p className="text-3xl font-bold text-white">{data.totalErrors}</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Critical</p>
                <p className={`text-2xl font-bold ${data.criticalErrors > 0 ? "text-red-400" : "text-green-400"}`}>
                  {data.criticalErrors}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">High Severity</p>
                <p className={`text-2xl font-bold ${data.highSeverity > 0 ? "text-orange-400" : "text-green-400"}`}>
                  {data.highSeverity}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Recent</p>
                <p className="text-2xl font-bold text-blue-400">
                  {data.recentErrors?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Critical Errors */}
          {data.recentErrors && data.recentErrors.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="font-semibold text-white mb-4">Recent Errors</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.recentErrors.slice(0, 10).map((err, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex gap-3 ${
                      err.severity === "critical"
                        ? "bg-red-900/20 border-red-700/50"
                        : err.severity === "high"
                          ? "bg-orange-900/20 border-orange-700/50"
                          : "bg-yellow-900/20 border-yellow-700/50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {err.severity === "critical" && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {err.severity === "high" && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                      {err.severity === "medium" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                      {err.severity === "low" && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{err.type}</p>
                      <p className="text-xs text-gray-300 mt-1 truncate">{err.message}</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-400">
                        <span>{err.context.route}</span>
                        <span>•</span>
                        <span>{new Date(err.context.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors Tab */}
      {selectedTab === "errors" && data && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white">Recent Errors ({data.count} of {data.total})</p>
              <p className="text-xs text-gray-400">Showing up to {data.limit}</p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.recent && data.recent.length > 0 ? (
                data.recent.map((err, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border flex gap-3 ${
                      err.severity === "critical"
                        ? "bg-red-900/20 border-red-700/50"
                        : err.severity === "high"
                          ? "bg-orange-900/20 border-orange-700/50"
                          : "bg-yellow-900/20 border-yellow-700/50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {err.severity === "critical" && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {err.severity === "high" && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                      {err.severity === "medium" && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                      {err.severity === "low" && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm">{err.type}</p>
                      <p className="text-xs text-gray-300 mt-1 break-words">{err.message}</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-400 flex-wrap">
                        <span className="bg-slate-700/50 px-2 py-1 rounded">{err.context.route}</span>
                        <span className="bg-slate-700/50 px-2 py-1 rounded">{err.context.method}</span>
                        <span className="bg-slate-700/50 px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(err.context.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-400">No errors recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
