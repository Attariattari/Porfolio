"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getBlogImageAlt } from "@/lib/blogImageAlt";

const AUTOPLAY_DELAY = 5000;
const SWIPE_THRESHOLD = 45;

export default function FeaturedBlogSlider({ featuredBlogs, onImageClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const pointerStart = useRef(null);
  const count = featuredBlogs?.length || 0;
  const isPaused = isHovered || hasFocus || isPointerDown;

  useEffect(() => {
    setActiveIndex((current) => (count ? Math.min(current, count - 1) : 0));
  }, [count]);

  useEffect(() => {
    if (count < 2 || isPaused) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % count),
      AUTOPLAY_DELAY,
    );
    return () => window.clearInterval(timer);
  }, [count, isPaused]);

  if (!count) return null;

  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + count) % count);
  const showNext = () =>
    setActiveIndex((current) => (current + 1) % count);

  const finishSwipe = (clientX) => {
    if (pointerStart.current === null) return;
    const distance = clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <div
      className="featured-slider relative grid cursor-grab overflow-hidden rounded-[2.5rem] active:cursor-grabbing"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured blog articles"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          showPrevious();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          showNext();
        }
      }}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
        setIsPointerDown(true);
      }}
      onPointerUp={(event) => {
        finishSwipe(event.clientX);
        setIsPointerDown(false);
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
        setIsPointerDown(false);
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {featuredBlogs.map((blog, index) =>
          index === activeIndex ? (
            <motion.div
              key={blog.id || blog.slug}
              initial={{ opacity: 0, x: "18%", scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: "-18%", scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="col-start-1 row-start-1 min-w-0"
              aria-hidden="false"
            >
              <div className="theme-surface-depth relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-background transition-all duration-700 group-hover:border-accent/30">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onImageClick(index)}
                    className="absolute inset-0 cursor-zoom-in"
                    aria-label={`Preview image for ${blog.title}`}
                  >
                    <Image
                      src={getSafeImageSrc(
                        blog.image || blog.featuredImage?.url,
                        "/portfolio-hero.png",
                      )}
                      alt={getBlogImageAlt(blog)}
                      width={1600}
                      height={1000}
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="absolute left-1/2 top-1/2 h-full w-auto min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </button>
                  <div className="theme-image-wash pointer-events-none absolute inset-0" />

                  <div className="pointer-events-none absolute left-8 top-8">
                    <span className="inline-flex animate-[hero-badge-reveal_800ms_ease-out_both] items-center gap-2 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      Featured
                    </span>
                  </div>
                </div>

                <div className="relative space-y-4 p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight text-foreground">
                      {blog.title}
                    </h3>
                  </motion.div>

                  <p className="line-clamp-2 text-sm italic leading-relaxed text-muted-foreground">
                    {blog.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {blog.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {blog.views || 0} views
                      </span>
                    </div>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent transition-colors hover:text-accent/80"
                    >
                      Read <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>

      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {featuredBlogs.map((blog, index) => (
            <button
              key={blog.id || blog.slug}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show featured article ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 rounded-full bg-accent transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 opacity-100"
                  : "w-2 opacity-20 hover:opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
