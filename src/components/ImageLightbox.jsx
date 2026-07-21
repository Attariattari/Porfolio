"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { ensureMuhyoTechAlt } from "@/lib/mediaAlt";
import Image from "next/image";

const imageSlideVariants = {
  enter: (direction) => ({
    opacity: direction === 0 ? 1 : 0.65,
    x: direction === 0 ? 0 : direction > 0 ? "100vw" : "-100vw",
    scale: 1,
  }),
  exit: (direction) => ({
    opacity: 0.65,
    x: direction > 0 ? "-100vw" : "100vw",
    scale: 1,
  }),
};

const imageSlideTransition = {
  x: { type: "spring", stiffness: 280, damping: 30, mass: 0.8 },
  opacity: { duration: 0.18 },
  scale: { type: "spring", stiffness: 220, damping: 25 },
};

const centeredZoomOrigin = { x: 50, y: 50 };

export const ImageLightbox = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  alt = "Muhyo Tech media gallery image",
  alts = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState(centeredZoomOrigin);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const mainImageDragRef = useRef({ moved: false });
  const thumbnailTrackRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const thumbnailDragRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const safeImages = (Array.isArray(images) ? images : []).map((image) => getSafeImageSrc(image));
  const imageAlts = safeImages.map((_, index) =>
    ensureMuhyoTechAlt(alts[index], `${alt} ${index + 1}`),
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const resetFrame = window.requestAnimationFrame(() => {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setZoomOrigin(centeredZoomOrigin);
      setSlideDirection(0);
    });

    return () => window.cancelAnimationFrame(resetFrame);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("lightbox-open");
    } else {
      document.body.classList.remove("lightbox-open");
    }
    return () => {
      document.body.classList.remove("lightbox-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || safeImages.length === 0) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setSlideDirection(1);
        setCurrentIndex((previous) => (previous + 1) % safeImages.length);
        setZoom(1);
        setZoomOrigin(centeredZoomOrigin);
      }
      if (event.key === "ArrowLeft") {
        setSlideDirection(-1);
        setCurrentIndex(
          (previous) =>
            (previous - 1 + safeImages.length) % safeImages.length,
        );
        setZoom(1);
        setZoomOrigin(centeredZoomOrigin);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, safeImages.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const track = thumbnailTrackRef.current;
      const activeThumbnail = thumbnailRefs.current[currentIndex];
      if (!track || !activeThumbnail) return;

      const trackBounds = track.getBoundingClientRect();
      const thumbnailBounds = activeThumbnail.getBoundingClientRect();
      const edgeSpacing = 8;
      let scrollDistance = 0;

      if (thumbnailBounds.left < trackBounds.left + edgeSpacing) {
        scrollDistance =
          thumbnailBounds.left - trackBounds.left - edgeSpacing;
      } else if (thumbnailBounds.right > trackBounds.right - edgeSpacing) {
        scrollDistance =
          thumbnailBounds.right - trackBounds.right + edgeSpacing;
      }

      if (scrollDistance === 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      track.scrollBy({
        left: scrollDistance,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentIndex, isOpen]);

  const scrollThumbnailTrack = (direction) => {
    const track = thumbnailTrackRef.current;
    if (!track) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.scrollBy({
      left: direction * Math.max(280, track.clientWidth * 0.75),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleThumbnailPointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = thumbnailTrackRef.current;
    if (!track) return;

    thumbnailDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    track.setPointerCapture(event.pointerId);
  };

  const handleThumbnailPointerMove = (event) => {
    const drag = thumbnailDragRef.current;
    const track = thumbnailTrackRef.current;
    if (!track || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    if (!drag.moved) return;

    event.preventDefault();
    track.scrollLeft = drag.startScrollLeft - distance;
  };

  const handleThumbnailPointerEnd = (event) => {
    const drag = thumbnailDragRef.current;
    const track = thumbnailTrackRef.current;
    if (!track || drag.pointerId !== event.pointerId) return;

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    drag.pointerId = null;

    window.setTimeout(() => {
      drag.moved = false;
    }, 0);
  };

  const handleClose = () => {
    setZoom(1);
    setZoomOrigin(centeredZoomOrigin);
    onClose();
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setSlideDirection(1);
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    setZoom(1);
    setZoomOrigin(centeredZoomOrigin);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setSlideDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    setZoom(1);
    setZoomOrigin(centeredZoomOrigin);
  };

  const handleImageClick = (e) => {
    e?.stopPropagation();
    if (mainImageDragRef.current.moved) return;
    if (zoom > 1) {
      setZoom(1);
      setZoomOrigin(centeredZoomOrigin);
    } else {
      const imageBounds = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - imageBounds.left) / imageBounds.width) * 100;
      const y = ((e.clientY - imageBounds.top) / imageBounds.height) * 100;

      setZoomOrigin({
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      });
      setZoom(2.5);
    }
  };

  const handleMainImageDrag = (_, info) => {
    if (Math.abs(info.offset.x) > 4 || Math.abs(info.offset.y) > 4) {
      mainImageDragRef.current.moved = true;
    }
  };

  const handleMainImageDragEnd = (_, info) => {
    if (zoom === 1) {
      const shouldChangeImage =
        Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 600;

      if (shouldChangeImage) {
        if (info.offset.x < 0) handleNext();
        else handlePrev();
      }
    }

    window.setTimeout(() => {
      mainImageDragRef.current.moved = false;
    }, 0);
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
      setZoomOrigin(centeredZoomOrigin);
    } else {
      setZoomOrigin(centeredZoomOrigin);
      setZoom(2.5);
    }
  };

  const toggleFullScreen = (e) => {
    e?.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  if (!isOpen || safeImages.length === 0 || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery"
        className="fixed inset-0 z-[10050] isolate flex items-end md:items-center justify-center bg-black/95 backdrop-blur-xl p-4 pt-24 md:p-0"
        onClick={handleClose}
      >
        {/* Controls Overlay */}
        <div className="absolute top-16 md:top-0 left-0 right-0 p-6 flex items-center justify-between z-[210] bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <span className="text-white/70 text-xs font-mono tracking-widest uppercase">
              {currentIndex + 1} <span className="opacity-30">/</span> {safeImages.length}
            </span>
          </div>
          
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={toggleZoom}
              aria-label={zoom > 1 ? "Zoom out image" : "Zoom in image"}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
              title="Toggle Zoom"
            >
              {zoom > 1 ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <button 
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? "Exit full screen" : "View full screen"}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={handleClose}
              aria-label="Close image gallery"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              aria-label="View previous image"
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[210] border border-white/5"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              aria-label="View next image"
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[210] border border-white/5"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Main Image Container */}
        <motion.div 
          className="relative w-full h-full flex items-center justify-center p-4 md:p-20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={slideDirection}>
              <motion.img
                key={currentIndex}
                src={safeImages[currentIndex]}
                alt={imageAlts[currentIndex]}
                custom={slideDirection}
                variants={imageSlideVariants}
                initial="enter"
                animate={{ opacity: 1, x: 0, scale: zoom }}
                exit="exit"
                transition={imageSlideTransition}
                style={{
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                draggable={false}
                className={`absolute max-h-full max-w-full select-none rounded-sm object-contain shadow-2xl ${
                  zoom > 1
                    ? "cursor-zoom-out"
                    : "cursor-grab active:cursor-grabbing"
                }`}
                onClick={handleImageClick}
                onDragStart={() => {
                  mainImageDragRef.current.moved = false;
                }}
                onDrag={handleMainImageDrag}
                onDragEnd={handleMainImageDragEnd}
                drag={zoom > 1 ? true : "x"}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={zoom > 1 ? 0.2 : 0.8}
                dragMomentum={false}
              />
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Thumbnails Strip (Desktop) */}
        <div
          className="absolute bottom-6 left-1/2 z-[210] hidden w-[calc(100vw-8rem)] max-w-6xl -translate-x-1/2 items-center gap-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl md:flex"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => scrollThumbnailTrack(-1)}
            aria-label="Scroll thumbnails left"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/75 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            ref={thumbnailTrackRef}
            className="no-scrollbar flex min-w-0 flex-1 cursor-grab snap-x snap-mandatory select-none gap-3 overflow-x-auto px-1 py-2 active:cursor-grabbing"
            aria-label="Image gallery thumbnails"
            onPointerDown={handleThumbnailPointerDown}
            onPointerMove={handleThumbnailPointerMove}
            onPointerUp={handleThumbnailPointerEnd}
            onPointerCancel={handleThumbnailPointerEnd}
          >
            {safeImages.map((img, i) => (
              <button
                key={i}
                ref={(element) => {
                  thumbnailRefs.current[i] = element;
                }}
                type="button"
                onClick={(event) => {
                  if (thumbnailDragRef.current.moved) {
                    event.preventDefault();
                    return;
                  }
                  setSlideDirection(i === currentIndex ? 0 : i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                  setZoom(1);
                  setZoomOrigin(centeredZoomOrigin);
                }}
                aria-label={`View image ${i + 1}: ${imageAlts[i]}`}
                aria-pressed={i === currentIndex}
                className={`h-14 w-14 shrink-0 snap-center overflow-hidden rounded-lg border-2 transition-[border-color,opacity,transform,box-shadow] duration-200 ${
                  i === currentIndex
                    ? "scale-110 border-accent opacity-100 shadow-lg shadow-accent/20"
                    : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${imageAlts[i]} thumbnail`}
                  width={56}
                  height={56}
                  sizes="56px"
                  quality={50}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollThumbnailTrack(1)}
            aria-label="Scroll thumbnails right"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-white/75 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
