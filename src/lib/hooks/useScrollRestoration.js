/**
 * useScrollRestoration Hook
 * 
 * Automatically restore scroll position when navigating back
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { scrollRestoration } from '@/lib/scrollRestoration';

export function useScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Check for scroll restoration flag in window
      const isBackNavigation = window.history.state?.restored === true;
      
      if (isBackNavigation || document.readyState === 'loading') {
        // Restore with slight delay to allow DOM rendering
        setTimeout(() => {
          scrollRestoration.restore(pathname, false);
        }, 50);
      } else {
        // Check if we have a saved position for this route
        const position = scrollRestoration.getPosition(pathname);
        if (position) {
          // Only restore if we have a significant scroll position
          if (position.scrollTop > 100) {
            setTimeout(() => {
              scrollRestoration.restore(pathname, false);
            }, 100);
          }
        }
      }
    });
  }, [pathname]);

  return {
    savePosition: (route) => scrollRestoration.savePosition(route),
    clearPosition: (route) => scrollRestoration.clear(route),
  };
}

export default useScrollRestoration;
