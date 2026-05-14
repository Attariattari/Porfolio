"use client";

import { motion } from "framer-motion";
import EditorialBackground from "@/components/ui/EditorialBackground";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  ChevronRight,
  Circle,
} from "lucide-react";
import { portfolioData } from "@/lib/data";
import Link from "next/link";

const IconMap = {
  Shield,
  Lock,
  Eye,
  FileText
};

const resolveIcon = (icon) => {
  if (typeof icon === 'string') {
    return IconMap[icon] || Shield;
  }
  return icon;
};

export default function PrivacyPolicy() {
  const { privacyPage } = portfolioData.siteConfig;
  const { sections, title, subtitle, description, finalStatement } =
    privacyPage;

  return (
    <div className="min-h-screen pt-32 pb-40 px-6 lg:px-24 relative overflow-hidden text-foreground selection:bg-accent/30 font-sans">
      <EditorialBackground text="Muhyo Tech" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="mb-40 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-accent"
          >
            <Link href="/" className="hover:opacity-70 transition-opacity">
              Muhyo Tech
            </Link>
            <ChevronRight size={10} className="text-muted-foreground" />
            <span className="text-muted-foreground/50">{subtitle}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.8] mix-blend-difference"
          >
            {title.split(" ").slice(0, 1).join(" ")}{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-[1rem]">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground text-xl lg:text-2xl italic max-w-3xl leading-relaxed pl-6 border-l-2 border-accent"
          >
            {description}
          </motion.p>
        </div>

        {/* Minimalist Tree Visualization */}
        <div className="relative">
          {/* Trunk SVG with Path Animation */}
          <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px lg:-translate-x-1/2 overflow-visible">
            <svg
              width="2"
              height="100%"
              className="overflow-visible h-full w-[2px]"
            >
              <motion.line
                x1="1"
                y1="0"
                x2="1"
                y2="100%"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="text-accent/40"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2 }}
              />
              <motion.circle
                cx="1"
                cy="0"
                r="3"
                className="fill-accent shadow-accent animate-pulse"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            </svg>
          </div>

          <div className="space-y-40">
            {sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${
                  idx % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Visual Branch Connection */}
                <div
                  className={`absolute left-6 lg:left-1/2 top-6 h-px bg-gradient-to-r ${
                    idx % 2 === 0
                      ? "from-accent/60 to-transparent lg:right-1/2 lg:left-auto"
                      : "from-transparent to-accent/60 lg:left-1/2 lg:right-auto"
                  } w-24 hidden lg:block`}
                />

                {/* Node Point Glower */}
                <div className="absolute left-6 lg:left-1/2 top-6 w-2.5 h-2.5 rounded-full bg-accent animate-pulse lg:-translate-x-1.25 z-20 shadow-[0_0_12px_rgba(var(--accent-rgb),0.8)]" />

                {/* Information Block (No Card) */}
                <div
                  className={`w-full md:w-[45%] ${idx % 2 === 0 ? "md:text-right" : "md:text-left"} pl-16 md:pl-0`}
                >
                  <div className="space-y-6">
                    <div
                      className={`flex items-center gap-4 ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                    >
                      <div className="text-accent w-12 h-12 flex items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 backdrop-blur-md">
                        {(() => {
                           const Icon = resolveIcon(section.icon);
                           return <Icon size={20} />;
                        })()}
                      </div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                        {section.title}
                      </h3>
                    </div>

                    <p className="text-muted-foreground/80 text-lg italic leading-snug max-w-md ml-auto mr-0 md:ml-0 md:mr-auto font-light">
                      {section.content}
                    </p>

                    <div
                      className={`flex flex-wrap gap-x-6 gap-y-3 ${idx % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}
                    >
                      {section.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-2 group cursor-default"
                        >
                          <Circle
                            size={4}
                            className="text-accent group-hover:scale-150 transition-all duration-300"
                            fill="currentColor"
                          />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all duration-300">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block md:w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-60 text-center space-y-12"
        >
          <div className="h-px w-24 bg-accent/40 mx-auto" />
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-foreground">
            {finalStatement.title.split(" ").slice(0, 1).join(" ")}{" "}
            <span className="text-accent">
              {finalStatement.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link
              href="/contact"
              className="px-10 py-4 h-14 rounded-full bg-accent text-background text-[10px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-transform flex items-center justify-center"
            >
              {finalStatement.cta}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
