"use client";

import { motion, useInView } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Zap,
  Code2,
  Sparkles,
  Phone,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Globe,
  Verified,
  Briefcase,
  Shield,
  Cpu,
  Layers,
} from "lucide-react";
import { SectionWrapper, Button } from "./ui";
import EditorialBackground from "./ui/EditorialBackground";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { portfolioData } from "@/lib/data";
import useAdminStore from "@/lib/store/adminStore";
import SocialLinks from "./SocialLinks";

const resolveIcon = (icon) => {
  if (typeof icon === "string") {
    // Map string icon names to actual components
    const iconMap = {
      Award: Award,
      Briefcase: Briefcase,
      CheckCircle2: CheckCircle2,
      Zap: Zap,
      Code2: Code2,
      Sparkles: Sparkles,
      Phone: Phone,
      Verified: Verified,
      Globe: Globe,
      ChevronDown: ChevronDown,
      ChevronUp: ChevronUp,
      ArrowRight: ArrowRight,
    };
    return iconMap[icon] || Sparkles;
  }
  return icon;
};

const StatBadge = ({ icon: Icon, text, subtitle, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex items-center gap-3 p-4 rounded-2xl glass border border-white/10 hover:border-accent/30 transition-all group scale-90 md:scale-100"
    >
      <div className="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-bold text-foreground">{text}</div>
        <div className="text-xs font-semibold text-muted-foreground tracking-normal">
          {subtitle}
        </div>
      </div>
    </motion.div>
  );
};

