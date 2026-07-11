"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Shield,
  ArrowRight,
  Users,
  Cpu,
  Code2,
  Crown,
  Layers,
  FileText,
} from "lucide-react";
import { SectionWrapper, Card, Button } from "@/components/ui";
import EditorialBackground from "@/components/ui/EditorialBackground";

// Dynamic icon renderer
function renderIcon(iconName) {
  const icons = {
    Zap: <Zap className="w-6 h-6" />,
    Code2: <Code2 className="w-6 h-6" />,
    Crown: <Crown className="w-6 h-6" />,
    Cpu: <Cpu className="w-6 h-6" />,
    Users: <Users className="w-6 h-6" />,
    Shield: <Shield className="w-6 h-6" />,
    Target: <Target className="w-6 h-6" />,
    FileText: <FileText className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />,
    TrendingUp: <TrendingUp className="w-6 h-6" />,
    MessageSquare: <MessageSquare className="w-6 h-6" />,
  };
  return icons[iconName] || <Target className="w-6 h-6" />;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function GoalsClient({
  initialGoals = [],
  initialRoadmap = [],
  initialMilestones = [],
  initialVision = {},
  initialStats = {},
  initialHealth = {},
  initialInsights = {},
  initialChangelog = [],
  initialPageData = {},
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [vision, setVision] = useState(initialVision);
  const [stats, setStats] = useState(initialStats);
  const [health, setHealth] = useState(initialHealth);
  const [insights, setInsights] = useState(initialInsights);
  const [changelog, setChangelog] = useState(initialChangelog);
  const [pageData, setPageData] = useState(initialPageData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/goals");
        const data = await res.json();
        if (data.success) {
          setGoals(data.data.goals || []);
          setRoadmap(data.data.roadmap || []);
          setMilestones(data.data.milestones || []);
          setVision(data.data.vision || {});
          setStats(data.data.stats || {});
          setHealth(data.data.health || {});
          setInsights(data.data.insights || {});
          setChangelog(data.data.changelog || []);
          setPageData(data.data.pageData || {});
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };
    fetchData();
  }, []);

  const statusColors = {
    completed: "bg-accent/10 text-accent border-accent/20",
    "in-progress": "bg-accent/10 text-accent border-accent/20",
    planned: "bg-muted text-muted-foreground border-border",
    paused: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const priorityColors = {
    critical:
      "bg-accent text-white shadow-[0_0_15px_rgba(var(--color-accent),0.4)]",
    high: "bg-accent/80 text-white shadow-[0_0_10px_rgba(var(--color-accent),0.2)]",
    medium: "bg-accent/60 text-white",
    low: "bg-muted text-muted-foreground",
  };

  const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  const sortedRoadmap = [...roadmap].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (quarterOrder[a.quarter] || 0) - (quarterOrder[b.quarter] || 0);
  });
  const focusCards = pageData.currentFocus || [];
  const roadmapItems = pageData.roadmap || sortedRoadmap;
  const recentProgress = pageData.recentProgress || [];
  const futureDirection = pageData.futureDirection || [];
  const finalCTA = pageData.finalCTA || {};
  const ctaButtons = finalCTA.buttons || [];
  const progressWidthClass =
    [
      "w-0",
      "w-[10%]",
      "w-[20%]",
      "w-[30%]",
      "w-[40%]",
      "w-[50%]",
      "w-[60%]",
      "w-[70%]",
      "w-[80%]",
      "w-[90%]",
      "w-full",
    ][Math.max(0, Math.min(10, Math.round((stats.overallProgress || 0) / 10)))] || "w-0";

  return (
    <div className="min-h-screen  relative overflow-hidden">
      <EditorialBackground text="Vision" />

      {/* 1. ARCHITECTURAL HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Depth Layers */}
        <div className="absolute  z-0">
          <div className="absolute top-[10%] left-[-5%] w-[600px] h-[600px] bg-accent/10 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/5 blur-[130px] rounded-full" />

          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.svg')]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        </div>

        <motion.div
          className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left: Strategic Content */}
          <div className="text-left">
            <motion.div variants={itemVariants} className="mb-10">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 glass rounded-full border border-accent/20 shadow-[0_0_30px_rgba(var(--color-accent),0.15)] group hover:border-accent/40 transition-all cursor-default">
                <Target className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-accent">
                  Strategic Intent - 2026
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black text-foreground mb-8 leading-[1] tracking-tighter"
            >
              Beyond <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/50 to-accent animate-gradient-flow bg-[length:200%_auto] italic pr-4">
                Objectives.
              </span>
            </motion.h1>

            <motion.div variants={itemVariants} className="relative mb-12">
              <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent/50 to-transparent rounded-full opacity-40 shadow-[0_0_15px_rgba(var(--color-accent),0.3)]" />
              <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl opacity-90 italic">
                &ldquo;
                {vision.visionStatement ||
                  "Engineering high-performance digital ecosystems with extreme precision and strategic foresight."}
                &rdquo;
              </p>

              {/* Executive Signature Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="mt-8 flex items-center gap-6"
              >
                <div className="flex flex-col">
                  <span className="text-2xl font-serif italic text-foreground leading-none tracking-tighter opacity-80 select-none">
                    {vision.founderName || "Muhyo Tech"}
                  </span>
                  <div className="h-px w-24 bg-gradient-to-r from-accent/40 to-transparent mt-1" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/60 mt-2">
                    Executive Lead & Founder
                  </span>
                </div>
                <div className="h-10 w-px bg-border/40" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground opacity-60">
                    Charter Signed
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground tracking-tighter uppercase mt-0.5">
                    Jan 2025
                  </span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-5"
            >
              <Link href="#roadmap">
                <Button className="h-14 px-10 text-base shadow-2xl shadow-accent/20 group">
                  Explore Roadmap
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
              <div className="h-14 flex items-center gap-4 px-6 glass rounded-full border border-border/50">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">
                  Active Execution
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right: Visual Goal Matrix */}
          <motion.div
            variants={itemVariants}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">
              {/* Central Target Orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border border-accent/20 flex items-center justify-center relative overflow-hidden bg-accent/5 backdrop-blur-3xl group shadow-[0_0_100px_rgba(var(--color-accent),0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 via-transparent to-accent/10" />
                  <Target className="w-40 h-40 text-accent/20 group-hover:scale-110 group-hover:text-accent/30 transition-all duration-1000" />

                  {/* Pulsing inner rings */}
                  <div className="absolute w-60 h-60 rounded-full border border-accent/10 animate-[ping_4s_linear_infinite]" />
                  <div className="absolute w-40 h-40 rounded-full border-accent/10 animate-[ping_6s_linear_infinite_1s]" />
                </div>
              </div>

              {/* Floating KPI Cards */}
              <motion.div
                animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-10 right-0 p-6 glass rounded-2xl border border-accent/30 shadow-2xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-accent uppercase">
                      Roadmap
                    </div>
                    <div className="text-xl font-black text-foreground">
                      Active
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-20 left-0 p-6 glass rounded-2xl border border-accent/30 shadow-2xl z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-accent uppercase">
                      Focus
                    </div>
                    <div className="text-xl font-black text-foreground">
                      SaaS
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Data Connections - Subtle lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                viewBox="0 0 100 100"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="48"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="0.5"
                  className="text-accent"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Elegant Scroll Indicator */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
            Dive Deeper
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </section>

      {/* 3. PROGRESS STATS */}
      <SectionWrapper
        id="overview"
        title="Progress Metrics"
        subtitle="Execution Status"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              label: "Total Goals",
              value: stats.totalGoals || 0,
              icon: Target,
              color: "text-accent",
            },
            {
              label: "Completed",
              value: stats.completedGoals || 0,
              icon: CheckCircle2,
              color: "text-accent",
            },
            {
              label: "In Progress",
              value: stats.inProgressGoals || 0,
              icon: Clock,
              color: "text-accent/80",
            },
            {
              label: "Planned",
              value: stats.upcomingGoals || 0,
              icon: Zap,
              color: "text-muted-foreground",
            },
            {
              label: "Overall Completion",
              value: `${stats.overallProgress || 0}%`,
              icon: TrendingUp,
              color: "text-accent",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="flex flex-col items-center text-center group">
                <div
                  className={`p-4 rounded-2xl bg-muted/20 ${stat.color} mb-6 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-4xl font-black text-foreground mb-2 tracking-tighter">
                  {stat.value}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Global Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          className="mt-12 h-1.5 w-full bg-muted/20 rounded-full overflow-hidden relative"
        >
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent/80 to-accent/60 transition-all duration-1000 ${progressWidthClass}`}
          />
          <div className="absolute inset-0 bg-white/20 animate-shimmer pointer-events-none" />
        </motion.div>
      </SectionWrapper>

      {/* NEW: COMPANY HEALTH DASHBOARD */}
      <SectionWrapper
        id="health"
        title="Company Health"
        subtitle="Live Strategic Pulse"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Active Goals",
              value: health.activeGoals || 0,
              icon: Target,
            },
            {
              label: "Completed",
              value: health.completedGoals || 0,
              icon: CheckCircle2,
            },
            {
              label: "Roadmap Items",
              value: health.roadmapItems || 0,
              icon: Layers,
            },
            {
              label: "Subscribers",
              value: health.subscribers || 0,
              icon: Users,
            },
            {
              label: "Published Blogs",
              value: health.publishedBlogs || 0,
              icon: FileText,
            },
            { label: "Services", value: health.services || 0, icon: Cpu },
            { label: "Projects", value: health.projects || 0, icon: Code2 },
            {
              label: "System Health",
              value: `${health.systemHealth || 0}%`,
              icon: Shield,
              isHealth: true,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 flex flex-col items-center text-center group hover:border-accent/30 transition-all">
                <div
                  className={`p-3 rounded-xl bg-accent/5 text-accent mb-4 group-hover:scale-110 transition-transform ${item.isHealth ? "animate-pulse" : ""}`}
                >
                  {item.icon ? (
                    <item.icon className="w-5 h-5" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                </div>
                <div className="text-2xl font-black text-foreground mb-1 tracking-tight">
                  {item.value}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {item.label}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <Clock className="w-3 h-3" />
            Updated{" "}
            {health.lastUpdated
              ? new Date(health.lastUpdated).toLocaleTimeString()
              : "Just now"}
          </div>
        </div>
      </SectionWrapper>

      {/* 4. CURRENT FOCUS */}
      <SectionWrapper id="current-focus" title="Current Focus" subtitle="Active Direction">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {focusCards.map((item, idx) => (
            <motion.div key={item.title} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.08 }}>
              <Card className="p-8 h-full group hover:border-accent/30 transition-all">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">{renderIcon(item.icon)}</div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-accent transition-colors">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                      <span className="px-3 py-1 rounded-full bg-muted/30 text-muted-foreground border border-border/50 text-[10px] font-black uppercase tracking-widest">{item.type}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium opacity-85">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* 5. REAL ROADMAP TIMELINE */}
      <SectionWrapper id="roadmap" title="Real Roadmap Timeline" subtitle="Estimated Direction">
        <div className="relative space-y-8">
          <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent/50 via-accent/30 to-transparent lg:-translate-x-1/2 opacity-20" />
          {roadmapItems.map((item, idx) => (
            <motion.div key={item.title} initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`relative flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
              <div className="absolute left-0 lg:left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-accent z-20 lg:-translate-x-1/2 shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"><div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" /></div>
              <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start order-2">
                <Card className="w-full p-8 group hover:border-accent/40 transition-all duration-500 shadow-2xl bg-card/10 backdrop-blur-3xl">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20"><span className="text-[12px] font-black text-accent tracking-tighter">{item.phase || `${item.year || "Roadmap"} - ${item.quarter || "Phase"}`}</span></div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/30 text-muted-foreground border border-border/50">{item.status}</span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-accent transition-colors italic">{item.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed opacity-80 font-medium">{item.description}</p>
                </Card>
              </div>
              <div className="hidden lg:flex w-1/2 justify-center lg:justify-start order-1"><div className={`text-8xl font-black font-serif italic pointer-events-none opacity-[0.02] select-none ${idx % 2 === 0 ? "lg:text-right w-full" : "lg:text-left w-full"}`}>{item.phase || item.quarter}</div></div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* 6. RECENT PROGRESS */}
      <SectionWrapper id="recent-progress" title="Recent Progress" subtitle="Honest Updates">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentProgress.map((item, idx) => {
            const progress = typeof item === "string" ? { title: item } : item;

            return (
              <motion.div key={progress._id || progress.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.04 }} className="flex items-start gap-4 p-5 glass rounded-2xl border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground/85">{progress.title}</span>
                    {progress.category && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[8px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
                        {progress.category}
                      </span>
                    )}
                  </div>
                  {progress.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{progress.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* 7. FUTURE DIRECTION */}
      <SectionWrapper id="future-direction" title="Future Direction" subtitle="Professional Vision">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {futureDirection.map((item, idx) => (
            <motion.div key={item.title} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.08 }}>
              <Card className="p-7 h-full group hover:border-accent/30 transition-all">
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">{renderIcon(item.icon)}</div>
                <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium opacity-85">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>
      {/* 6. CALL TO ACTION */}
      <section className="py-24 md:py-28 relative mt-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto rounded-lg border border-border/50 bg-card/35 backdrop-blur-xl overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-8 p-8 md:p-12 lg:p-14">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-xs font-bold text-accent mb-6">
                  <MessageSquare className="w-4 h-4" />
                  {"Start a conversation"}
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-5 tracking-normal leading-tight">
                  {finalCTA.heading || "Have an Idea or Project in Mind?"}
                  <span className="block text-accent italic mt-1">
                    {"Let's Talk."}
                  </span>
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  {finalCTA.subtitle ||
                    "Muhyo Tech is actively building modern web products, SaaS systems, and business-focused digital solutions. Let's discuss your idea and turn it into something professional."}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-center lg:justify-end gap-3"
              >
                {(ctaButtons.length
                  ? ctaButtons
                  : [{ label: "Book a Call", href: "/contact" }]
                ).map((button, index) => (
                  <Link key={button.label} href={button.href} className="w-full sm:w-auto">
                    <Button
                      variant={index === 0 ? "primary" : "secondary"}
                      className="w-full sm:w-auto min-w-[170px] px-6"
                    >
                      {button.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </section>
    </div>
  );
}
