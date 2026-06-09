"use client";

import { memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VisitorTrackerComponent = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Generate or retrieve session ID and start time
    let sessionId = localStorage.getItem('visitor_session_id');
    let sessionStartTime = sessionStorage.getItem('visitor_session_start');
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('visitor_session_id', sessionId);
    }
    
    if (!sessionStartTime) {
      sessionStartTime = Date.now().toString();
      sessionStorage.setItem('visitor_session_start', sessionStartTime);
    }

    let interactions = 0;
    let maxScroll = 0;

    const handleInteraction = () => {
      interactions++;
    };

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = totalHeight > 0 ? Math.round((scrolled / totalHeight) * 100) : 0;
      maxScroll = Math.max(maxScroll, percentage);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackVisitor();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const trackVisitor = async () => {
      if (pathname?.startsWith('/admin')) return;

      const duration = Math.round((Date.now() - parseInt(sessionStartTime)) / 1000);

      try {
        await fetch('/api/tracking/visitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname || '/',
            userAgent: window.navigator.userAgent,
            sessionId,
            sessionDuration: duration,
            timeOnPage: duration,
            interactionCount: interactions,
            scrollDepth: maxScroll,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisitor();

    // Periodically update session duration every 30 seconds
    const interval = setInterval(trackVisitor, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}

// PHASE 2 OPTIMIZATION: Memoize to prevent re-renders
export default memo(VisitorTrackerComponent);
