"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Github,
  Code,
  ArrowRight,
  Plus,
  Layers,
  Users,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProjectModal from "./ProjectModal";
import { SectionWrapper, Button } from "./ui";
import EditorialBackground from "./ui/EditorialBackground";

const Portfolio = ({ projects }) => {
  const router = useRouter();
  const categories = useMemo(
    () => ["All", ...new Set(projects.map((p) => p.category))],
    [projects],
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredProjects = projects.slice(0, 3); // Changed from slice(0, 3) to use all projects
  const filteredProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects],
  );
  const projectHref = (project) => `/projects/${project.slug || project.id}`;
  const openProjectDetail = (project) => {
    if (project.slug) {
      router.push(projectHref(project));
      return;
    }
    setSelectedProject(project);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProjects.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [featuredProjects.length]);

  useEffect(() => {
    projects
      .filter((project) => project.slug)
      .slice(0, 8)
      .forEach((project) => {
        router.prefetch(projectHref(project));
      });
  }, [projects, router]);

  const scrollToProjects = () => {
    document
      .getElementById("projects-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden ">
      {/* 1. Hero Section */}
      <section className="relative py-14 px-6 overflow-hidden">
        <EditorialBackground text="Portfolio" />
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* LEFT SIDE: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Top Label */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-[1px] w-8 bg-accent/40" />
                <span className="text-[11px] font-bold tracking-normal text-accent">
                  Portfolio / Selected work
                </span>
              </div>

              {/* Impactful Headline */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-[ -0.04em] mb-10">
                Engineering <br />
                <span className="text-accent underline decoration-accent/10 underline-offset-[12px]">
                  Modern Digital
                </span>{" "}
                <br />
                Products.
              </h1>

              {/* Refined Description */}
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl font-medium opacity-90">
                A showcase of high-performance web applications, scalable SaaS
                architectures, and user-centric digital experiences built with
                mathematical precision and creative intent.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-5">
                <Button onClick={scrollToProjects}>
                  Explore Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Button>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="backdrop-blur-md border-border/80"
                  >
                    Start a Project
                  </Button>
                </Link>
              </div>

              {/* Floating Social/Trust Badges (Subtle) */}
              <div className="mt-16 flex items-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-normal text-muted-foreground">
                    Trusted by
                  </span>
                  <div className="flex gap-4">
                    <span className="text-sm font-bold">TechCorp</span>
                    <span className="text-sm font-bold">SaaSFlow</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE: Elevated Visual Showcase */}
            <div
              className="relative hidden h-[680px] items-center justify-center lg:flex"
              style={{ perspective: "2000px" }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {featuredProjects.map((project, idx) => {
                  const position =
                    (idx - currentSlide + featuredProjects.length) %
                    featuredProjects.length;
                  const isActive = position === 0;

                  return (
                    <motion.div
                      key={project._id || project.slug || project.id}
                      initial={{ opacity: 0, x: 200, rotateY: 30 }}
                      animate={{
                        opacity: isActive ? 1 : 0.4 / (position + 1),
                        x: position * 58,
                        y: position * -34,
                        z: position * -120,
                        rotateY: -18 + position * 4,
                        rotateX: position * 2,
                        scale: 1 - position * 0.06,
                        zIndex: 10 - position,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 20,
                        mass: 1.2,
                      }}
                      className={`absolute h-[430px] w-[660px] overflow-hidden rounded-2xl border bg-card shadow-[0_44px_110px_rgba(0,0,0,0.45)] transition-all cursor-pointer ${
                        isActive
                          ? "border-accent/55 ring-1 ring-accent/25"
                          : "border-border/40"
                      }`}
                      onClick={() => openProjectDetail(project)}
                    >
                      {/* Browser Frame Mockup Effect */}
                      <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center gap-3 border-b border-white/10 bg-background/70 px-5 backdrop-blur-xl">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        </div>
                        <div className="ml-3 flex h-6 flex-1 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3">
                          <span className="truncate text-[10px] font-semibold text-muted-foreground">
                            muhyotech.com/projects/{project.slug || project.id}
                          </span>
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      <div className="relative h-full w-full pt-12">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          loading={idx === currentSlide ? "eager" : "lazy"}
                          className={`h-full w-full object-cover transition-all duration-[2s] ${
                            isActive
                              ? "grayscale-0 scale-100"
                              : "grayscale scale-110 opacity-50"
                          }`}
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-70" />

                        {/* Card Info Overlay */}
                        <div
                          className={`absolute inset-0 flex flex-col justify-end p-8 transition-opacity duration-700 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <span className="rounded-lg border border-accent/25 bg-accent/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent backdrop-blur-md">
                              {project.category}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                              Featured build
                            </span>
                          </div>
                          <h3 className="max-w-xl text-4xl font-black leading-[1.02] tracking-tight text-white drop-shadow-2xl">
                            {project.title}
                          </h3>
                          <p className="mt-4 max-w-lg line-clamp-2 text-sm font-medium leading-relaxed text-white/72">
                            {project.description}
                          </p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.techStack?.slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Glass Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />
                    </motion.div>
                  );
                })}

                {/* Decorative Elements for depth */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Projects Grid: Clean & Compact */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Minimal Section Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-accent/40" />
                <span className="text-[10px] font-bold tracking-normal text-accent">
                  Featured projects
                </span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground italic">
                Engineering <span className="text-accent">showcase</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Button
                variant="outline"
                onClick={scrollToProjects}
                className="text-[9px] px-6 py-3"
              >
                View full gallery
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* Clean 3-Column Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProjects.map((project, idx) => (
              <motion.div
                key={project._id || project.slug || project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative h-full"
              >
                <div
                  className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/55 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-accent/35 hover:shadow-2xl hover:shadow-black/10"
                  onClick={() => openProjectDetail(project)}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-accent">
                        Project 0{idx + 1}
                      </span>
                      <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">
                        {project.category}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <div className="relative m-5 mb-0 aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-background">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                    <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-md">
                      Featured
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent">
                      {project.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5 text-[10px] font-bold text-foreground/70 transition-colors group-hover:border-accent/25"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between border-t border-border/60 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-accent">
                        View project
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {project.demoLink && (
                            <Link
                              href={project.demoLink}
                              target="_blank"
                              onClick={(event) => event.stopPropagation()}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background/60 transition-colors hover:border-accent/40 hover:text-accent"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          {project.githubLink && (
                            <Link
                              href={project.githubLink}
                              target="_blank"
                              onClick={(event) => event.stopPropagation()}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background/60 transition-colors hover:border-accent/40 hover:text-accent"
                            >
                              <Github className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Selected Projects Grid: Enhanced for Consistency */}
      {/* 4. Selected Projects Grid: Re-designed as a Dynamic exploration Tree */}
      <section
        id="projects-grid"
        className="py-12 md:py-16 px-6 relative overflow-hidden"
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-accent/40" />
                <span className="text-[10px] font-bold tracking-normal text-accent">
                  Archived excellence
                </span>
                <div className="h-[1px] w-8 bg-accent/40" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground italic underline decoration-accent/10 underline-offset-8">
                Selected works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-6 font-medium italic opacity-80">
                A legacy of digital precision—exploring the intersections of
                scalable architecture and impactful user experience.
              </p>
            </motion.div>
          </div>

          {/* Category Filter - Premium Switcher */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-8 py-3 rounded-2xl text-[10px] font-bold tracking-normal transition-all duration-500 border overflow-hidden group ${
                  activeCategory === cat
                    ? "text-accent-foreground border-accent z-10"
                    : "bg-card/30 text-muted-foreground border-border/50 hover:border-accent/40"
                }`}
              >
                <span className="relative z-10">{cat}</span>
                {activeCategory === cat && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-accent -z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform -z-0" />
              </button>
            ))}
          </div>

          {/* Project Tree Structure */}
          <div className="relative group/tree-main">
            {/* Central Vertical Trunk */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 -translate-x-1/2 z-0" />
            <div className="absolute left-[24px] md:left-[52px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-accent/10 blur-[3px] lg:-translate-x-1/2 z-0 hidden lg:block" />

            <div className="flex flex-col gap-6 lg:gap-24 relative z-10">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => {
                  const isReversed = index % 2 !== 0;

                  return (
                    <motion.div
                      key={project._id || project.slug || project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="relative flex flex-col lg:flex-row items-center justify-between w-full rounded-2xl border border-border/60 bg-card/45 p-4 shadow-sm backdrop-blur-md lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none group"
                    >
                      {/* Interactive Connector Node */}
                      <div className="hidden lg:flex absolute left-1/2 top-1/2 w-8 h-8 rounded-xl bg-card border-2 border-accent/30 transform -translate-x-1/2 -translate-y-1/2 items-center justify-center z-20 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:scale-110 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
                        <div className="w-2 h-2 rounded-full bg-accent group-hover:animate-ping" />
                      </div>

                      {/* Animated Connector Path (Desktop Only) */}
                      <div
                        className={`hidden lg:block absolute top-1/2 ${
                          isReversed
                            ? "left-[calc(50%+4rem)]"
                            : "right-[calc(50%+4rem)]"
                        } w-[4rem] h-[2px] bg-gradient-to-r ${
                          isReversed
                            ? "from-accent via-accent/50 to-transparent"
                            : "from-transparent via-accent/50 to-accent"
                        } -translate-y-1/2 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                      />

                      {/* Content Side */}
                      <div
                        className={`order-2 mt-5 w-full lg:mt-0 lg:w-[calc(50%-6rem)] flex flex-col gap-6 ${
                          isReversed
                            ? "lg:order-2 text-left"
                            : "lg:order-1 lg:text-right text-left"
                        } relative z-10`}
                      >
                        <div
                          className={`flex flex-col ${
                            isReversed
                              ? "items-start"
                              : "lg:items-end items-start"
                          }`}
                        >
                          <span className="px-4 py-1.5 bg-accent/5 rounded-full border border-accent/10 text-[9px] font-bold tracking-normal text-accent/60 mb-5 group-hover:text-accent transition-colors">
                            {project.category}
                          </span>
                          <h3 className="text-2xl md:text-5xl font-bold text-foreground tracking-tight lg:tracking-tighter leading-tight lg:leading-none mb-4 lg:mb-6 group-hover:text-accent transition-colors">
                            {project.title}
                          </h3>
                          <p
                            className={`text-muted-foreground text-sm md:text-lg leading-relaxed font-medium italic mb-6 lg:mb-10 max-w-lg ${
                              isReversed ? "" : "lg:ml-auto"
                            }`}
                          >
                            &ldquo;{project.description}&rdquo;
                          </p>

                          {/* Tech Minimalist View */}
                          <div
                            className={`flex flex-wrap gap-2 mb-6 lg:mb-10 ${
                              isReversed ? "" : "lg:justify-end"
                            }`}
                          >
                            {project.techStack.slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="px-4 py-2 rounded-xl bg-card border border-border/50 text-[10px] font-semibold text-foreground/60 tracking-normal hover:border-accent/30 hover:text-foreground transition-all"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* Refined Actions */}
                          <div
                            className={`flex flex-wrap items-center gap-4 lg:gap-8 ${
                              isReversed ? "" : "lg:flex-row-reverse"
                            }`}
                          >
                            <button
                              onClick={() => openProjectDetail(project)}
                              className="group/link flex items-center gap-3 text-[11px] font-bold tracking-normal text-foreground hover:text-accent transition-all"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
                            </button>
                            <div className="w-px h-6 bg-border/20" />
                            <div className="flex gap-4">
                              {(project.liveUrl || project.liveLink || project.demoLink) && (
                                <Link
                                  href={project.liveUrl || project.liveLink || project.demoLink}
                                  target="_blank"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                                </Link>
                              )}
                              {(project.githubUrl || project.gitLink || project.githubLink) && (
                                <Link
                                  href={project.githubUrl || project.gitLink || project.githubLink}
                                  target="_blank"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Github className="w-4 h-4 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Image Side: Cinematic Service-style Card */}
                      <div
                        className={`order-1 w-full lg:w-[calc(50%-6rem)] relative group/img-side ${
                          isReversed ? "lg:order-1" : "lg:order-2"
                        } mt-0`}
                      >
                        {/* Accent glow */}
                        <div className="absolute bg-accent/20 blur-[40px] rounded-full scale-90 animate-pulse -z-10 inset-0" />

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 bg-background cursor-pointer"
                          onClick={() => openProjectDetail(project)}
                        >
                          {/* Background image with animated scale-in */}
                          <motion.div
                            initial={{ scale: 1.2, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/img-side:scale-110"
                            style={{
                              backgroundImage: `url(${project.thumbnail})`,
                            }}
                          >
                            {/* Dark gradient overlay — same as ServiceSlider */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute inset-0 bg-black/20" />
                          </motion.div>

                          {/* Overlay content at bottom */}
                          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end pointer-events-none">
                            <div className="relative z-10 pointer-events-auto">
                              {/* Accent badge — same style as "Service N" in ServiceSlider */}
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                {project.category}
                              </div>
                              {/* Project title */}
                              <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-[1.1] tracking-tighter drop-shadow-2xl">
                                {project.title}
                              </h3>
                              {/* Subtle description — same italic border-l style */}
                              <p className="text-white/70 text-xs md:text-sm line-clamp-2 italic font-medium border-l-2 border-accent/50 pl-3">
                                &ldquo;{project.description}&rdquo;
                              </p>
                            </div>
                          </div>

                          {/* Glass reflection — same as hero cards */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Client Results Section */}
      <section className="py-12 px-6 bg-card/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                label: "Completed Projects",
                value: "50+",
                sub: "Engineering Excellence",
              },
              { label: "Happy Clients", value: "30+", sub: "Global Trust" },
              {
                label: "Performance Inc",
                value: "120%",
                sub: "Average Metric",
              },
              { label: "User Growth", value: "45%+", sub: "Engagement Delta" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-10 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-center items-center text-center"
              >
                <span className="text-4xl md:text-5xl font-bold text-accent mb-3 tracking-tighter">
                  {stat.value}
                </span>
                <span className="text-foreground font-bold text-[10px] tracking-normal mb-1">
                  {stat.label}
                </span>
                <span className="text-muted-foreground text-[8px] font-medium tracking-normal">
                  {stat.sub}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 5. Core Approach Overview Section */}
      <section className="py-12 px-6 border-y border-border/50 bg-card/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
              How We Build Modern Digital Products
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic font-medium">
              We combine architectural integrity with user-centered precision to
              deliver software that scales.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Clean Architecture",
                desc: "We build scalable, maintainable systems using clean code principles that stay resilient as you grow.",
                icon: Layers,
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                title: "Performance First",
                desc: "Optimized for speed, SEO, and accessibility to ensure the best possible experience for every user.",
                icon: Zap,
                color: "text-amber-500 bg-amber-500/10",
              },
              {
                title: "User-Centered Design",
                desc: "Strategic UI/UX that aligns with user behavior and business goals to drive measurable impact.",
                icon: Users,
                color: "text-purple-500 bg-purple-500/10",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl border border-border bg-card hover:border-accent/30 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Technologies Section */}
      <section className="py-12 px-6 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-normal text-accent mb-4">
              Ecosystem mastery
            </h2>
            <div className="h-1 w-20 bg-accent/30 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-opacity duration-700">
            {[
              "Next.js",
              "React",
              "Node.js",
              "MongoDB",
              "Tailwind",
              "Stripe",
              "AWS",
              "Framer",
            ].map((tech, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 group/tech cursor-default"
              >
                <Code className="w-8 h-8 text-foreground/40 group-hover/tech:text-accent transition-colors" />
                <span className="text-[10px] font-semibold tracking-normal">
                  {tech}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="py-12 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-accent/20 via-card to-card border border-accent/20 relative overflow-hidden text-center shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 blur-[120px] rounded-full" />
            <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tighter leading-none">
              Have an idea for your <br /> next{" "}
              <span className="text-accent">digital product?</span>
            </h2>
            <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto italic font-medium opacity-80">
              Let&apos;s build a high-performance web platform or SaaS experience
              that helps you reach your targets faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button className="w-full">Start a project</Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  Contact Muhyo Tech
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Case Study Modal */}
      <ProjectModal
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
    </div>
  );
};

export default Portfolio;
