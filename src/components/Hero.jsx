"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Terminal,
  Layers,
  Code,
  Zap,
  Shield,
  Monitor,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui";
import EditorialBackground from "@/components/ui/EditorialBackground";

import { homeData, portfolioData } from "@/lib/data";

const HeroTypewriter = dynamic(() => import("./HeroTypewriter"), {
  ssr: false,
  loading: () => <>Full-Stack Developer</>,
});

const DesktopTilt = dynamic(() => import("./DesktopTilt"), {
  ssr: false,
});

export default function Hero({ initialData = null }) {
  // Priority: Database Data > Static Data
  const data = {
    ...homeData.hero,
    ...portfolioData.siteConfig.hero,
    ...(initialData || {}),
    ctas:
      initialData?.ctas ||
      portfolioData.siteConfig.hero?.ctas ||
      homeData.hero.ctas,
    highlights:
      initialData?.highlights ||
      portfolioData.siteConfig.hero?.highlights ||
      homeData.hero.highlights,
  };
  const containerRef = useRef(null);
  // PHASE 3: Respect prefers-reduced-motion
  const shouldReduceMotion = useReducedMotion();

  // Icon mapping for feature icons
  const iconMap = {
    Terminal,
    Layers,
    Code,
    Zap,
    Shield,
    Monitor,
    Cpu,
  };

  const tiltOptions = {
    tiltReverse: false,
    tiltMaxAngleX: 15,
    tiltMaxAngleY: 15,
    perspective: 1000,
    scale: 1.02,
    transitionSpeed: 1000,
    transitionEasing: "cubic-bezier(.03,.98,.52,.99)",
  };

  const features = data.features.map((feature) => ({
    ...feature,
    icon: iconMap[feature.icon],
  }));

  return (
    <section
      ref={containerRef}
      className="relative min-h-[500px] flex flex-col justify-center px-6 py-12 overflow-hidden"
    >
      <EditorialBackground text="Home" />
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content Column */}
          <div className="flex flex-col items-start text-left">
            {/* Elite Status Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 inline-flex items-center gap-2.5 px-5 py-2 glass rounded-full border border-accent/20 shadow-[0_0_20px_rgba(var(--accent),0.1)]"
            >
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-accent"></div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-accent tracking-normal">
                {data.badge || "Ready for your next project"}
              </span>
            </motion.div>

            {/* Intro Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-4 h-6"
            >
              <span className="text-accent font-semibold tracking-normal text-sm">
                Hello, I am{" "}
                <span className="inline-block min-w-[18ch] text-foreground">
                  <HeroTypewriter words={data.typewriterWords} />
                </span>
              </span>
            </motion.div>

            {/* Hero Typography */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Full-Stack Web Developer{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent animate-gradient-flow bg-[length:200%_auto] italic">& NextJS MERN Expert</span>
              </h1>
            </motion.div>

            {/* Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-muted-foreground text-base md:text-lg max-w-xl mb-10 leading-relaxed font-medium opacity-80"
            >
              {data.description}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-8 max-w-xl text-sm font-semibold text-foreground/80"
            >
              Building modern websites, dashboards, and full-stack applications
              for businesses, startups, and personal brands.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {(data.highlights || []).map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-xs font-bold text-foreground/80"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  {highlight}
                </span>
              ))}
            </motion.div>

            {/* Strategic CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto"
            >
              {(data.ctas || []).map((cta, index) => (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  className="w-full md:w-auto"
                >
                  <Button
                    variant={cta.variant || (index === 0 ? "primary" : "outline")}
                    className="w-full"
                  >
                    {cta.label}
                    {index === 0 && (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </Button>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Right Visual Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
              // PHASE 3: disable infinite float when reduced-motion is preferred
              ...(shouldReduceMotion ? {} : { y: [0, -20, 0] }),
            }}
            transition={{
              duration: 1.2,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
              ...(shouldReduceMotion
                ? {}
                : {
                    y: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }),
            }}
            className="relative hidden lg:block"
          >
            <DesktopTilt {...tiltOptions}>
              <div className="relative z-10 w-full aspect-square max-w-[500px] mx-auto">
                {/* Main Visual - Borderless & Blended */}
                <div className="relative w-full h-full [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]">
                  <Image
                    src={data.visualImage || data.heroImage || "/hero-visual.webp"}
                    alt="Muhyo Tech full-stack development visual"
                    fill
                    className="object-cover"
                    priority
                    sizes="500px"
                  />
                  {/* Subtle Glow to match the theme */}
                  <div className="absolute inset-0 bg-accent/10 mix-blend-soft-light pointer-events-none" />
                </div>

                {/* Decorative Elements */}
                {/* PHASE 3: Decorative blobs only animate when motion is allowed */}
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -15, 0] }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"
                />
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, 15, 0] }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1,
                        }
                  }
                  className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                />

                {/* Floating Code Snippet Card */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    y: [0, 10, 0],
                  }}
                  transition={{
                    delay: 1.5,
                    duration: 0.8,
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute -right-6 top-1/4 glass p-4 rounded-xl border-accent/30 shadow-xl hidden xl:block"
                >
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-24 bg-accent/30 rounded" />
                    <div className="h-1.5 w-16 bg-muted-foreground/30 rounded" />
                    <div className="h-1.5 w-20 bg-accent/20 rounded" />
                  </div>
                </motion.div>
              </div>
            </DesktopTilt>
          </motion.div>
        </div>

        {/* Engineering Principles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mr-auto border-t border-border/10 mt-6 pt-6 lg:mt-12 lg:pt-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 shrink-0 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-xl shadow-accent/5">
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  {feature.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium opacity-70">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3"
      >
        <div className="w-[1px] h-20 bg-gradient-to-b from-accent/50 to-transparent relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "400%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-[20%] bg-accent"
          />
        </div>
      </motion.div>
    </section>
  );
}
