"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle, ShieldCheck, MoreVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * AdminPwaInstaller Component
 * 
 * Super-Admin-Only Installation Controller:
 * - Visible ONLY for authenticated Super Administrators (role: super-admin or root-super-admin).
 * - Automatically hidden in Standalone mode or when already installed.
 * - Uses React Portal to mount the floating mobile banner cleanly to document.body.
 */
export default function AdminPwaInstaller({ session: propSession, isSuperAdmin: propIsSuperAdmin = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [internalSuperAdmin, setInternalSuperAdmin] = useState(propIsSuperAdmin);
  const [mobileDismissed, setMobileDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Detect if running inside installed Standalone app
    const checkStandalone = () => {
      const inStandalone =
        (typeof window !== "undefined" &&
          (window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true ||
            document.referrer.includes("android-app://"))) ||
        false;
      setIsStandalone(inStandalone);
    };

    checkStandalone();

    // 2. Detect device OS
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    setIsIos(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Verify Super Admin authorization
    if (!propIsSuperAdmin) {
      fetch("/api/admin/me", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && ["super-admin", "root-super-admin"].includes(data.role)) {
            setInternalSuperAdmin(true);
          }
        })
        .catch(() => {});
    } else {
      setInternalSuperAdmin(true);
    }

    // 4. Register Service Worker for Admin Scope
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/admin" })
        .then((reg) => {
          console.log("[AdminPWA] Service Worker registered for /admin:", reg.scope);
        })
        .catch((err) => {
          console.warn("[AdminPWA] Service Worker registration skipped:", err);
        });
    }

    // 5. Listen for deferred PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredPwaPrompt = e;
    };

    if (typeof window !== "undefined" && window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    const handlePromptEvent = () => {
      if (typeof window !== "undefined" && window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
      toast.success("Muhyo Tech Admin Console installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("muhyo:pwa-prompt-available", handlePromptEvent);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("muhyo:pwa-prompt-available", handlePromptEvent);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [propIsSuperAdmin]);

  const isAuthorized = propIsSuperAdmin || internalSuperAdmin;

  // ONLY visible for authenticated Super Administrators
  if (!isAuthorized) return null;

  // Hide if already running inside standalone app or already installed
  if (isStandalone || isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          toast.success("Installing Muhyo Tech Admin Console...");
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        window.__deferredPwaPrompt = null;
        return;
      } catch (err) {
        console.warn("[AdminPwaInstaller] Install prompt error:", err);
      }
    }

    // Fallback: Open cross-platform guided setup modal
    setShowGuideModal(true);
  };

  return (
    <>
      {/* Topbar Action Button (Desktop & Tablet) */}
      <button
        type="button"
        onClick={handleInstallClick}
        title="Install Muhyo Tech Admin Console on this device"
        aria-label="Install Admin Console"
        className="group/pwa relative flex h-9 items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-2.5 sm:px-3 text-xs font-bold text-cyan-400 transition-all duration-200 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
        </span>
        <Download className="h-3.5 w-3.5 transition-transform group-hover/pwa:-translate-y-0.5" />
        <span className="hidden md:inline font-extrabold tracking-tight">Install App</span>
      </button>

      {/* Mobile Floating Bottom Banner via Portal */}
      {mounted &&
        !mobileDismissed &&
        createPortal(
          <div className="fixed bottom-4 left-3 right-3 z-[99999] md:hidden">
            <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-cyan-500/40 bg-[#090e1a]/98 p-3 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-white leading-tight">Admin Console</p>
                    <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[8px] font-black text-cyan-300 uppercase">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    1-Tap Home Screen App
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
                >
                  Install
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDismissed(true)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Cross-Platform Installation Guide Modal via Portal */}
      {mounted &&
        showGuideModal &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#090e1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100"
            >
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Install Admin Console</h3>
                  <p className="text-[11px] text-cyan-400 font-semibold">
                    {isIos ? "iPhone & iPad Safari Setup" : "Android & Desktop Setup"}
                  </p>
                </div>
              </div>

              {isIos ? (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button (<Share2 className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" />) in Safari's bottom toolbar.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      2
                    </span>
                    <span>
                      Scroll down and select <strong>Add to Home Screen</strong> (<PlusSquare className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" />).
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      3
                    </span>
                    <span>
                      Tap <strong>Add</strong> to launch the native standalone admin app anytime!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      1
                    </span>
                    <span>
                      Tap the <strong>Menu (3-dots)</strong> (<MoreVertical className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" />) in your browser toolbar (top-right).
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      2
                    </span>
                    <span>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-400">
                      3
                    </span>
                    <span>
                      Tap <strong>Install</strong> to add the native Muhyo Admin app icon to your phone!
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="mt-5 w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform active:scale-95"
              >
                Got It
              </button>
            </motion.div>
          </div>,
          document.body
        )}
    </>
  );
}
