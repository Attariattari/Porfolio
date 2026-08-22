"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * AdminPwaInstaller Component
 * 
 * Super-Admin-Only Installation Controller:
 * - Completely hidden for regular users, guests, and public routes.
 * - Only visible to authenticated Super Administrators (role: super-admin or root-super-admin).
 * - Automatically hides when the app is already installed and running in standalone mode.
 * - Supports native 1-click install for Android/Chrome/Edge and step-by-step guidance for iOS Safari.
 */
export default function AdminPwaInstaller({ session, isSuperAdmin = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
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

    // 2. Detect iOS device
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Listen for deferred PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredPwaPrompt = e;
    };

    // Check if global prompt was already captured
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
  }, []);

  // ONLY visible for authenticated Super Administrators
  if (!isSuperAdmin) return null;

  // Hide if already running inside standalone app or just installed
  if (isStandalone || isInstalled) return null;

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

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
      } catch (err) {
        console.warn("[AdminPwaInstaller] Install error:", err);
      }
    } else {
      // Fallback message for desktop browsers or already promptable environments
      toast.info("To install on desktop, click the Install icon in your browser URL address bar.");
    }
  };

  return (
    <>
      {/* Topbar Action Button */}
      <button
        type="button"
        onClick={handleInstallClick}
        title="Install Muhyo Tech Admin Console on this device"
        aria-label="Install Admin Console"
        className="group/pwa relative flex h-9 items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-2.5 sm:px-3 text-xs font-bold text-accent transition-all duration-200 hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.25)] active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <Download className="h-3.5 w-3.5 transition-transform group-hover/pwa:-translate-y-0.5" />
        <span className="hidden md:inline font-extrabold tracking-tight">Install App</span>
      </button>

      {/* iOS Safari Step-by-Step Installation Modal */}
      <AnimatePresence>
        {showIosModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Install on iPhone / iPad</h3>
                  <p className="text-[11px] text-muted-foreground">Safari Home Screen Setup</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-black text-accent">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button (<Share2 className="inline h-3.5 w-3.5 text-accent mx-0.5" />) in the Safari toolbar at the bottom.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-black text-accent">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong> (<PlusSquare className="inline h-3.5 w-3.5 text-accent mx-0.5" />).
                  </span>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-muted/40 p-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-black text-accent">
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong> in the top-right corner to launch the standalone native app anytime!
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="mt-5 w-full rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-foreground shadow-md transition-transform active:scale-95"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
