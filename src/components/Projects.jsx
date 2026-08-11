import React from "react";
import { SectionWrapper } from "./ui";
import ProjectsListClient from "./ProjectsListClient";

export default function Projects({ data, showViewAll = false }) {
  if (!data) return null;

  // For the home page, we show 4 projects in the tree
  const displayData = showViewAll ? data.slice(0, 4) : data;

  return (
    <SectionWrapper id="projects" title="Featured Projects" subtitle="My Portfolio">
      <div className="relative max-w-7xl mx-auto mt-10 lg:mt-24 group/tree-main">
        {/* Central Vertical Trunk */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 -translate-x-1/2 z-0" />
        <div className="absolute left-[24px] md:left-[52px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-accent/10 blur-[3px] lg:-translate-x-1/2 z-0 hidden lg:block" />

        <ProjectsListClient displayData={displayData} showViewAll={showViewAll} />
      </div>
    </SectionWrapper>
  );
}
