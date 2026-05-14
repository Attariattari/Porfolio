"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ImageLightbox } from "@/components/ImageLightbox";

export default function ProjectDetailView({ project }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <main className="p-6 md:p-32 bg-zinc-950 text-white min-h-screen">
      <Link
        href="/projects"
        className="text-sm opacity-50 hover:opacity-100 hover:underline font-bold tracking-normal italic mb-12 md:mb-24 block"
      >
        &larr; Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-start">
        <div className="space-y-12">
          <h1 className="text-4xl md:text-7xl font-bold italic tracking-tighter leading-none">
            {project.title}
          </h1>

          <div className="flex flex-col gap-8 md:gap-12 text-lg md:text-xl leading-relaxed opacity-80 font-medium border-l-2 border-white/10 pl-8 py-2">
            <p className="italic">"{project.description}"</p>
            <p className="text-base md:text-lg opacity-60">
              {project.details ||
                "This project represents the pinnacle of our engineering efforts."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 block mb-4">
                Tech stack
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.techStack) ? (
                  project.techStack.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="font-bold underline">
                    Digital Excellence
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 block mb-4">
                Outcome
              </span>
              <p className="text-sm font-bold italic">
                {project.impact || "Project Success"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div
            className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={project.thumbnail || project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="p-8 md:p-12 bg-white/5 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                Objective
              </span>
            </div>
            <p className="text-lg md:text-xl font-bold italic leading-tight">
              {project.purpose ||
                "Custom Solution Deployment for Enterprise Efficiency"}
            </p>
          </div>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={[
          project.thumbnail || project.image,
          ...(project.gallery || []),
        ]}
        initialIndex={0}
      />
    </main>
  );
}
