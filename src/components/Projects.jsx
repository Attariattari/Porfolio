"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  ExternalLink,
  Code,
  ArrowRight,
  Plus,
} from "lucide-react";
import { SectionWrapper } from "./ui";
import Link from "next/link";
import ProjectModal from "./ProjectModal";

const ProjectRow = ({ project, index, setSelectedProject }) => {
  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative flex flex-col lg:flex-row items-center justify-between w-full pl-16 md:pl-32 lg:pl-0 group mb-24 md:mb-32`}
    >
      {/* Interactive Connector Node */}
      <div className="absolute left-[13px] md:left-[41px] lg:left-1/2 top-10 lg:top-1/2 w-8 h-8 rounded-xl bg-card border-2 border-accent/30 transform lg:-translate-x-1/2 lg:-translate-y-1/2 flex items-center justify-center z-20 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:scale-110 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
        <div className="w-2 h-2 rounded-full bg-accent group-hover:animate-ping" />
      </div>

      {/* Animated Connector Path (Desktop Only) */}
      <div
        className={`hidden lg:block absolute top-1/2 ${
          isReversed ? "left-[calc(50%+4rem)]" : "right-[calc(50%+4rem)]"
        } w-[4rem] h-[2px] bg-gradient-to-r ${
          isReversed
            ? "from-accent via-accent/50 to-transparent"
            : "from-transparent via-accent/50 to-accent"
        } -translate-y-1/2 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
      />

      {/* Content Side */}
      <div
        className={`w-full lg:w-[calc(50%-6rem)] flex flex-col gap-6 ${
          isReversed
            ? "lg:order-2 text-left"
            : "lg:order-1 lg:text-right text-left"
        } relative z-10`}
      >
        <div
          className={`flex flex-col ${
            isReversed ? "items-start" : "lg:items-end items-start"
          }`}
        >
          <span className="px-4 py-1.5 bg-accent/5 rounded-full border border-accent/10 text-xs font-semibold tracking-normal text-accent/60 mb-5 group-hover:text-accent transition-colors">
            {project.category}
          </span>
          <h3 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-6 group-hover:text-accent transition-colors italic">
            {project.title}
          </h3>
          <p
            className={`text-muted-foreground text-sm md:text-lg leading-relaxed font-medium italic mb-10 max-w-lg ${
              isReversed ? "" : "lg:ml-auto"
            }`}
          >
            "{project.description}"
          </p>

          {/* Tech Minimalist View */}
          <div
            className={`flex flex-wrap gap-2 mb-10 ${
              isReversed ? "" : "lg:justify-end"
            }`}
          >
            {project.techStack?.slice(0, 4).map((tech, i) => (
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
            className={`flex items-center gap-8 ${
              isReversed ? "" : "lg:flex-row-reverse"
            }`}
          >
            <button
              onClick={() => setSelectedProject(project)}
              className="group/link relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 text-xs font-bold tracking-normal text-foreground hover:text-accent hover:border-accent/40 transition-all cursor-pointer overflow-hidden"
            >
              <span className="relative z-10">Case study</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-[0.05]" />
            </button>
            <div className="w-px h-6 bg-border/20" />
            <div className="flex gap-4">
              {project.demoLink && (
                <Link href={project.demoLink} target="_blank">
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </Link>
              )}
              {project.githubLink && (
                <Link href={project.githubLink} target="_blank">
                  <Github className="w-4 h-4 text-muted-foreground hover:text-accent cursor-pointer transition-colors" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Side: Elevated with 3D feel */}
      <div
        className={`w-full lg:w-[calc(50%-6rem)] relative group/img-side ${
          isReversed ? "lg:order-1" : "lg:order-2"
        } mt-12 lg:mt-0`}
      >
        <div className="absolute -inset-4 bg-accent/10 blur-3xl rounded-full scale-50 opacity-0 group-hover/img-side:opacity-100 transition-opacity duration-1000" />

        <motion.div
          whileHover={{
            scale: 1.02,
            rotateX: 2,
            rotateY: isReversed ? 2 : -2,
          }}
          onClick={() => setSelectedProject(project)}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative p-2 rounded-[3.5rem] border border-white/5 bg-white/[0.03] backdrop-blur-3xl overflow-hidden shadow-2xl group-hover/img-side:border-accent/40 transition-colors cursor-pointer"
        >
          <div className="relative rounded-[2.8rem] overflow-hidden aspect-[16/11] w-full">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover transform transition-all duration-1000 group-hover/img-side:scale-110 group-hover/img-side:rotate-1"
            />
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-transparent to-transparent opacity-80" />

            {/* Hover Indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img-side:opacity-100 transition-opacity bg-accent/10 backdrop-blur-[4px]">
              <div className="px-8 py-3 rounded-full bg-white text-accent flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-50 group-hover/img-side:scale-100 transition-transform duration-500">
                <span className="text-xs font-bold tracking-normal">View case study</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Floating Metadata */}
            <div className="absolute top-8 left-8">
              <div className="px-4 py-2 bg-background/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-semibold text-white tracking-normal">
                  Production ready
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Projects({ data, showViewAll = false }) {
  const [selectedProject, setSelectedProject] = useState(null);
  
  if (!data) return null;

  // For the home page, we show 4 projects in the tree
  const displayData = showViewAll ? data.slice(0, 4) : data;

  return (
    <SectionWrapper id="projects" title="Featured Work" subtitle="My Portfolio">
      <div className="relative max-w-7xl mx-auto mt-24 group/tree-main">
        {/* Central Vertical Trunk */}
        <div className="absolute left-[24px] md:left-[52px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 lg:-translate-x-1/2 z-0" />
        <div className="absolute left-[24px] md:left-[52px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-accent/10 blur-[3px] lg:-translate-x-1/2 z-0 hidden lg:block" />

        <div className="flex flex-col relative z-20">
          <AnimatePresence mode="popLayout">
            {displayData.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                index={index}
                setSelectedProject={setSelectedProject}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {showViewAll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/projects"
            className="group relative px-8 py-4 bg-accent text-accent-foreground font-bold text-sm rounded-full overflow-hidden transition-all hover:pr-12"
          >
            <span className="relative z-10 flex items-center gap-2">
              View all projects <Code className="w-4 h-4" />
            </span>
            <div className="absolute top-0 -right-full w-full h-full bg-foreground/10 group-hover:right-0 transition-all duration-300" />
            <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-5 h-5" />
          </Link>
        </motion.div>
      )}

      {/* Reusable Project Modal */}
      <ProjectModal 
        selectedProject={selectedProject} 
        setSelectedProject={setSelectedProject} 
      />
    </SectionWrapper>
  );
}
