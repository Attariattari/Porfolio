"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

/**
 * Settings API Debug Panel
 * For testing and debugging the settings API
 */
export default function SettingsDebugPanel() {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Test GET
      const getRes = await fetch("/api/settings");
      const getData = await getRes.json();

      if (!getRes.ok) {
        setTestResult({
          status: "error",
          message: `GET failed: ${getRes.status}`,
          data: getData
        });
        setTesting(false);
        return;
      }

      // Test PATCH
      const patchRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteTitle: "Test: " + new Date().toLocaleTimeString(),
          siteAccent: "Tech"
        })
      });
      const patchData = await patchRes.json();

      if (!patchRes.ok) {
        setTestResult({
          status: "error",
          message: `PATCH failed: ${patchRes.status}`,
          data: patchData
        });
        setTesting(false);
        return;
      }

      setTestResult({
        status: "success",
        message: "✅ API is working!",
        data: { get: getData, patch: patchData }
      });
    } catch (error) {
      setTestResult({
        status: "error",
        message: error.message,
        data: { error: error.toString() }
      });
    } finally {
      setTesting(false);
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="mt-12 p-6 bg-muted/50 border border-border rounded-2xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        Debug Panel (Dev Only)
      </h3>

      <button
        onClick={runTest}
        disabled={testing}
        className="px-6 py-2 bg-accent hover:bg-accent text-foreground rounded-lg font-medium transition-all disabled:opacity-50"
      >
        {testing ? (
          <>
            <Loader className="w-4 h-4 animate-spin inline mr-2" />
            Testing...
          </>
        ) : (
          "Test Settings API"
        )}
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          testResult.status === "success"
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-red-500/10 border border-red-500/30"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult.status === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={testResult.status === "success" ? "text-green-500" : "text-red-500"}>
              {testResult.message}
            </span>
          </div>
          <pre className="text-xs bg-overlay/30 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto text-foreground/70">
            {JSON.stringify(testResult.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
