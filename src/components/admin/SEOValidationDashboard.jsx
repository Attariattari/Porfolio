"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Search } from "lucide-react";

export function SEOValidationDashboard() {
  const [health, setHealth] = useState(null);
  const [score, setScore] = useState(null);
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSeoData = async () => {
    try {
      setLoading(true);
      const [healthRes, scoreRes, issuesRes] = await Promise.all([
        fetch("/api/internal/seo-audit?action=health"),
        fetch("/api/internal/seo-audit?action=score"),
        fetch("/api/internal/seo-audit?action=issues"),
      ]);

      const healthData = await healthRes.json();
      const scoreData = await scoreRes.json();
      const issuesData = await issuesRes.json();

      if (healthData.success && scoreData.success && issuesData.success) {
        setHealth(healthData.data);
        setScore(scoreData.data);
        setIssues(issuesData.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError("Failed to fetch SEO data");
      }
    } catch (err) {
      setError(err.message);
      console.error("SEO audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialTimer = window.setTimeout(fetchSeoData, 0);
    const interval = setInterval(fetchSeoData, 60000);
    return () => {
      window.clearTimeout(initialTimer);
      clearInterval(interval);
    };
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
            <h3 className="font-semibold text-red-400">SEO Audit Error</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Validation Dashboard
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdate}</p>
        </div>
        <button
          onClick={fetchSeoData}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setSelectedTab("overview")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            selectedTab === "overview"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab("score")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            selectedTab === "score"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Score Breakdown
        </button>
        <button
          onClick={() => setSelectedTab("issues")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
            selectedTab === "issues"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Issues
        </button>
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="space-y-4">
          {/* Main Score Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">SEO Score</p>
                <div className={`text-4xl font-bold ${getScoreColor(health.overallScore)}`}>
                  {health.overallScore}
                </div>
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Grade</p>
                  <p className="text-lg font-bold text-green-400">A</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(health.scoreBreakdown).map(([key, value]) => (
                <div key={key} className="bg-slate-700/50 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{key.replace(/_/g, " ")}</p>
                  <p className="text-lg font-bold text-blue-400">{value.score}/{value.maxScore}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {health.recommendations && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="font-semibold text-white mb-3">Top Recommendations</p>
              <div className="space-y-2">
                {health.recommendations.slice(0, 3).map((rec, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 p-3 rounded border ${
                      rec.priority === "high"
                        ? "bg-red-900/20 border-red-700/50"
                        : rec.priority === "medium"
                          ? "bg-yellow-900/20 border-yellow-700/50"
                          : "bg-blue-900/20 border-blue-700/50"
                    }`}
                  >
                    {rec.priority === "high" && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    {rec.priority === "medium" && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                    {rec.priority === "low" && <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{rec.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{rec.description}</p>
                      <p className="text-xs text-gray-400 mt-1 italic">{rec.expectedImpact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score Breakdown Tab */}
      {selectedTab === "score" && score && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="font-semibold text-white mb-4">Score Details</p>

            {/* Strengths */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </p>
              <div className="space-y-1 ml-6">
                {score.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-300">
                    {strength}
                  </li>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <p className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Areas for Improvement
              </p>
              <div className="space-y-1 ml-6">
                {score.areasForImprovement.map((area, idx) => (
                  <li key={idx} className="text-sm text-gray-300">
                    {area}
                  </li>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="font-semibold text-white mb-4">Breakdown by Category</p>
            <div className="space-y-2">
              {Object.entries(score.scoreBreakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-400">{key.replace(/_/g, " ").toUpperCase()}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(parseInt(value.split("/")[0]) / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {selectedTab === "issues" && issues && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-4">Common SEO Issues Check</p>
          <div className="space-y-2">
            {Object.entries(issues).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                <p className="text-sm text-gray-300 capitalize">{key.replace(/_/g, " ")}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
