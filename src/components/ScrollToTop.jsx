"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser default scroll restoration behavior
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Immediate scroll on route change
    window.scrollTo(0, 0);
    
    // Fallback for slower rendering components or heavy images
    const handleScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    };

    // Run multiple times in the first few frames to ensure it sticks
    handleScroll();
    const frames = [10, 50, 100, 200];
    const timers = frames.map(ms => setTimeout(handleScroll, ms));

    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
