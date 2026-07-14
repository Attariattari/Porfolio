"use client";

import { memo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "muhyo_visitor_id";
const LEGACY_VISITOR_ID_KEY = "visitor_session_id";
const SESSION_ID_KEY = "muhyo_visit_session_id";
const SESSION_STARTED_KEY = "muhyo_visit_session_started";
const SESSION_ACTIVITY_KEY = "muhyo_visit_session_activity";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const createTrackingId = (prefix) => {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  return `${prefix}_${randomPart}`;
};

const VisitorTrackerComponent = () => {
  const pathname = usePathname();
  // Use refs so the interval/RAF can always access latest values without re-renders
  const interactionsRef = useRef(0);
  const maxScrollRef = useRef(0);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    const userAgent = window.navigator.userAgent || "";
    const isAutomatedTraffic =
      window.navigator.webdriver ||
      /bot|crawler|spider|headless|lighthouse|pagespeed|google-inspectiontool/i.test(userAgent);
    if (isAutomatedTraffic) return;

    const now = Date.now();
    const legacyVisitorId = localStorage.getItem(LEGACY_VISITOR_ID_KEY);
    let visitorId = localStorage.getItem(VISITOR_ID_KEY) || legacyVisitorId;
    if (!visitorId) visitorId = createTrackingId("visitor");
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    localStorage.removeItem(LEGACY_VISITOR_ID_KEY);

    const lastActivity = Number(localStorage.getItem(SESSION_ACTIVITY_KEY) || 0);
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    let sessionStartedAt = Number(localStorage.getItem(SESSION_STARTED_KEY) || 0);
    if (!sessionId || !sessionStartedAt || now - lastActivity > SESSION_TIMEOUT_MS) {
      sessionId = createTrackingId("session");
      sessionStartedAt = now;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      localStorage.setItem(SESSION_STARTED_KEY, String(sessionStartedAt));
    }
    localStorage.setItem(SESSION_ACTIVITY_KEY, String(now));

    const pageStartedAt = now;
    interactionsRef.current = 0;
    maxScrollRef.current = 0;

    // PHASE 2 + 4: Passive + RAF-gated scroll handler
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const totalHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const percentage =
          totalHeight > 0 ? Math.round((scrolled / totalHeight) * 100) : 0;
        maxScrollRef.current = Math.max(maxScrollRef.current, percentage);
        rafId = null;
      });
    };

    // PHASE 4: Count clicks without triggering re-renders
    const handleInteraction = () => {
      interactionsRef.current++;
    };

    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    const trackVisitor = async ({ allowHidden = false, keepalive = false } = {}) => {
      // PHASE 4: Skip if tab is hidden or request already in-flight
      if ((!allowHidden && document.visibilityState === "hidden") || isSendingRef.current) return;
      isSendingRef.current = true;

      const trackedAt = Date.now();
      const sessionDuration = Math.max(0, Math.round((trackedAt - sessionStartedAt) / 1000));
      const timeOnPage = Math.max(0, Math.round((trackedAt - pageStartedAt) / 1000));
      localStorage.setItem(SESSION_ACTIVITY_KEY, String(trackedAt));

      const payload = JSON.stringify({
        page: pathname || "/",
        userAgent,
        visitorId,
        sessionId,
        sessionDuration,
        timeOnPage,
        interactionCount: interactionsRef.current,
        scrollDepth: maxScrollRef.current,
        referrer: document.referrer,
      });

      try {
        await fetch("/api/tracking/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive,
        });
      } catch {
        // Silently ignore — tracking is non-critical
      } finally {
        isSendingRef.current = false;
      }
    };

    // PHASE 4: Use requestIdleCallback for initial track — avoids blocking main thread
    const scheduleInitialTrack = () => {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(trackVisitor, { timeout: 3000 });
      } else {
        setTimeout(trackVisitor, 1000);
      }
    };
    scheduleInitialTrack();

    // PHASE 4: Heartbeat every 60s (was 30s) — reduce server load
    const interval = setInterval(() => {
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(trackVisitor, { timeout: 5000 });
      } else {
        trackVisitor();
      }
    }, 60000);

    // PHASE 4: Track on tab hidden (page unload)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackVisitor({ allowHidden: true, keepalive: true });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Send final event on cleanup
      trackVisitor({ allowHidden: true, keepalive: true });
    };
  }, [pathname]);

  return null;
};

// Memoize to prevent unnecessary re-renders
export default memo(VisitorTrackerComponent);
