"use client";

import { motion } from "framer-motion";
import {
  Layout,
  Palette,
  Server,
  ArrowRight,
  MousePointerClick,
  Smartphone,
  Cloud,
  TrendingUp,
} from "lucide-react";
import { SectionWrapper, Card } from "./ui";
import Link from "next/link";
import React from "react";
import { ImageLightbox } from "./ImageLightbox";

const icons = {
  1: Layout,
  2: Palette,
  3: Server,
  4: Smartphone,
  5: Cloud,
  6: TrendingUp,
};

const ServiceRow = ({ service, index, onImageClick }) => {
  const Icon = icons[service.id] || Layout;
  // Even index: Text Left, Image Right. Odd index: Image Left, Text Right
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`relative flex flex-col lg:flex-row items-center justify-between w-full pl-16 md:pl-28 lg:pl-0`}
    >
      {/* Central Node for Tree */}
      <div className="absolute left-[12px] md:left-[40px] lg:left-1/2 top-10 lg:top-1/2 w-6 h-6 rounded-full bg-background border-[3px] border-accent transform lg:-translate-x-1/2 lg:-translate-y-1/2 flex items-center justify-center z-20 transition-transform duration-500 hover:scale-[1.3] cursor-pointer shadow-lg shadow-accent/40">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping absolute" />
      </div>

      {/* Horizontal Connector Line (Desktop Only) */}
      <div className="hidden lg:block absolute top-1/2 left-[calc(50%-4rem)] w-[8rem] h-[2px] bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 -translate-y-1/2 z-0" />

      {/* Content Side */}
      <div
        className={`w-full lg:w-[calc(50%-4rem)] flex flex-col gap-6 md:gap-8 ${isReversed ? "lg:order-2 text-left" : "lg:order-1 lg:text-right text-left"} relative z-10`}
      >
        <div
          className={`flex items-center gap-4 ${isReversed ? "flex-row" : "flex-row lg:flex-row-reverse"}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-lg shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <span className="text-accent font-bold tracking-normal text-xs block mb-1">
              Phase 0{index + 1}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {service.title}
            </h3>
          </div>
        </div>

        <p
          className={`text-muted-foreground text-sm md:text-lg leading-relaxed ${isReversed ? "" : "lg:ml-auto"}`}
        >
          {service.description}
        </p>

        {/* Challenge Box */}
        <div
          className={`bg-secondary/5 rounded-2xl p-6 border border-border/50 relative overflow-hidden group hover:border-accent/30 transition-colors ${isReversed ? "text-left" : "lg:text-right text-left"}`}
        >
          <div
            className={`absolute top-0 ${isReversed ? "left-0" : "left-0 lg:right-0 lg:left-auto"} w-1 h-full bg-accent`}
          />
          <span className="text-xs font-bold text-accent tracking-normal mb-3 block">
            The challenge
          </span>
          <p className="text-sm italic text-foreground/80 leading-relaxed">
            "{service.problemSolved}"
          </p>
        </div>

        <div className={`${isReversed ? "" : "lg:ml-auto"}`}>
          <span className="text-xs font-bold text-muted-foreground tracking-normal mb-3 block">
            Key advantages
          </span>
          <div
            className={`flex flex-wrap gap-2 ${isReversed ? "" : "lg:justify-end"}`}
          >
            {service.benefits.map((b, i) => (
              <span
                key={i}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-background border border-border hover:border-accent/40 text-[10px] md:text-xs font-bold text-foreground/80 transition-colors shadow-sm"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className={`mt-2 ${isReversed ? "" : "lg:flex lg:justify-end"}`}>
          <Link href={`/services/${service.slug || service.id}`}>
            <motion.button
              whileHover={{ x: isReversed ? 5 : -5 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-3 text-sm font-bold text-accent-foreground bg-accent hover:bg-accent/90 px-6 py-4 rounded-xl transition-all shadow-xl shadow-accent/20 cursor-pointer ${isReversed ? "" : "lg:flex-row-reverse"}`}
            >
              Explore strategy{" "}
              <ArrowRight
                className={`w-4 h-4 ${isReversed ? "" : "lg:rotate-180"}`}
              />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Image Side */}
      <div
        className={`w-full lg:w-[calc(50%-4rem)] relative group ${isReversed ? "lg:order-1" : "lg:order-2"} mt-12 lg:mt-0`}
      >
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <Card className="relative p-2 md:p-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transform transition-all duration-700 group-hover:scale-[1.02] shadow-2xl">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
            <img
              src={service.banner}
              alt={service.title}
              className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
              onClick={() => onImageClick(index)}
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 border border-white/10 rounded-2xl" />

            <div
              className={`absolute bottom-6 left-6 right-6 ${isReversed ? "" : "lg:text-right"}`}
            >
              <div
                className={`flex gap-2 flex-wrap ${isReversed ? "" : "lg:justify-end"}`}
              >
                {service.techStack?.slice(0, 4).map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-semibold text-foreground tracking-normal"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default function Services({ data, showViewAll = false }) {
  const [lightboxIndex, setLightboxIndex] = React.useState(null);

  if (!data) return null;

  const displayData = showViewAll ? data.slice(0, 3) : data;
  const galleryImages = displayData.map(s => s.banner);

  return (
    <SectionWrapper
      id="services"
      title="How I Can Help You"
      subtitle="My Services"
    >
      <div className="relative max-w-7xl mx-auto mt-12 md:mt-24 group/tree">
        {/* Central Vertical Line (Tree Trunk) */}
        <div className="absolute left-[23px] md:left-[51px] lg:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 lg:-translate-x-1/2 z-0" />
        <div className="absolute left-[23px] md:left-[51px] lg:left-1/2 top-4 bottom-4 w-[2px] bg-accent/20 blur-[2px] lg:-translate-x-1/2 z-0 opacity-0 group-hover/tree:opacity-100 transition-opacity duration-1000" />

        <div className="flex flex-col gap-24 md:gap-32 relative z-10 w-full overflow-hidden lg:overflow-visible pb-10">
          {displayData.map((service, index) => (
            <ServiceRow 
              key={service.id} 
              service={service} 
              index={index} 
              onImageClick={(idx) => setLightboxIndex(idx)}
            />
          ))}
        </div>
      </div>

      <ImageLightbox 
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={galleryImages}
        initialIndex={lightboxIndex || 0}
      />

      {showViewAll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 md:mt-24 flex justify-center"
        >
          <Link
            href="/services"
            className="group relative px-8 py-4 bg-accent text-accent-foreground font-bold text-sm rounded-full overflow-hidden transition-all hover:pr-12 shadow-xl hover:shadow-accent/40"
          >
            <span className="relative z-10 flex items-center gap-2">
              View all services <MousePointerClick className="w-4 h-4" />
            </span>
            <div className="absolute top-0 -right-full w-full h-full bg-foreground/10 group-hover:right-0 transition-all duration-300" />
            <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-5 h-5" />
          </Link>
        </motion.div>
      )}
    </SectionWrapper>
  );
}
