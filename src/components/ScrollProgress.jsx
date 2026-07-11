"use client";

import { useEffect, useRef } from "react";

const progressClasses = Array.from(
  { length: 21 },
  (_, index) => `scroll-progress-${index * 5}`,
);

export default function ScrollProgress() {
  const progressRef = useRef(null);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      rafId = null;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (progressRef.current) {
        const bucket = Math.round(Math.min(1, Math.max(0, progress)) * 20) * 5;
        progressRef.current.classList.remove(...progressClasses);
        progressRef.current.classList.add(`scroll-progress-${bucket}`);
      }
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={progressRef}
      className="site-scroll-progress scroll-progress-0 fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-[9999] shadow-[0_0_20px_rgba(var(--color-accent),0.7)]"
    />
  );
}
