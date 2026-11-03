import {
  ArrowRight,
  Terminal,
  Layers,
  Code,
  Code2,
  Zap,
  Shield,
  ShieldCheck,
  Monitor,
  Cpu,
  Server,
  Database,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getHeroMediaAlt } from "@/lib/mediaAlt";
import { Button } from "@/components/ui";
import EditorialBackground from "@/components/ui/EditorialBackground";
import HeroTypewriter from "./HeroTypewriter";

import { homeData, portfolioData } from "@/lib/data";

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
  // Icon mapping for feature icons
  const iconMap = {
    Terminal,
    Layers,
    Code,
    Code2,
    Zap,
    Shield,
    ShieldCheck,
    Monitor,
    Cpu,
    Server,
    Database,
    TrendingUp,
    Sparkles,
  };

  const defaultFeatures = [
    {
      icon: "Layers",
      label: "Next.js & MERN Stack",
      description: "Full-stack architectures engineered for scale & speed.",
    },
    {
      icon: "Zap",
      label: "High Performance",
      description: "Sub-second load times & 95+ Core Web Vitals score.",
    },
    {
      icon: "Server",
      label: "Scalable APIs & Cloud",
      description: "Clean RESTful/GraphQL APIs & seamless serverless logic.",
    },
    {
      icon: "Database",
      label: "Robust Database",
      description: "Optimized MongoDB schema indexing & secure data flow.",
    },
    {
      icon: "ShieldCheck",
      label: "Enterprise Security",
      description: "Hardened authentication, RBAC & secure data encryption.",
    },
    {
      icon: "TrendingUp",
      label: "SEO & Conversion UX",
      description: "Engineered for maximum search visibility & engagement.",
    },
  ];

  const rawFeatures =
    Array.isArray(data.features) && data.features.length >= 6
      ? data.features
      : defaultFeatures;

  const features = rawFeatures.map((feature) => ({
    ...feature,
    icon: iconMap[feature.icon] || Zap,
  }));

  return (
    <section
      className="relative min-h-[500px] flex flex-col justify-center px-6 sm:px-12 pt-12 pb-24 overflow-hidden"
    >
      <EditorialBackground text="Home" />
      <div className="w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left Content Column */}
          <div className="hero-critical-content flex flex-col items-start text-left">
            {/* Elite Status Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 px-5 py-2 glass rounded-full border border-accent/20 shadow-[0_0_20px_rgba(var(--accent),0.1)]">
              <div className="relative flex h-2 w-2">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-accent"></div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-accent tracking-normal">
                {data.badge || "Ready for your next project"}
              </span>
            </div>

            {/* Intro Text */}
            <div className="mb-4 h-6">
              <span className="text-accent font-semibold tracking-normal text-sm">
                Hello, I am{" "}
                <span className="inline-block min-w-[18ch] text-foreground">
                  <HeroTypewriter words={data.typewriterWords} />
                </span>
              </span>
            </div>

            {/* Hero Typography */}
            <div className="relative mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                Full-Stack Web Developer{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent animate-gradient-flow bg-[length:200%_auto] italic">& NextJS MERN Expert</span>
              </h1>
            </div>

            {/* Value Proposition */}
            <p className="text-muted-foreground text-base md:text-lg w-full mb-5 leading-relaxed font-normal opacity-90">
              {data.description}
            </p>

            <p className="mb-8 max-w-2xl text-sm md:text-base font-medium text-foreground/85 leading-relaxed">
              Specializing in scalable full-stack architecture, intuitive UI/UX design, and production-grade web systems—transforming complex business requirements into fast, secure, and conversion-optimized digital products.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              {(data.highlights || []).map((highlight) => (
                <span
                  key={highlight}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-xs font-bold text-foreground/80"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  {highlight}
                </span>
              ))}
            </div>

            {/* Strategic CTA Section */}
            <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
              {(data.ctas || []).map((cta, index) => (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  prefetch={false}
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
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="relative hidden lg:block">
            <div className="transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative z-10 w-full aspect-square max-w-[500px] mx-auto">
                {/* Main Visual - Borderless & Blended */}
                <div className="hero-media-blend relative w-full h-full">
                  <Image
                    src={data.visualImage || data.heroImage || "/hero-visual.webp"}
                    alt={getHeroMediaAlt(data)}
                    fill
                    className="object-cover"
                    loading="eager"
                    fetchPriority="high"
                    sizes="500px"
                  />
                  {/* Subtle Glow to match the theme */}
                  <div className="theme-media-accent absolute inset-0 pointer-events-none" />
                </div>

                {/* Decorative Elements */}
                {/* PHASE 3: Decorative blobs only animate when motion is allowed */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"
                />
                <div
                  className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                />

                {/* Floating Code Snippet Card */}
                <div className="absolute -right-6 top-1/4 hidden rounded-xl border-accent/30 p-4 shadow-xl glass xl:block">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engineering Principles Grid */}
        <div className="w-full border-t border-border/15 pt-8 mt-8 lg:mt-14 lg:pt-10">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300 shadow-sm">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-200 tracking-tight leading-snug">
                    {feature.label}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 pointer-events-none z-20"
        aria-hidden="true"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 font-mono">
          Scroll
        </span>
        <div className="w-[1.5px] h-12 bg-gradient-to-b from-accent/30 via-accent/15 to-transparent relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-accent via-accent to-accent/40 rounded-full animate-scroll-drop shadow-[0_0_8px_rgba(var(--accent),0.7)]" />
        </div>
      </div>
    </section>
  );
}
