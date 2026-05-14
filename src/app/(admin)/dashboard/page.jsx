"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Activity,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatName } from "@/lib/utils";

export default function DashboardPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setSession(data));
  }, []);

  const stats = [
    {
      name: "Total Projects",
      value: "12",
      icon: Briefcase,
      trend: "+2 this month",
      color: "from-blue-600 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      name: "Blog Posts",
      value: "24",
      icon: FileText,
      trend: "+5 this week",
      color: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-500/20",
    },
    {
      name: "Messages",
      value: "158",
      icon: MessageSquare,
      trend: "12 unread",
      color: "from-violet-600 to-purple-500",
      shadow: "shadow-purple-500/20",
    },
    {
      name: "Unique Visitors",
      value: "1.2k",
      icon: Users,
      trend: "+15% vs last week",
      color: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full rounded-[2.5rem] overflow-hidden p-6 md:p-10 lg:p-12 z-0">
      {/* Unique Dashboard Background Pattern */}
      <div className="absolute inset-0 z-[-1] bg-[#050508]">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="flex flex-col xl:flex-row gap-8 lg:gap-10 h-full max-w-7xl mx-auto">
        {/* Left Column (Main Stats & Welcome) */}
        <div className="flex-1 space-y-8 flex flex-col">
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-[2rem] p-8 md:p-10 overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-[#0a0a0e]/90 backdrop-blur-xl" />
            <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-blue-300 mb-6 backdrop-blur-md shadow-sm">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                SYSTEM STATUS: OPTIMAL
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight leading-tight mb-5">
                Overview <br className="hidden md:block" />
                {session?.name ? formatName(session.name) : "Administrator"}
              </h1>
              <p className="text-base text-slate-400 max-w-xl leading-relaxed font-medium">
                Welcome to your command center. Monitor traffic, keep track of messages, and oversee all platform operations from this streamlined dashboard.
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-8 flex-1">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`group relative p-6 rounded-[2rem] bg-slate-900/40 border border-white/[0.05] hover:border-white/10 backdrop-blur-xl transition-all cursor-pointer overflow-hidden ${stat.shadow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg ring-1 ring-white/20 inline-flex`}>
                    <stat.icon className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                  <div className="p-2.5 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-white/50" />
                  </div>
                </div>
                
                <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                  {stat.value}
                </h3>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-slate-400">
                    {stat.name}
                  </span>
                  <span className="text-xs font-bold text-emerald-400/90 tracking-wide mt-1">
                    {stat.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column (Analytics & Activity) */}
        <div className="w-full xl:w-[400px] 2xl:w-[450px] space-y-8 flex flex-col">
          {/* Growth Analytics Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-8 rounded-[2rem] bg-gradient-to-b from-blue-600 to-indigo-900 shadow-2xl shadow-blue-900/20 overflow-hidden group border border-blue-400/20 flex-shrink-0"
          >
            {/* Artistic background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md inline-flex shadow-inner border border-white/10">
                  <Activity className="w-6 h-6 text-blue-50" />
                </div>
                <h3 className="text-xs font-black text-blue-200/80 uppercase tracking-[0.2em]">
                  Performance
                </h3>
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-sm">
                  84<span className="text-3xl text-blue-200/50">%</span>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-300 drop-shadow-md" />
              </div>
              
              <p className="text-sm text-blue-100/70 leading-relaxed mb-8 font-medium">
                Your platform's overall engagement metric is outperforming last month's averages. The content strategy is yielding positive results.
              </p>
              
              <button className="w-full py-4 rounded-2xl bg-white text-indigo-900 font-black tracking-wide overflow-hidden relative group/btn shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-blue-400/50">
                <div className="absolute inset-0 bg-blue-50 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300 pointer-events-none" />
                <span className="relative flex items-center justify-center gap-2">
                  Generate Report <ArrowUpRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </motion.div>

          {/* Recent Activity Mini-Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1 rounded-[2rem] p-8 bg-slate-900/40 border border-white/[0.05] flex flex-col relative overflow-hidden backdrop-blur-xl shadow-xl"
          >
            <div className="absolute top-0 right-0 p-8 pointer-events-none">
              <Clock className="w-32 h-32 text-white/[0.02] transform rotate-12" />
            </div>
            
            <div className="flex justify-between items-center mb-8 relative z-10 w-full">
              <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </div>
                Live Event Log
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                View All
              </button>
            </div>

            <div className="relative z-10 space-y-7 flex-1 mt-2">
              {[
                { time: "Just now", title: "New Message", desc: "You received an inquiry from Sarah.", color: "text-purple-400", dot: "bg-purple-500" },
                { time: "2h ago", title: "Project Published", desc: "Quantum E-Commerce is live.", color: "text-blue-400", dot: "bg-blue-500" },
                { time: "5h ago", title: "New Visitor Log", desc: "Traffic spike detected from US.", color: "text-amber-400", dot: "bg-amber-500" },
              ].map((activity, i) => (
                <div key={i} className="group flex gap-5 cursor-default relative">
                  {i !== 2 && (
                    <div className="absolute left-[5px] top-6 bottom-[-28px] w-px bg-gradient-to-b from-white/20 to-transparent group-hover:from-white/40 transition-colors" />
                  )}
                  <div className="flex flex-col items-center pt-1.5 relative z-10">
                    <div className={`w-3 h-3 rounded-full ${activity.dot} shadow-[0_0_12px_rgba(0,0,0,0.5)] shadow-${activity.dot.split('-')[1]}-500/50 ring-4 ring-[#0a0a0e]`} />
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${activity.color} mb-1 opacity-80`}>
                      {activity.time}
                    </div>
                    <div className="text-sm font-bold text-slate-200 mb-1">
                      {activity.title}
                    </div>
                    <div className="text-xs font-medium text-slate-500 leading-relaxed">
                      {activity.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

