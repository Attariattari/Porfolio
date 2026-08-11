import React from "react";
import { SectionWrapper } from "./ui";
import { getServiceMediaAlt } from "@/lib/mediaAlt";
import ServicesListClient from "./ServicesListClient";

export default function Services({ data, showViewAll = false }) {
  if (!data) return null;

  const displayData = showViewAll ? data.slice(0, 3) : data;
  const galleryImages = displayData.map((s) => s.heroImage || s.banner || s.image).filter(Boolean);
  const galleryAlts = displayData
    .filter((s) => s.heroImage || s.banner || s.image)
    .map(getServiceMediaAlt);

  return (
    <SectionWrapper
      id="services"
      title="Website Development & Services"
      subtitle="My Services"
    >
      <div className="relative max-w-7xl mx-auto mt-8 md:mt-12 group/tree">
        {/* Central Vertical Line (Tree Trunk) */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 -translate-x-1/2 z-0" />
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-accent/20 blur-[2px] -translate-x-1/2 z-0 opacity-0 group-hover/tree:opacity-100 transition-opacity duration-1000" />

        <ServicesListClient
          displayData={displayData}
          galleryImages={galleryImages}
          galleryAlts={galleryAlts}
          showViewAll={showViewAll}
        />
      </div>
    </SectionWrapper>
  );
}
