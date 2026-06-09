/**
 * Scroll Position Restoration System
 * 
 * Purpose: Preserve and restore scroll position during navigation
 * Features:
 * - Automatic position saving on route change
 * - Smooth restoration on back navigation
 * - Session-based persistence
 * - Lazy loading (only instantiated in browser)
 */

const SCROLL_POSITIONS_KEY = 'nav-scroll-positions';

class ScrollRestoration {
  constructor() {
    this.positions = new Map();
    // Only try to load from storage if we're in a browser environment
    if (typeof sessionStorage !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * Load scroll positions from sessionStorage
   */
  loadFromStorage() {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const data = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
      if (data) {
        const positions = JSON.parse(data);
        this.positions = new Map(Object.entries(positions));
      }
    } catch (e) {
      console.warn('[ScrollRestoration] Load error:', e);
    }
  }

  /**
   * Save scroll positions to sessionStorage
   */
  saveToStorage() {
    try {
      if (typeof sessionStorage === 'undefined') return;
      const data = Object.fromEntries(this.positions);
      sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[ScrollRestoration] Save error:', e);
    }
  }

  /**
   * Save current scroll position for a route
   */
  savePosition(route) {
    if (typeof window === 'undefined') return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    this.positions.set(route, { scrollTop, scrollLeft, timestamp: Date.now() });
    this.saveToStorage();
  }

  /**
   * Get saved scroll position for a route
   */
  getPosition(route) {
    return this.positions.get(route);
  }

  /**
   * Restore scroll position for a route
   */
  restore(route, smooth = false) {
    if (typeof window === 'undefined') return false;
    const position = this.getPosition(route);
    if (!position) return false;

    try {
      window.scrollTo({
        top: position.scrollTop,
        left: position.scrollLeft,
        behavior: smooth ? 'smooth' : 'instant',
      });
      return true;
    } catch (e) {
      console.warn('[ScrollRestoration] Restore error:', e);
      return false;
    }
  }

  /**
   * Clear scroll position for a route
   */
  clear(route) {
    this.positions.delete(route);
    this.saveToStorage();
  }

  /**
   * Clear all scroll positions
   */
  clearAll() {
    this.positions.clear();
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(SCROLL_POSITIONS_KEY);
      }
    } catch (e) {
      console.warn('[ScrollRestoration] Clear error:', e);
    }
  }
}

// Lazy-load singleton: only instantiate when accessed in browser
let instance = null;

const getOrCreateInstance = () => {
  if (typeof window === 'undefined') {
    // Return a no-op object on the server
    return {
      savePosition: () => {},
      getPosition: () => null,
      restore: () => false,
      clear: () => {},
      clearAll: () => {},
    };
  }
  
  if (!instance) {
    instance = new ScrollRestoration();
  }
  return instance;
};

export const scrollRestoration = new Proxy({}, {
  get: (target, prop) => {
    const instance = getOrCreateInstance();
    return instance[prop];
  },
});

export default ScrollRestoration;
