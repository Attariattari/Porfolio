"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

export const ImageLightbox = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const safeImages = (Array.isArray(images) ? images : []).map((image) => getSafeImageSrc(image));

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("lightbox-open");
    } else {
      document.body.classList.remove("lightbox-open");
      setZoom(1);
    }
    return () => {
      document.body.classList.remove("lightbox-open");
    };
  }, [isOpen]);

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    setZoom(1);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    setZoom(1);
  };

  const handleImageClick = (e) => {
    e?.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
    } else {
      setZoom(2.5);
    }
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
    } else {
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

  if (!isOpen || safeImages.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/95 backdrop-blur-xl p-4 pt-24 md:p-0"
        onClick={onClose}
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
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
              title="Toggle Zoom"
            >
              {zoom > 1 ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>
            <button 
              onClick={toggleFullScreen}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={onClose}
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
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all z-[210] border border-white/5"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
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
          <motion.img
            key={currentIndex}
            src={safeImages[currentIndex]}
            alt="Gallery Detail"
            className={`max-w-full max-h-full object-contain rounded-sm shadow-2xl ${
              zoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            animate={{ 
              scale: zoom,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={handleImageClick}
            drag={zoom > 1}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          />
        </motion.div>

        {/* Thumbnails Strip (Desktop) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex gap-3 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl z-[210]">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setZoom(1); }}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex ? "border-accent scale-110 shadow-lg shadow-accent/20" : "border-transparent opacity-40 hover:opacity-100"
              }`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
