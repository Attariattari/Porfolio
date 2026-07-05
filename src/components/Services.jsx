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
import Image from "next/image";

const icons = {
  1: Layout,
  2: Palette,
  3: Server,
  4: Smartphone,
  5: Cloud,
  6: TrendingUp,
};

const serviceCopy = {
  "web-development": {
    description:
      "Fast, conversion-focused websites with clean architecture, strong SEO foundations, and polished user journeys that turn visitors into business leads.",
    problemSolved:
      "Slow, outdated websites lose trust quickly. We build premium web experiences that load fast, explain your offer clearly, and guide visitors toward action.",
  },
  "ui-ux-design": {
    description:
      "Elegant, easy-to-understand interfaces that make your product feel premium, reduce confusion, and help users move naturally from interest to action.",
    problemSolved:
      "When a product feels confusing, users leave. We simplify flows, improve visual hierarchy, and create experiences people can trust within seconds.",
  },
  "api-development": {
    description:
      "Secure APIs, databases, admin systems, and automation flows that keep your product reliable as your users, content, and operations grow.",
    problemSolved:
      "Manual processes and fragile backends slow teams down. We build dependable systems that reduce errors, protect data, and support growth.",
  },
  "mobile-app-development": {
    description:
      "Smooth iOS and Android app experiences with modern cross-platform technology, practical features, and flows that keep users engaged on the go.",
    problemSolved:
      "Customers expect mobile experiences to feel instant and simple. We help your brand stay accessible with apps that are fast, useful, and easy to return to.",
  },
  "cloud-devops": {
    description:
      "Secure cloud infrastructure, automated deployments, monitoring, and scaling workflows so your application can launch confidently and stay stable.",
    problemSolved:
      "Unstable deployments and server issues damage trust. We reduce release risk, improve uptime, and make your infrastructure easier to manage.",
  },
  "seo-digital-growth": {
    description:
      "Technical SEO, content structure, analytics, and conversion improvements that help the right customers find your brand and understand your value faster.",
    problemSolved:
      "Good businesses stay invisible when their site is not search-ready. We fix the technical and content gaps that block organic growth.",
  },
};

const itemLabel = (item) =>
  typeof item === "string" ? item : item?.title || item?.name || "";

const ServiceRow = ({ service, index, onImageClick }) => {
  const Icon = icons[service.id] || Layout;
  const copy = serviceCopy[service.slug] || {};
  const description = copy.description || service.shortDescription || service.description;
  const problemSolved = copy.problemSolved || service.problemSolved;
  const image = service.heroImage || service.banner || service.image;
  const benefits = Array.isArray(service.benefits) ? service.benefits : [];
  const techStack = Array.isArray(service.techStack) && service.techStack.length
    ? service.techStack
    : service.technologies || [];
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
          {description}
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
            "{problemSolved}"
          </p>
        </div>

        <div className={`${isReversed ? "" : "lg:ml-auto"}`}>
          <span className="text-xs font-bold text-muted-foreground tracking-normal mb-3 block">
            Key advantages
          </span>
          <div
            className={`flex flex-wrap gap-2 ${isReversed ? "" : "lg:justify-end"}`}
          >
            {benefits.map((b, i) => (
              <span
                key={i}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-background border border-border hover:border-accent/40 text-[10px] md:text-xs font-bold text-foreground/80 transition-colors shadow-sm"
              >
                {itemLabel(b)}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`mt-2 flex flex-col sm:flex-row gap-3 ${isReversed ? "" : "lg:justify-end"}`}
        >
          <Link href={`/services/${service.slug || service.id}`}>
            <motion.button
              whileHover={{ x: isReversed ? 5 : -5 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-3 text-sm font-bold text-accent-foreground bg-accent hover:bg-accent/90 px-6 py-4 rounded-xl transition-all shadow-xl shadow-accent/20 cursor-pointer ${isReversed ? "" : "lg:flex-row-reverse"}`}
            >
              Explore Service{" "}
              <ArrowRight
                className={`w-4 h-4 ${isReversed ? "" : "lg:rotate-180"}`}
              />
            </motion.button>
          </Link>
          <Link href="/contact?intent=book-call">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 rounded-xl border border-accent/40 bg-card/50 px-6 py-4 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Book a Call
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Image Side: Cinematic Slider-style — OPTIMIZED with Next/Image */}
      <div
        className={`w-full lg:w-[calc(50%-4rem)] relative group/img-side ${isReversed ? "lg:order-1" : "lg:order-2"} mt-12 lg:mt-0`}
      >
        {/* Accent glow */}
        <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full scale-90 animate-pulse -z-10" />

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 bg-background cursor-pointer"
          onClick={() => onImageClick(index)}
        >
          {/* PHASE 1: Next/Image replaces CSS background-image */}
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {image && (
              <Image
                src={image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-1000 group-hover/img-side:scale-110"
                loading="lazy"
              />
            )}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/20 z-10" />
          </motion.div>

          {/* Overlay content at bottom */}
          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end pointer-events-none z-20">
            <div className="relative z-10">
              {/* Accent badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Phase 0{index + 1}
              </div>
              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-[1.1] tracking-tighter drop-shadow-2xl">
                {service.title}
              </h3>
              {/* Tech stack tags */}
              <div className="flex flex-wrap gap-2">
                {techStack.slice(0, 4).map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-background/50 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-semibold text-white/80 tracking-normal"
                  >
                    {itemLabel(tech)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Services({ data, showViewAll = false }) {
  const [lightboxIndex, setLightboxIndex] = React.useState(null);

  if (!data) return null;

  const displayData = showViewAll ? data.slice(0, 3) : data;
  const galleryImages = displayData.map((s) => s.heroImage || s.banner || s.image).filter(Boolean);

  return (
    <SectionWrapper
      id="services"
      title="How I Can Help You"
      subtitle="My Services"
    >
      <div className="relative max-w-7xl mx-auto mt-8 md:mt-12 group/tree">
        {/* Central Vertical Line (Tree Trunk) */}
        <div className="absolute left-[23px] md:left-[51px] lg:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 lg:-translate-x-1/2 z-0" />
        <div className="absolute left-[23px] md:left-[51px] lg:left-1/2 top-4 bottom-4 w-[2px] bg-accent/20 blur-[2px] lg:-translate-x-1/2 z-0 opacity-0 group-hover/tree:opacity-100 transition-opacity duration-1000" />

        <div className="flex flex-col gap-12 md:gap-12 relative z-10 w-full overflow-hidden lg:overflow-visible pb-10">
          {displayData.map((service, index) => (
            <ServiceRow
              key={service._id || service.slug || service.id}
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
