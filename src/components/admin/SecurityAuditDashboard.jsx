"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Lock, AlertTriangle, Shield } from "lucide-react";

export function SecurityAuditDashboard() {
  const [audit, setAudit] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [auditRes, complianceRes] = await Promise.all([
        fetch("/api/internal/security-audit?action=audit"),
        fetch("/api/internal/security-audit?action=compliance"),
      ]);

      const auditData = await auditRes.json();
      const complianceData = await complianceRes.json();

      if (auditData.success && complianceData.success) {
        setAudit(auditData.data);
        setCompliance(complianceData.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError("Failed to fetch security data");
      }
    } catch (err) {
      setError(err.message);
      console.error("Security audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !audit) {
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

  if (error && !audit) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-400">Security Audit Error</h3>
            <p className="text-sm text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Audit Dashboard
          </h3>
          <p className="text-sm text-gray-400 mt-1">Last updated: {lastUpdate}</p>
        </div>
        <button
          onClick={fetchSecurityData}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Overall Security Status</p>
            <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              {audit.overallStatus}
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Environment</p>
            <p className="text-lg font-semibold text-white capitalize">{audit.environment}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2">Critical Issues</p>
            <p className="text-2xl font-bold text-green-400">{audit.criticalIssues}</p>
          </div>
          <div className="bg-slate-700/50 rounded p-4">
            <p className="text-gray-400 text-xs mb-2">Warnings</p>
            <p className="text-2xl font-bold text-yellow-400">{audit.warningIssues}</p>
          </div>
        </div>
      </div>

      {/* Security Checks */}
      <div className="space-y-3">
        {Object.entries(audit.checks).map(([key, check]) => (
          <div key={key} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">{check.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{check.description}</p>
                </div>
              </div>
              <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                {check.status}
              </span>
            </div>

            <div className="space-y-1 pl-8 text-sm">
              {Object.entries(check.details).map(([detailKey, detail]) => (
                <div key={detailKey} className="text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  {detail}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Status */}
      {compliance && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-4">Compliance Status</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* OWASP */}
            <div className="bg-slate-700/50 rounded p-4">
              <p className="text-sm font-semibold text-white mb-2">OWASP Top 10</p>
              <p className="text-2xl font-bold text-green-400">{compliance.owasp.score}%</p>
              <p className="text-xs text-gray-400 mt-2">{compliance.owasp.status}</p>
              <div className="mt-3 space-y-1">
                {compliance.owasp.topTenCovered.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* PCI DSS */}
            <div className="bg-slate-700/50 rounded p-4">
              <p className="text-sm font-semibold text-white mb-2">PCI DSS</p>
              <p className="text-lg font-bold text-green-400 mb-2">{compliance.pci_dss.status}</p>
              <div className="space-y-1 text-xs text-gray-300">
                {compliance.pci_dss.relevantRequirements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* GDPR */}
            <div className="bg-slate-700/50 rounded p-4">
              <p className="text-sm font-semibold text-white mb-2">GDPR</p>
              <p className="text-lg font-bold text-green-400 mb-2">{compliance.gdpr.status}</p>
              <div className="space-y-1 text-xs text-gray-300">
                {compliance.gdpr.provisions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.recommendations && audit.recommendations.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="font-semibold text-white mb-3">Security Recommendations</p>
          <div className="space-y-2">
            {audit.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`flex gap-3 p-3 rounded border ${
                  rec.severity === "info"
                    ? "bg-blue-900/20 border-blue-700/50"
                    : rec.severity === "warning"
                      ? "bg-yellow-900/20 border-yellow-700/50"
                      : "bg-green-900/20 border-green-700/50"
                }`}
              >
                {rec.severity === "info" && <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                {rec.severity === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />}
                {rec.severity === "success" && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-white text-sm">{rec.title}</p>
                  <p className="text-xs text-gray-300 mt-1">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
