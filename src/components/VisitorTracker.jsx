"use client";

import { memo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VisitorTrackerComponent = () => {
  const pathname = usePathname();
  // Use refs so the interval/RAF can always access latest values without re-renders
  const interactionsRef = useRef(0);
  const maxScrollRef = useRef(0);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    // Generate or retrieve session ID and start time
    let sessionId = localStorage.getItem("visitor_session_id");
    let sessionStartTime = sessionStorage.getItem("visitor_session_start");

    if (!sessionId) {
      sessionId =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("visitor_session_id", sessionId);
    }

    if (!sessionStartTime) {
      sessionStartTime = Date.now().toString();
      sessionStorage.setItem("visitor_session_start", sessionStartTime);
    }

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

    const trackVisitor = async () => {
      // PHASE 4: Skip if tab is hidden or request already in-flight
      if (document.visibilityState === "hidden" || isSendingRef.current) return;
      isSendingRef.current = true;

      const duration = Math.round(
        (Date.now() - parseInt(sessionStartTime)) / 1000,
      );

      const payload = JSON.stringify({
        page: pathname || "/",
        userAgent: window.navigator.userAgent,
        sessionId,
        sessionDuration: duration,
        timeOnPage: duration,
        interactionCount: interactionsRef.current,
        scrollDepth: maxScrollRef.current,
        referrer: document.referrer,
      });

      try {
        await fetch("/api/tracking/visitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
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
        trackVisitor();
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
      trackVisitor();
    };
  }, [pathname]);

  return null;
};

// Memoize to prevent unnecessary re-renders
export default memo(VisitorTrackerComponent);
