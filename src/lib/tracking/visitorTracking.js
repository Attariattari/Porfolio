/**
 * Visitor Tracking Service
 * Tracks visitor activity on the frontend with improved accuracy
 */

let sessionId = null;
let sessionStartTime = null;
const pageMetrics = {};
let lastSendTime = 0;
const MIN_SEND_INTERVAL = 5000; // Minimum 5 seconds between sends

/**
 * Initialize Visitor Tracking
 */
export function initializeVisitorTracking() {
  if (typeof window === 'undefined') return;

  console.log('[Tracking] Initializing visitor tracking...');

  // Generate or retrieve session ID
  sessionId = getOrCreateSessionId();
  sessionStartTime = Date.now();

  console.log('[Tracking] Session ID:', sessionId);

  // Track initial page view
  trackPageView(window.location.pathname);

  // Immediately send first tracking (so we know the user is here)
  sendTrackingForCurrentPage();

  // Track on route change (Next.js router)
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    originalPushState.apply(window.history, args);
    console.log('[Tracking] Route changed to:', window.location.pathname);
    sendTrackingForCurrentPage(); // Send previous page data
    trackPageView(window.location.pathname); // Start tracking new page
  };

  window.history.replaceState = function (...args) {
    originalReplaceState.apply(window.history, args);
    console.log('[Tracking] Route replaced to:', window.location.pathname);
    trackPageView(window.location.pathname);
  };

  // Also track popstate (back/forward buttons)
  window.addEventListener('popstate', () => {
    console.log('[Tracking] History pop to:', window.location.pathname);
    sendTrackingForCurrentPage();
    trackPageView(window.location.pathname);
  });

  // Track interactions
  document.addEventListener('click', () => trackInteraction());
  document.addEventListener('scroll', throttle(() => trackScrollDepth(), 1000));
  document.addEventListener('input', () => trackInteraction());
  document.addEventListener('keydown', () => trackInteraction());

  // Send tracking data on page unload
  window.addEventListener('beforeunload', () => {
    console.log('[Tracking] Page unload, sending final tracking data...');
    sendTracking();
  });

  // Also periodically send data while page is active
  const sendInterval = setInterval(() => {
    if (document.hidden) {
      clearInterval(sendInterval);
      return;
    }
    sendTrackingForCurrentPage();
  }, 30000); // Every 30 seconds

  console.log('[Tracking] Tracking initialized successfully');
}

/**
 * Get or Create Session ID
 */
function getOrCreateSessionId() {
  let id = sessionStorage.getItem('visitor_session_id');
  
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_session_id', id);
    console.log('[Tracking] Created new session ID:', id);
  } else {
    console.log('[Tracking] Using existing session ID:', id);
  }

  return id;
}

/**
 * Track Page View
 */
function trackPageView(page) {
  const normalizedPage = page || '/';
  
  if (!pageMetrics[normalizedPage]) {
    pageMetrics[normalizedPage] = {
      page: normalizedPage,
      enteredAt: Date.now(),
      interactions: 0,
      scrollDepth: 0,
    };
    console.log('[Tracking] Started tracking page:', normalizedPage);
  }
}

/**
 * Track User Interaction
 */
function trackInteraction() {
  const currentPage = window.location.pathname || '/';
  if (pageMetrics[currentPage]) {
    pageMetrics[currentPage].interactions++;
  }
}

/**
 * Calculate Scroll Depth
 */
function trackScrollDepth() {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  const scrollPercentage = documentHeight > 0 
    ? Math.round((scrolled / documentHeight) * 100)
    : 0;

  const currentPage = window.location.pathname || '/';
  if (pageMetrics[currentPage]) {
    pageMetrics[currentPage].scrollDepth = Math.max(
      pageMetrics[currentPage].scrollDepth,
      Math.min(100, scrollPercentage) // Cap at 100%
    );
  }
}

/**
 * Send Tracking for Current Page
 */
async function sendTrackingForCurrentPage() {
  const currentPage = window.location.pathname || '/';
  const pageData = pageMetrics[currentPage];

  if (!pageData) return;

  const now = Date.now();
  if (now - lastSendTime < MIN_SEND_INTERVAL) {
    return; // Don't send too frequently
  }

  lastSendTime = now;

  const timeOnPage = Math.round((now - pageData.enteredAt) / 1000);
  const sessionDuration = Math.round((now - sessionStartTime) / 1000);

  try {
    const response = await fetch('/api/tracking/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        page: currentPage,
        userAgent: navigator.userAgent,
        timeOnPage: Math.max(0, timeOnPage),
        sessionDuration: Math.max(0, sessionDuration),
        interactionCount: pageData.interactions,
        scrollDepth: pageData.scrollDepth,
        referrer: document.referrer,
      }),
    });

    if (!response.ok) {
      console.warn('[Tracking] Send failed:', response.status);
    }
  } catch (error) {
    console.error('[Visitor Tracking] Send failed:', error.message);
  }
}

/**
 * Send Tracking Data to Server (for all pages)
 */
async function sendTracking() {
  if (typeof window === 'undefined' || !sessionId) return;

  const now = Date.now();
  const pages = Object.values(pageMetrics);
  
  for (const pageData of pages) {
    const timeOnPage = Math.round((now - pageData.enteredAt) / 1000);
    const sessionDuration = Math.round((now - sessionStartTime) / 1000);

    try {
      await fetch('/api/tracking/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          page: pageData.page,
          userAgent: navigator.userAgent,
          timeOnPage: Math.max(0, timeOnPage),
          sessionDuration: Math.max(0, sessionDuration),
          interactionCount: pageData.interactions,
          scrollDepth: pageData.scrollDepth,
          referrer: document.referrer,
        }),
        keepalive: true, // Ensure request completes even if tab closes
      });
    } catch (error) {
      console.error('[Visitor Tracking] Final send failed:', error.message);
    }
  }
}

/**
 * Manual Track Event
 */
export async function trackEvent(eventName, eventData = {}) {
  if (typeof window === 'undefined') return;

  try {
    console.log('[Event Tracking]', eventName, eventData);
    
    await fetch('/api/tracking/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        event: eventName,
        data: eventData,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('[Event Tracking] Failed:', error.message);
  }
}

/**
 * Utility: Throttle Function
 */
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get Current Metrics (for debugging)
 */
export function getCurrentMetrics() {
  return {
    sessionId,
    pageMetrics,
    sessionDuration: Math.round((Date.now() - sessionStartTime) / 1000),
  };
}
