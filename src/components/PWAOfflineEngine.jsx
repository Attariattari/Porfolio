"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { WifiOff, Wifi, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { syncOfflineOutbox } from "@/lib/offlineOutbox";

const subscribeOnline = (callback) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getOnlineSnapshot = () =>
  typeof navigator !== "undefined" ? navigator.onLine : true;

const getServerOnlineSnapshot = () => true;

/**
 * PWAOfflineEngine Component
 * 
 * - Registers Service Worker for instant 0ms offline-first caching.
 * - Suppresses public web install prompt so portfolio stays 100% clean.
 * - Manages offline status badges and automatically synchronizes offline outbox forms on reconnection.
 */
export default function PWAOfflineEngine() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );
  const isOffline = !isOnline;
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    // 1. Service Worker Lifecycle Management with immediate registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Warm up current URL into cache if online
          if (navigator.onLine && reg.active) {
            reg.active.postMessage({
              type: "MUHYO_WARMUP_CACHE",
              url: window.location.pathname,
            });
          }
        })
        .catch((err) => {
          console.warn("[OfflineEngine] Service Worker registration:", err);
        });
    }

    // 2. Initial Outbox Sync on mount if online
    if (typeof navigator !== "undefined" && navigator.onLine) {
      syncOfflineOutbox();
    }

    // 3. Reconnection Event Listener
    const handleOnline = () => {
      setJustReconnected(true);
      window.dispatchEvent(new CustomEvent("muhyo:network-reconnected"));
      syncOfflineOutbox();
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    // 4. Suppress auto public install banner
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent("muhyo:pwa-prompt-available"));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Offline Status Badge */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0f1c]/95 border border-amber-500/40 text-amber-400 text-xs font-semibold shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none select-none"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 opacity-30 animate-ping" />
            <WifiOff className="w-3.5 h-3.5 text-amber-400 relative z-10" />
          </div>
          <span>Offline Mode Active • Browsing from local cache</span>
        </motion.div>
      )}

      {/* Just Reconnected Status Badge */}
      {justReconnected && !isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0f1c]/95 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl pointer-events-none select-none"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-30 animate-ping" />
            <Wifi className="w-3.5 h-3.5 text-emerald-400 relative z-10" />
          </div>
          <span>Back Online • Synchronized</span>
          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
