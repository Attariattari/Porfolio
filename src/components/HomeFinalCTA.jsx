"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { homeData } from "@/lib/data";

export default function HomeFinalCTA() {
  const data = homeData.finalCTA;

  return (
    <section className="relative px-4 md:px-8 lg:px-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-accent/10 via-background to-accent/5 p-10 text-center shadow-2xl md:p-20"
      >
        <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-card/40 px-5 py-2 text-xs font-bold text-accent">
            <Sparkles className="h-4 w-4" />
            {data.badge}
          </div>

          <h2 className="mb-6 text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            {data.title}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
            {data.description}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {data.buttons.map((button, index) => (
              <Link
                key={`${button.href}-${button.label}`}
                href={button.href}
                className="w-full sm:w-auto"
              >
                <Button
                  variant={button.variant || (index === 0 ? "primary" : "outline")}
                  className="w-full rounded-2xl"
                >
                  {button.label}
                  {index === 0 && <ArrowRight className="h-4 w-4" />}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

