"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Zap,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  Github,
} from "lucide-react";
import { Button } from "./ui";
import dynamic from "next/dynamic";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getProjectMediaAlt } from "@/lib/mediaAlt";
import Image from "next/image";

const ImageLightbox = dynamic(
  () => import("./ImageLightbox").then((mod) => mod.ImageLightbox),
  { ssr: false },
);

const ProjectModal = ({ selectedProject, setSelectedProject }) => {
  const [lightboxIndex, setLightboxIndex] = React.useState(null);

  React.useEffect(() => {
    if (selectedProject) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [selectedProject]);

  const [activeSlide, setActiveSlide] = React.useState(0);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (!selectedProject || lightboxIndex !== null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedProject(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, selectedProject, setSelectedProject]);

  if (!selectedProject) return null;

  const galleryImages = [
    selectedProject.thumbnail || selectedProject.thumbnailImage || selectedProject.image,
    ...(selectedProject.gallery || []),
  ].map((image) => getSafeImageSrc(image)).filter(Boolean);
  const galleryAlts = galleryImages.map((_, index) =>
    getProjectMediaAlt(selectedProject, index === 0 ? "thumbnail" : "gallery", Math.max(0, index - 1)),
  );
  const featureItems = (selectedProject.features || []).map((feature) =>
    typeof feature === "string" ? feature : feature.title,
  ).filter(Boolean);
  const resultItems = (selectedProject.results || []).map((result) =>
    typeof result === "string" ? result : result.description || result.title,
  ).filter(Boolean);

  const openLightbox = (index) => setLightboxIndex(index);

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-8"
      >
        <div
          className="absolute inset-0 bg-background/98 backdrop-blur-2xl"
          onClick={() => setSelectedProject(null)}
        />

        <m.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="relative w-full max-w-6xl h-[calc(100dvh-4rem)] md:h-auto max-h-[100dvh] md:max-h-[92vh] bg-card border-0 md:border border-border rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row"
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-border/50 rounded-full z-[121]" />

          {/* Close Button */}
          <button
            onClick={() => setSelectedProject(null)}
            aria-label="Close project details"
            className="absolute top-4 right-4 md:top-6 md:right-6 z-[120] w-10 h-10 rounded-full bg-background/80 md:bg-muted backdrop-blur-md text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all shadow-xl cursor-pointer border border-border/50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Left: Content Area (60%) */}
          <div className="w-full md:w-[60%] flex-1 min-h-0 p-6 md:p-14 md:overflow-y-auto custom-scrollbar space-y-10 md:space-y-12 pb-32 md:pb-14">
            {/* Header Section */}
            <div className="space-y-4 pt-10 md:pt-0">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                {selectedProject.category}
              </span>
              <h2 id="project-modal-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {selectedProject.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Project Overview */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground">
                Project Overview
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {selectedProject.overview || selectedProject.longDescription || selectedProject.details}
              </p>
            </div>

            {/* Mobile Gallery Slider (Framer Motion Drag) */}
            {galleryImages.length > 0 && (
              <div className="md:hidden py-6 -mx-6 relative overflow-hidden">
                <m.div
                  drag="x"
                  dragConstraints={{
                    right: 0,
                    left: -(
                      (galleryImages.length - 1) *
                      (typeof window !== "undefined"
                        ? window.innerWidth * 0.85 + 16
                        : 300)
                    ),
                  }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const threshold = 30; // Sensitive swipe
                    if (
                      info.offset.x < -threshold &&
                      activeSlide < galleryImages.length - 1
                    ) {
                      setActiveSlide((prev) => prev + 1);
                    } else if (info.offset.x > threshold && activeSlide > 0) {
                      setActiveSlide((prev) => prev - 1);
                    }
                  }}
                  animate={{
                    x:
                      -activeSlide *
                      (typeof window !== "undefined"
                        ? window.innerWidth * 0.85 + 16
                        : 0),
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="flex w-max gap-4 px-6 cursor-grab active:cursor-grabbing"
                >
                  {galleryImages.map((img, i) => (
                    <m.div
                      key={i}
                      className="flex-shrink-0 w-[85vw]"
                      onDoubleClick={() => openLightbox(i)}
                    >
                      <Image
                        src={getSafeImageSrc(img)}
                        alt={getProjectMediaAlt(selectedProject, "gallery", i)}
                        width={1600}
                        height={1000}
                        sizes="85vw"
                        className="w-full aspect-[16/10] object-cover rounded-2xl border border-border shadow-md select-none pointer-events-none"
                      />
                    </m.div>
                  ))}
                </m.div>

                {/* Scroll Indicator Dots */}
                {galleryImages.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        aria-label={`Show project image ${i + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          i === activeSlide
                            ? "w-6 h-1.5 bg-accent"
                            : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Challenge & Solution Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-border bg-background/50 space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Target className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-foreground">The Challenge</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProject.challenge || selectedProject.problem || "The project focused on turning a practical web requirement into a maintainable product experience."}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-border bg-background/50 space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-foreground">The Solution</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProject.details}
                </p>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground tracking-tight">
                Technical Ecosystem
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedProject.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 rounded-full border border-border bg-muted/30 text-xs font-medium text-foreground/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-foreground">
                Key Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                {(featureItems.length ? featureItems : [
                  "Responsive interface",
                  "Maintainable content structure",
                  "Clear user journeys",
                ]).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results & Impact */}
            <div className="p-6 md:p-8 rounded-2xl bg-accent/5 border border-accent/20 space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <TrendingUp className="w-5 h-5" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest">
                  Results & Impact
                </h4>
              </div>
              <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">{selectedProject.impact}</p>
              {resultItems.length > 0 && <ul className="space-y-3 pt-1">{resultItems.slice(0, 3).map((result) => <li key={result} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />{result}</li>)}</ul>}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-2">
              {selectedProject.liveUrl && <Button className="w-full sm:w-auto" onClick={() => window.open(selectedProject.liveUrl, "_blank", "noopener,noreferrer")}>Live Project <ExternalLink className="w-4 h-4" /></Button>}
              {selectedProject.githubUrl && <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.open(selectedProject.githubUrl, "_blank", "noopener,noreferrer")}>View Source <Github className="w-4 h-4" /></Button>}
            </div>
          </div>

          {/* Modal Right: Visual Showcase (40%) */}
          <div className="w-full md:w-[40%] bg-muted/30 relative">
            <div className="sticky top-0 h-full p-8 md:p-10 overflow-y-auto hidden md:block custom-scrollbar space-y-8">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Gallery
                </h4>
                <div className="h-0.5 w-8 bg-accent/30 rounded-full" />
              </div>

              <div className="space-y-8 pb-10">
                <div
                  className="rounded-xl overflow-hidden border border-border shadow-xl group cursor-zoom-in"
                  onClick={() => openLightbox(0)}
                >
                  <Image
                    src={getSafeImageSrc(selectedProject.thumbnail || selectedProject.thumbnailImage || selectedProject.image)}
                    alt={getProjectMediaAlt(selectedProject)}
                    width={1600}
                    height={1000}
                    sizes="40vw"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {selectedProject.gallery?.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-border shadow-xl group cursor-zoom-in"
                    onClick={() => openLightbox(i + 1)}
                  >
                    <Image
                      src={getSafeImageSrc(img)}
                      alt={getProjectMediaAlt(selectedProject, "gallery", i)}
                      width={1600}
                      height={1000}
                      sizes="40vw"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </m.div>

        {/* Professional Image Lightbox Overlay */}
      {lightboxIndex !== null && (
        <ImageLightbox
          isOpen
          onClose={() => setLightboxIndex(null)}
          images={galleryImages}
          alts={galleryAlts}
          alt={getProjectMediaAlt(selectedProject, "gallery")}
          initialIndex={lightboxIndex || 0}
        />
      )}
      </m.div>
    </AnimatePresence>
  );
};

export default ProjectModal;
