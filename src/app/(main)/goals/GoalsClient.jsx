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
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [vision, setVision] = useState(initialVision);
  const [stats, setStats] = useState(initialStats);
  const [health, setHealth] = useState(initialHealth);
  const [insights, setInsights] = useState(initialInsights);
  const [changelog, setChangelog] = useState(initialChangelog);

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
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
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
                  Strategic Intent — 2025
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
                "
                {vision.visionStatement ||
                  "Engineering high-performance digital ecosystems with extreme precision and strategic foresight."}
                "
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
                      Reliability
                    </div>
                    <div className="text-xl font-black text-foreground">
                      99.9%
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
                      Velocity
                    </div>
                    <div className="text-xl font-black text-foreground">
                      10x Scale
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
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent/80 to-accent/60 transition-all duration-1000"
            style={{ width: `${stats.overallProgress || 0}%` }}
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

      {/* NEW: AI STRATEGIC INSIGHTS */}
      <SectionWrapper
        id="ai-insights"
        title="AI Strategic Insights"
        subtitle="Data-Driven Foresight"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Highest Progress Goal",
              value: insights.highestProgressGoal?.title || "N/A",
              detail: `${insights.highestProgressGoal?.progress || 0}% Complete`,
              icon: Award,
            },
            {
              title: "Most Critical Goal",
              value: insights.mostCriticalGoal?.title || "N/A",
              detail: "High Priority Focus",
              icon: Target,
            },
            {
              title: "Fastest Growing Area",
              value: insights.fastestGrowingArea || "Technology",
              detail: "Strategic Expansion",
              icon: TrendingUp,
            },
            {
              title: "Upcoming Priority",
              value: insights.upcomingPriority || "Roadmap Q3",
              detail: "Next Execution Phase",
              icon: Zap,
            },
            {
              title: "Execution Health Score",
              value: `${insights.executionHealthScore || 0}/100`,
              detail: "Overall Studio Performance",
              icon: Shield,
            },
            {
              title: "Projected Completion",
              value: insights.projectedCompletionDate || "Q4 2025",
              detail: "Timeline Confidence: High",
              icon: Calendar,
            },
          ].map((insight, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group"
            >
              <Card className="p-8 h-full bg-gradient-to-br from-accent/[0.02] to-transparent border-accent/10 hover:border-accent/30 transition-all flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60 mb-2">
                    {insight.title}
                  </h4>
                  <div className="text-lg font-black text-foreground tracking-tight leading-snug">
                    {insight.value}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground italic flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-accent/40" />
                  {insight.detail}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* 3. STRATEGIC GOALS GRID */}
      <SectionWrapper
        id="goals"
        title="Core Objectives"
        subtitle="Strategic Imperatives"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((goal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                  {goal.icon ? (
                    renderIcon(goal.icon)
                  ) : (
                    <Target className="w-40 h-40" />
                  )}
                </div>

                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center p-3 shadow-xl transition-all duration-500 ${
                        goal.status === "completed"
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      } group-hover:scale-110`}
                    >
                      {goal.icon ? (
                        renderIcon(goal.icon)
                      ) : (
                        <Target className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {goal.category || "General Strategy"}
                      </p>
                    </div>
                  </div>
                  {goal.featured && (
                    <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">
                      Primary
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8 font-medium italic opacity-80">
                  {goal.description ||
                    "Architecting next-generation digital solutions with precision."}
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[goal.status] || statusColors.planned}`}
                  >
                    {goal.status}
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${priorityColors[goal.priority] || "bg-muted text-muted-foreground"}`}
                  >
                    {goal.priority}
                  </span>
                </div>

                {/* Performance Gauge */}
                <div className="space-y-3 pt-8 border-t border-border/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Execution Intensity
                    </span>
                    <span className="text-sm font-black text-accent">
                      {goal.progress || 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${goal.progress || 0}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-accent via-accent/80 to-accent/60 shadow-[0_0_10px_rgba(var(--color-accent),0.3)]"
                    />
                  </div>
                </div>

                {goal.targetDate && (
                  <div className="flex items-center gap-2 mt-8 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* 4. ROADMAP VISUALIZATION */}
      <SectionWrapper
        id="roadmap"
        title="Timeline Matrix"
        subtitle="Future Trajectory"
      >
        <div className="relative space-y-8">
          {/* Timeline central line */}
          <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent/50 via-accent/30 to-transparent lg:-translate-x-1/2 opacity-20" />

          {sortedRoadmap.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
            >
              {/* Point on timeline */}
              <div className="absolute left-0 lg:left-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border-2 border-accent z-20 transition-transform group-hover:scale-125 lg:-translate-x-1/2 shadow-[0_0_15px_rgba(var(--color-accent),0.5)]">
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
              </div>

              <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start order-2">
                <Card className="w-full p-8 group hover:border-accent/40 transition-all duration-500 shadow-2xl bg-card/10 backdrop-blur-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                      <span className="text-[12px] font-black text-accent tracking-tighter">
                        {item.year} — {item.quarter}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        item.status === "completed"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : item.status === "in-progress"
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : "bg-muted/30 text-muted-foreground border border-border/50"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-accent transition-colors italic">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed opacity-80 font-medium">
                    {item.description}
                  </p>
                </Card>
              </div>

              {/* Decorative label column for desktop */}
              <div className="hidden lg:flex w-1/2 justify-center lg:justify-start order-1">
                <div
                  className={`text-9xl font-black font-serif italic pointer-events-none opacity-[0.02] select-none ${idx % 2 === 0 ? "lg:text-right w-full" : "lg:text-left w-full"}`}
                >
                  {item.quarter}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* NEW: PUBLIC CHANGELOG */}
      <SectionWrapper
        id="changelog"
        title="Recent Progress"
        subtitle="Public Pulse"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {changelog && changelog.length > 0 ? (
            changelog.map((log, idx) => (
              <motion.div
                key={log._id || idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-6 p-5 glass rounded-2xl border border-border/50 group hover:border-accent/20 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    {log.action === "complete" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-black text-foreground">
                        {log.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[8px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground mt-1 italic">
                      {log.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-[8px] font-medium text-accent/40 uppercase">
                      {new Date(log.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 glass rounded-3xl border border-dashed border-border">
              <span className="text-xs font-medium text-muted-foreground italic">
                Awaiting strategic updates...
              </span>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* 5. ACHIEVED MILESTONES */}
      {milestones.length > 0 && (
        <SectionWrapper
          id="milestones"
          title="Wall of Scale"
          subtitle="Key Milestones"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="min-h-[250px] flex flex-col justify-between group hover:border-accent/40 relative overflow-hidden">
                  {/* Digital Seal Pattern */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full border-[10px] border-accent/5 group-hover:scale-125 transition-transform" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-lg">
                          <Award className="w-6 h-6" />
                        </div>
                      </div>
                      {milestone.featured && (
                        <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-[0.2em]">
                          Verified Achievement
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors italic tracking-tight">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium opacity-80 leading-relaxed italic">
                      "{milestone.description}"
                    </p>
                  </div>

                  <div className="relative z-10 pt-6 mt-6 border-t border-border/10 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        Entry Serial
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/80 tracking-tighter uppercase">
                        #GT-{idx + 1024}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-accent/40 uppercase tracking-widest">
                        Signed Date
                      </span>
                      <span className="text-[10px] font-bold text-accent tracking-tighter uppercase">
                        {new Date(milestone.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* 6. CALL TO ACTION */}
      <section className="py-32 relative group mt-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <Card className="max-w-5xl mx-auto p-12 md:p-24 text-center relative overflow-hidden bg-gradient-to-br from-accent/5 via-card/10 to-emerald-500/5">
            <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <MessageSquare className="w-80 h-80 text-accent" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 tracking-tighter">
                Let's Build Something <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-accent italic">
                  Extraordinary.
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium opacity-80 backdrop-blur-sm">
                Have a vision that needs architectural precision? Let's discuss
                how we can bring your concept to life with cutting-edge
                engineering.
              </p>
              <Link href="/contact">
                <Button className="scale-125 md:scale-110">
                  Architect Your Project
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </Card>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </section>
    </div>
  );
}