export default function About({
  data: initialData = null,
  isHomePage = false,
}) {
  const { about: storeAbout } = useAdminStore();
  // When rendering, we might get server-side initialData (which lacks static fields since it's from DB)
  // Therefore, static fields must ALWAYS come from the static data.js explicitly
  const staticData = portfolioData.about;

  // Extract strictly static data handles which are not part of the DB Schema
  const staticDataProps = {
    values: staticData.values || [],
    features: staticData.features || [],
    coreValuesLarge: staticData.coreValuesLarge || [],
    focusAreas: staticData.focusAreas || [],
    contactInfo: staticData.contactInfo || [],
  };

  // The base dynamic data can be DB SSR data (initialData), store DB data (storeAbout), or fallback to static data
  // 🔍 DEBUG: Check where data is coming from in the component
  // Priority logic for the final source
  // Priority logic: Store Data (Real-time updates) > Initial Data (SSR) > Static Data (Fallback)
  const dynamicSource =
    storeAbout && storeAbout.name
      ? storeAbout
      : initialData && initialData.name
        ? initialData
        : staticData;

  const activeAboutData = {
    // 1. Core Dynamic Profile Data (DB takes priority)
    name: dynamicSource.name || staticData.name,
    company: dynamicSource.company || staticData.company,
    role: dynamicSource.role || staticData.role,
    avatar: dynamicSource.avatar || staticData.avatar,

    // 2. Content
    bio: dynamicSource.bio || staticData.bio,
    longDescription:
      dynamicSource.longDescription || staticData.longDescription,
    mission: dynamicSource.mission || staticData.mission,
    typewriterWords:
      Array.isArray(dynamicSource.typewriterWords) &&
      dynamicSource.typewriterWords.length > 0
        ? dynamicSource.typewriterWords
        : staticData.typewriterWords || [],

    // 3. Contact Information
    email: dynamicSource.email || staticData.email,
    phone: dynamicSource.phone || staticData.phone,
    location: dynamicSource.location || staticData.location,
    workingHours: dynamicSource.workingHours || staticData.workingHours,

    // 4. Work Experience
    experiences:
      Array.isArray(dynamicSource.experiences) &&
      dynamicSource.experiences.length > 0
        ? dynamicSource.experiences
        : staticData.experiences || [],

    // 5. Strictly Static Data (Not in DB Schema, only from data.js)
    ...staticDataProps,
  };

  const data = activeAboutData;

  if (!data) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [particles, setParticles] = useState([]);
  const narrativeRef = useRef(null);

  // Initialize particle positions only on client to avoid hydration mismatch
  useEffect(() => {
    const particlePositions = [...Array(15)].map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 5,
    }));
    setParticles(particlePositions);
  }, []);

  const [text] = useTypewriter({
    words: Array.isArray(activeAboutData?.typewriterWords)
      ? activeAboutData.typewriterWords
      : [],
    loop: true,
    delaySpeed: 2000,
  });

  // 🚀 RELIABILITY FIX: If we are on client and data is still static, fetch from API
  useEffect(() => {
    const syncData = async () => {
      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/about");
          const result = await res.json();
          if (result.success && result.data && result.data.avatar) {
            console.log("🚀 Relayed DB Data Sycned:", result.data.avatar);
            // We don't necessarily need to set state if we use the store,
            // but let's update the store to trigger re-render
            useAdminStore.getState().fetchAbout();
          }
        } catch (e) {
          console.error("Sync failed:", e);
        }
      }
    };
    syncData();
  }, []);

  const {
    avatar,
    features,
    experiences,
    coreValuesLarge,
    focusAreas,
    contactInfo,
  } = activeAboutData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="relative overflow-hidden">
      {/* Visual Enhancements Background */}
      {!isHomePage && <EditorialBackground text="About" />}
      <div
        className={`absolute top-0 left-0 w-full ${isHomePage ? "h-full" : "h-[1500px]"} pointer-events-none -z-10`}
      >
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>
      <SectionWrapper
        id="about"
        subtitle="About Muhyo Tech"
        title="Muhyo Tech"
        className={isHomePage ? "" : "pb-12"}
      >
        {/* Step 1: Hero / Introduction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start relative z-10">
          {/* Left: Image & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-1"
          >
            {/* Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-accent/10 blur-[100px] rounded-full -z-10 animate-pulse" />

            <div className="relative z-10 p-2 glass rounded-[1.5rem] overflow-hidden group border border-white/10 hover:border-accent/30 transition-all duration-700">
              <div className="relative w-full aspect-[4/5] rounded-[1rem] overflow-hidden shadow-2xl">
                <Image
                  src={avatar}
                  alt={data.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
                {/* Dynamic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

                {/* Floating ID Tag */}
                <div className="absolute bottom-10 left-10 p-4 glass rounded-2xl border border-border backdrop-blur-xl translate-y-10 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
                  <div className="text-xs font-bold text-accent mb-1 underline decoration-accent/30 decoration-2 underline-offset-4 italic">
                    Founder
                  </div>
                  <div className="text-xl font-bold text-foreground italic">
                    {data.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Badges */}
            <div className="absolute -bottom-10 right-0 md:-right-6 lg:-right-12 z-20 flex flex-col gap-4">
              <StatBadge
                icon={Sparkles}
                text="3+ Years"
                subtitle="Software Professional"
                delay={0.6}
              />
              <StatBadge
                icon={Verified}
                text="100%"
                subtitle="Trust Metrics Verified"
                delay={0.8}
              />
            </div>
          </motion.div>

          {/* Right: Narrative & Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col pt-0 lg:pt-12 order-2 lg:order-2"
          >
            {/* Typewriter Header */}
            <motion.div variants={itemVariants} className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground italic">
                Engineering{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent animate-gradient-flow bg-[length:200%_auto]">
                  {text}
                </span>
                <Cursor cursorColor="var(--color-accent)" cursorStyle="|" />
              </h3>
            </motion.div>

            {/* Narrative with Read More */}
            <motion.div variants={itemVariants} className="mb-10">
              <div
                ref={narrativeRef}
                className={`text-muted-foreground text-lg leading-relaxed font-medium transition-all duration-700 overflow-hidden ${isExpanded ? "max-h-[1000px]" : "max-h-[180px] lg:max-h-none"}`}
              >
                {data.longDescription}
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="lg:hidden mt-4 flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest hover:underline cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Read Full Story <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Core Values Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12"
            >
              {data.values?.map((val, i) => (
                <motion.div
                  key={i}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "var(--color-card)",
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 backdrop-blur-sm transition-all shadow-sm group/val"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover/val:bg-accent group-hover/val:text-accent-foreground transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80 group-hover/val:text-foreground italic">
                    {val}
                  </span>
                </motion.div>
              ))}
            </motion.div>
            <SocialLinks />
            {/* Read Full Story Button for Home Page */}
            {isHomePage && (
              <motion.div variants={itemVariants} className="mt-12">
                <Link href="/about">
                  <Button variant="outline">
                    Discover my full story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {!isHomePage && (
          <div className="space-y-20">
            {/* Experience Section */}
            <div className="mt-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h4 className="text-accent text-xs font-semibold tracking-normal mb-4">
                  Professional journey
                </h4>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Experience & expertise
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-8 glass rounded-[2.5rem] border border-border hover:border-accent/30 transition-all duration-500 group shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                        {(() => {
                          const Icon = resolveIcon(exp.icon) || Briefcase;
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <span className="text-xs font-bold text-accent bg-accent/5 px-3 py-1 rounded-full border border-accent/20">
                        {exp.year}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-bold text-muted-foreground mb-4 italic">
                      {exp.company} • {exp.duration}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium italic">
                      "{exp.description}"
                    </p>

                    <div className="space-y-3 pt-6 border-t border-border/10">
                      {exp.milestones.map((milestone, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="text-xs font-bold text-foreground/80">
                            {milestone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Core Values Section */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h4 className="text-accent text-xs font-semibold tracking-normal mb-4">
                  Our DNA
                </h4>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  The values we stand by
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreValuesLarge.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-8 glass rounded-3xl border border-white/10 hover:border-accent/30 transition-all duration-500 overflow-hidden relative group"
                  >
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 ${value.bg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}
                    />
                    <div
                      className={`w-12 h-12 rounded-2xl ${value.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                    >
                      {(() => {
                        const Icon = resolveIcon(value.icon);
                        return <Icon className={`w-6 h-6 ${value.color}`} />;
                      })()}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      {value.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Redesigned Mission Focus - Futuristic Bento Grid */}
            <div className="relative">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20 relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6 group hover:bg-accent/10 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span className="text-accent text-xs font-semibold tracking-normal">
                    Core philosophy
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight italic">
                  Mission focus
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                  Our mission is to bridge the gap between complex engineering
                  and intuitive user experiences.
                </p>
              </motion.div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-7xl mx-auto px-4 relative z-10">
                {/* 1. UI/UX - Large Hero Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="md:col-span-4 md:row-span-2 p-1 relative overflow-hidden rounded-[3.5rem] group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="h-full w-full glass p-12 flex flex-col justify-between relative z-10 rounded-[3.4rem] border border-border group-hover:border-accent/30 transition-all duration-500 shadow-2xl">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                      <Sparkles className="w-80 h-80 text-accent" />
                    </div>

                    <div className="w-16 h-16 rounded-3xl bg-accent flex items-center justify-center shadow-[0_0_30px_var(--color-accent)] group-hover:scale-110 transition-transform mb-20 shadow-accent/40">
                      {(() => {
                        const Icon = resolveIcon(focusAreas[0].icon);
                        return (
                          <Icon className="w-8 h-8 text-accent-foreground" />
                        );
                      })()}
                    </div>

                    <div>
                      <h3 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
                        {focusAreas[0].title}
                      </h3>
                      <p className="text-muted-foreground text-xl leading-relaxed font-medium max-w-2xl">
                        {focusAreas[0].desc}
                      </p>
                      <div className="mt-8 flex items-center gap-6">
                        <div className="h-px w-20 bg-accent/30" />
                        <span className="text-accent text-xs font-semibold tracking-normal">
                          Premium aesthetic guaranteed
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 2. Performance - Vertical Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2 md:row-span-2 glass p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center text-center justify-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-accent blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                    {(() => {
                      const Icon = resolveIcon(focusAreas[1].icon);
                      return (
                        <Icon className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
                      );
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {focusAreas[1].title}
                  </h3>
                  <p className="text-muted-foreground font-medium text-center">
                    {focusAreas[1].desc}
                  </p>
                </motion.div>

                {/* 3. Scalability - Horizontal Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-3 glass p-10 rounded-[3.5rem] border border-border flex items-center gap-8 group shadow-xl"
                >
                  <div className="p-5 rounded-3xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 shadow-lg shadow-accent/5">
                    {(() => {
                      const Icon = resolveIcon(focusAreas[2].icon);
                      return <Icon className="w-10 h-10" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 italic tracking-tight">
                      {focusAreas[2].title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      {focusAreas[2].desc}
                    </p>
                  </div>
                </motion.div>

                {/* 4. Client-Centric - Interactive Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-3 glass p-10 rounded-[3.5rem] border border-border flex items-center gap-8 group bg-gradient-to-r from-transparent to-accent/5 shadow-xl"
                >
                  <div className="p-5 rounded-3xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 shadow-lg shadow-accent/5">
                    {(() => {
                      const Icon = resolveIcon(focusAreas[3].icon);
                      return <Icon className="w-10 h-10" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 italic tracking-tight">
                      {focusAreas[3].title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      {focusAreas[3].desc}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)] opacity-[0.03] pointer-events-none -z-10" />
            </div>

            {/* Professional Features Section */}
            <div className="">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h4 className="text-accent text-xs font-semibold tracking-normal mb-4">
                  Unmatched precision
                </h4>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Why choose Muhyo Tech?
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group relative p-10 glass rounded-[2.5rem] border border-white/10 hover:border-accent/30 transition-all duration-500 overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem]`}
                    />

                    <div
                      className={`w-16 h-16 rounded-2xl ${f.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10`}
                    >
                      {(() => {
                        const Icon = resolveIcon(f.icon);
                        return <Icon className={`w-8 h-8 ${f.color}`} />;
                      })()}
                    </div>

                    <div className="relative z-10">
                      <h5 className="text-xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors tracking-tight">
                        {f.title}
                      </h5>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {f.desc}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-accent opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      <span className="text-xs font-semibold tracking-normal">
                        Explore standard
                      </span>
                      <div className="h-px flex-1 bg-accent/20" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Step 3: Contact Info & Support */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div>
                  <h4 className="text-accent text-xs font-semibold tracking-normal mb-4">
                    Availability
                  </h4>
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">
                    Let's discuss your next move
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium max-w-md">
                    Whether you're starting from scratch or scaling an existing
                    platform, our doors are open for collaboration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                        {(() => {
                          const Icon = resolveIcon(item.icon);
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          {item.label}
                        </div>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="text-base font-bold text-foreground hover:text-accent transition-colors break-all"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-base font-bold text-foreground">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Interactive Achievement Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative p-1 glass rounded-[3rem] overflow-hidden group shadow-2xl"
              >
                <div className="relative p-12 lg:p-16 h-full flex flex-col justify-center gap-8 relative z-10">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Globe className="w-64 h-64 text-accent" />
                  </div>

                  <div className="flex -space-x-4 mb-4">
                    {[Shield, Zap, Globe, Cpu, Layers].map((BrandIcon, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-4 border-background bg-accent/10 flex items-center justify-center backdrop-blur-xl shadow-xl transition-transform hover:-translate-y-1"
                      >
                        <BrandIcon className="w-5 h-5 text-accent" />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
                    Trusted by Forward-Thinking Brands{" "}
                    <span className="text-accent underline decoration-accent/20 decoration-4 underline-offset-8 font-serif leading-none">
                      Globally.
                    </span>
                  </h3>

                  <div className="mt-4 p-8 bg-accent/5 border border-accent/20 rounded-[2rem] flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-accent group-hover:shadow-[0_0_30px_var(--color-accent)] transition-shadow duration-500 shadow-accent/40">
                      <Verified className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        Aesthetic
                      </div>
                      <div className="text-xs font-semibold text-accent tracking-normal">
                        Precision verified
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Step 4: Call to Action (Simple & Attractive Redesign) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-32 relative group"
            >
              {/* Premium Background Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5 rounded-[3rem] -z-10 overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-150" />
              </div>

              <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center overflow-hidden rounded-[3rem]">
                {/* Modern Status Chip */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-10 inline-flex items-center gap-3 px-5 py-2 glass rounded-full border border-accent/30 shadow-[0_0_20px_rgba(var(--accent),0.2)]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-accent">
                    Engineering Excellence 2024
                  </span>
                </motion.div>

                <h1 className="text-4xl md:text-7xl font-black text-foreground mb-8 leading-[1.1] tracking-tighter">
                  Let's Build the <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent animate-gradient-flow bg-[length:200%_auto] italic">
                    Next Digital Frontier.
                  </span>
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-12 opacity-80 italic">
                  Transforming conceptual challenges into pixel-perfect
                  technical realities. Ready to architect your next
                  high-performance digital ecosystem?
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button className="w-full h-16 px-10 rounded-2xl text-base font-black uppercase tracking-wider group/btn relative overflow-hidden">
                      <span className="relative z-10 flex items-center gap-3">
                        Initiate Collaboration
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>

                  <a href={`tel:${data.phone}`} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full h-16 px-10 rounded-2xl text-base font-bold bg-white/5 backdrop-blur-xl hover:bg-white/10 border-white/10 group/call"
                    >
                      <Phone className="w-5 h-5 mr-3 group-hover/call:rotate-12 transition-transform" />
                      Consultation
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </SectionWrapper>
      {/* Interactive Particles Background Component */}
      <div className="absolute inset-0 pointer-events-none -z-20">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.03, 0.1, 0.03],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
