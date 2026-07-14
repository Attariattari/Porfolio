"use client";

import { useState, useEffect } from "react";
import { useNetworkStore } from "@/lib/store/networkStore";
import { Wifi, WifiOff, Activity, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NetworkIndicator() {
  const { status, failedRequests } = useNetworkStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const getStatusConfig = () => {
    // Return a neutral/loading state if not mounted to prevent hydration mismatch
    if (!mounted) {
      return {
        icon: <Wifi className="w-4 h-4 text-slate-400" />,
        label: "Checking...",
        color: "bg-slate-400/10 text-slate-400 border-slate-400/20",
        dot: "bg-slate-400",
      };
    }
    switch (status) {
      case "online":
        return {
          icon: <Wifi className="w-4 h-4 text-emerald-400" />,
          label: "Online",
          color: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
          dot: "bg-emerald-400",
        };
      case "slow":
        return {
          icon: <Activity className="w-4 h-4 text-amber-400" />,
          label: "Slow",
          color: "bg-amber-400/10 text-amber-400 border-amber-400/20",
          dot: "bg-amber-400",
        };
      case "offline":
        return {
          icon: <WifiOff className="w-4 h-4 text-rose-400" />,
          label: "Offline",
          color: "bg-rose-400/10 text-rose-400 border-rose-400/20",
          dot: "bg-rose-400",
        };
      default:
        return {
          icon: <Wifi className="w-4 h-4 text-slate-400" />,
          label: "Unknown",
          color: "bg-slate-400/10 text-slate-400 border-slate-400/20",
          dot: "bg-slate-400",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-3">
      {failedRequests.length > 0 && (
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>{failedRequests.length} Failed</span>
        </div>
      )}
      
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300",
          config.color
        )}
      >
        <div className="relative">
          <div className={cn("w-2 h-2 rounded-full", config.dot)} />
          {status === "online" && (
            <div className={cn("absolute inset-0 w-2 h-2 rounded-full animate-ping", config.dot)} />
          )}
        </div>
        <span className="capitalize">{config.label}</span>
      </div>
    </div>
  );
}
