"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  ExternalLink,
  Code,
  ArrowRight,
} from "lucide-react";
import { SectionWrapper } from "./ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProjectMediaAlt } from "@/lib/mediaAlt";
import dynamic from "next/dynamic";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

const ProjectModal = dynamic(() => import("./ProjectModal"), {
  ssr: false,
});

const ProjectRow = ({ project, index, setSelectedProject, showViewAll }) => {
  const router = useRouter();
  const isReversed = index % 2 !== 0;
  const openProjectDetail = () => {
    if (project.slug) {
      router.push(`/projects/${project.slug}`);
      return;
    }
    setSelectedProject(project);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative flex flex-col lg:flex-row items-center justify-between w-full rounded-2xl border border-border/60 bg-card/45 p-4 shadow-sm backdrop-blur-md lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none group mb-8 lg:mb-32"
    >
      {/* Interactive Connector Node */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 w-8 h-8 rounded-xl bg-card border-2 border-accent/30 transform -translate-x-1/2 -translate-y-1/2 items-center justify-center z-20 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:scale-110 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
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
        className={`order-2 mt-5 w-full lg:mt-0 lg:w-[calc(50%-6rem)] flex flex-col gap-6 ${
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
          <h3 className="text-2xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4 lg:mb-6 group-hover:text-accent transition-colors italic">
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
            className={`flex flex-wrap items-center gap-3 ${
              isReversed ? "" : "lg:flex-row-reverse"
            }`}
          >
            {project.slug ? (
              <Link
                href={`/projects/${project.slug}`}
                prefetch={false}
                className="group/link relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-accent text-accent-foreground border border-accent/40 text-xs font-bold tracking-normal transition-all cursor-pointer overflow-hidden hover:-translate-y-0.5"
              >
                <span className="relative z-10">View Project</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={() => setSelectedProject(project)}
                className="group/link relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-accent text-accent-foreground border border-accent/40 text-xs font-bold tracking-normal transition-all cursor-pointer overflow-hidden hover:-translate-y-0.5"
              >
                <span className="relative z-10">View Project</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </button>
            )}
            {project.slug ? (
              <Link
                href={`/projects/${project.slug}`}
                prefetch={false}
                className="group/link relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 text-xs font-bold tracking-normal text-foreground hover:text-accent hover:border-accent/40 transition-all cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">Case study</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-[0.05]" />
              </Link>
            ) : (
              <button
                onClick={() => setSelectedProject(project)}
                className="group/link relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 text-xs font-bold tracking-normal text-foreground hover:text-accent hover:border-accent/40 transition-all cursor-pointer overflow-hidden"
              >
                <span className="relative z-10">Case study</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-[0.05]" />
              </button>
            )}
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

      {/* Image Side: Service-style card */}
      <div
        className={`order-1 w-full lg:w-[calc(50%-4rem)] relative group/img-side ${
          isReversed ? "lg:order-1" : "lg:order-2"
        } mt-0`}
      >
        <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full scale-90 opacity-70 -z-10" />

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={openProjectDetail}
          className="theme-media-frame relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border/70 bg-background cursor-pointer"
        >
          <Image
            src={getSafeImageSrc(project.thumbnail || project.thumbnailImage || project.image)}
            alt={getProjectMediaAlt(project)}
            fill
            priority={!showViewAll && index === 0}
            loading={showViewAll || index !== 0 ? "lazy" : undefined}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-1000 group-hover/img-side:scale-110"
          />

          <div className="theme-media-gradient absolute inset-0 z-10" />
          <div className="theme-media-tint absolute inset-0 z-10" />

          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end pointer-events-none z-20">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Project 0{index + 1}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 leading-[1.1] tracking-tight drop-shadow-2xl">
                {project.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.slice(0, 4).map((tech, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-background/50 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-semibold text-white/80 tracking-normal"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-30" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Projects({ data, showViewAll = false }) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);

  // For the home page, we show 4 projects in the tree
  const displayData = useMemo(
    () => (data ? (showViewAll ? data.slice(0, 4) : data) : []),
    [data, showViewAll],
  );

  if (!data) return null;

  return (
    <SectionWrapper id="projects" title="Featured Projects" subtitle="My Portfolio">
      <div className="relative max-w-7xl mx-auto mt-10 lg:mt-24 group/tree-main">
        {/* Central Vertical Trunk */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 -translate-x-1/2 z-0" />
        <div className="absolute left-[24px] md:left-[52px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-accent/10 blur-[3px] lg:-translate-x-1/2 z-0 hidden lg:block" />

        <div className="flex flex-col relative z-20">
          <AnimatePresence mode="popLayout">
            {displayData.map((project, index) => (
              <ProjectRow
                key={project._id || project.slug || project.id}
                project={project}
                index={index}
                setSelectedProject={setSelectedProject}
                showViewAll={showViewAll}
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
            prefetch={false}
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
      {selectedProject && (
        <ProjectModal
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
    </SectionWrapper>
  );
}
