"use client";

import { motion } from "framer-motion";
import { SectionWrapper } from "./ui";
import { homeData } from "@/lib/data";

const SkillBar = ({ name, level, category, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="mb-6 group"
  >
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground tracking-normal">
          {name}
        </span>
        <span className="text-[10px] font-semibold text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 tracking-normal">
          {category}
        </span>
      </div>
      <span className="text-xs font-bold text-muted-foreground">{level}%</span>
    </div>
    <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden border border-border">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
        className="h-full bg-gradient-to-r from-blue-600 via-accent to-cyan-400 group-hover:brightness-110 transition-all"
      />
    </div>
  </motion.div>
);

export default function Skills({ data }) {
  if (!data) return null;
  const categories = homeData.expertise?.categories || [];

  return (
    <SectionWrapper id="skills" title="My Expertise" subtitle="What I Can Do">
      {categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-wrap justify-center gap-3"
        >
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-border/60 bg-card/50 px-4 py-2 text-xs font-bold text-foreground/80"
            >
              {category}
            </span>
          ))}
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6">
        {data.map((skill, index) => (
          <SkillBar key={skill.name} {...skill} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
