"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  FileText,
  MessageSquare,
  Cpu,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Plus,
  Send,
  Calendar,
  CalendarCheck,
  Trophy,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { disposeSocket, initializeSocket, SOCKET_EVENTS } from "@/lib/socket";
import {
  BookingTrendChart,
  ServiceDistributionChart,
  ContentActivityChart,
  VisitorGrowthChart,
  PageViewsChart
} from "@/components/admin/DashboardCharts";

// Import Detail Modals
import BookingDetailModal from "../components/BookingDetailModal";
import MessageDetailModal from "../components/MessageDetailModal";
import SubscriberDetailModal from "../components/SubscriberDetailModal";

/**
 * Stat Card Component
 */
const StatCard = ({ label, value, icon: Icon, color, bg, trend, trendIcon: TrendIcon = TrendingUp, link, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group relative p-8 border border-border/70 bg-card/50 rounded-[2.5rem] hover:border-accent/30 transition-all duration-500 overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${bg} blur-[60px] translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

    <div className="flex justify-between items-start relative z-10 mb-6">
      <div className={`p-4 rounded-2xl ${bg} ${color} border border-border/70 group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <Link href={link} className="p-2.5 rounded-xl border border-border/70 hover:border-border text-muted-foreground hover:text-foreground transition-all">
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>

    <div className="relative z-10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-2">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black text-foreground tabular-nums tracking-tighter italic">
          {value}
        </span>
      </div>
      <div className="mt-8 pt-6 border-t border-border/70 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{trend}</span>
        <TrendIcon className={`w-3 h-3 ${color} opacity-40`} />
      </div>
    </div>
  </motion.div>
);

/**
 * Recent Data Table Component
 */
const MiniTable = ({ title, data, type, icon: Icon, onRowClick, isLoading }) => (
  <div className="p-8 border border-border/70 bg-card/40 rounded-[2.5rem] relative overflow-hidden group">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-4">
        <Icon className="w-6 h-6 text-accent" />
        {title}
      </h3>
      <Link href={`/admin/${type}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
        View All
      </Link>
    </div>

    <div className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-50">
          <Zap className="w-6 h-6 text-accent animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing</span>
        </div>
      ) : (
        <>
          {data?.map((item, i) => (
            <button
              key={item._id || i}
              onClick={() => onRowClick(item)}
              className="w-full flex items-center justify-between p-4 border border-border/70 bg-card/40 rounded-2xl hover:bg-muted/50 transition-all group/item cursor-pointer text-left"
            >
               <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-[10px] uppercase font-black text-accent/40 group-hover/item:text-accent transition-colors">
                    {i + 1}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-foreground truncate group-hover/item:text-accent transition-colors">{item.name || item.email || item.title}</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{item.service || item.subject || 'Subscribed'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                    item.status === 'new' ? 'bg-accent/10 text-accent' :
                    item.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-muted/50 text-muted-foreground'
                  }`}>
                    {item.status || 'Active'}
                  </span>
               </div>
            </button>
          ))}
          {!data?.length && <p className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">No Data Logs</p>}
        </>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  const fetchDashboardData = async (url) => {
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || payload.error || "Dashboard data request failed");
    }
    return payload.data;
  };

  // Queries - Real-time Polling Engine (Every 5 seconds)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/stats"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/charts"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: () => fetchDashboardData("/api/admin/analytics"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/recent"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  const { data: activities = [], isLoading: activityLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchDashboardData("/api/admin/activity"),
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  // Socket Integration
  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;

    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
    };

    socket.on('new_visitor', (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      queryClient.setQueryData(["activities"], (old) => {
        const current = Array.isArray(old) ? old : [];
        return [
          {
            _id: `visitor_${Date.now()}`,
            module: 'VISITOR',
            action: 'LANDED',
            page: data?.page || '/',
            user: { name: data?.isFirstVisit ? 'New visitor' : 'Returning visitor' },
            createdAt: data?.timestamp || new Date().toISOString()
          },
          ...current
        ].slice(0, 10);
      });
    });

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, invalidateAll);
    socket.on(SOCKET_EVENTS.NEW_BOOKING, invalidateAll);
    socket.on(SOCKET_EVENTS.BOOKING_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.BOOKING_DELETED, invalidateAll);
    socket.on(SOCKET_EVENTS.BOOKING_STATS_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.STATS_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.NEW_SUBSCRIBER, invalidateAll);
    socket.on(SOCKET_EVENTS.NEW_BLOG, invalidateAll);
    socket.on(SOCKET_EVENTS.BLOG_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.NEW_SERVICE, invalidateAll);
    socket.on(SOCKET_EVENTS.SERVICE_CREATED, invalidateAll);
    socket.on(SOCKET_EVENTS.SERVICE_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.SERVICES_IMPORTED, invalidateAll);
    socket.on(SOCKET_EVENTS.NEW_PROJECT, invalidateAll);
    socket.on(SOCKET_EVENTS.PUBLIC_DATA_UPDATED, invalidateAll);
    socket.on(SOCKET_EVENTS.CACHE_INVALIDATED, invalidateAll);

    // Fetch session
    fetch("/api/admin/me").then(res => res.json()).then(data => setSession(data));

    return () => {
      disposeSocket(socket);
    };
  }, [queryClient]);

  const topStats = useMemo(() => [
    { label: "Total Bookings", value: statsData?.bookings?.total || 0, icon: Calendar, color: "text-accent", bg: "bg-accent/10", trend: `${statsData?.bookings?.new || 0} pending`, link: "/admin/bookings" },
    { label: "Active Subs", value: statsData?.subscribers || 0, icon: Users, color: "text-accent", bg: "bg-accent/10", trend: "Current total", link: "/admin/subscribers" },
    { label: "New Messages", value: statsData?.unreadMessages || 0, icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", trend: "Action required", link: "/admin/messages" },
    { label: "Total Artifacts", value: (statsData?.projects || 0) + (statsData?.blogs || 0), icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Projects + blogs", link: "/admin/projects" },
  ], [statsData]);

  const analyticsStats = useMemo(() => {
    const growthRate = analyticsData?.growthRate;
    const growthIsDown = typeof growthRate === "number" && growthRate < 0;
    const growthValue = typeof growthRate === "number"
      ? `${growthRate > 0 ? "+" : ""}${growthRate}%`
      : "—";

    return [
      { label: "Page Views", value: analyticsData?.totalPageViews ?? "—", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Recorded page loads", link: "/admin/analytics/visitors" },
      { label: "Unique Visitors", value: analyticsData?.uniqueVisitors ?? "—", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10", trend: "Distinct browsers", link: "/admin/analytics/visitors" },
      { label: "Visitors (24h)", value: analyticsData?.last24Visitors ?? "—", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", trend: "Rolling 24 hours", link: "/admin/analytics/visitors" },
      { label: "Visitor Growth", value: growthValue, icon: growthIsDown ? TrendingDown : TrendingUp, trendIcon: growthIsDown ? TrendingDown : TrendingUp, color: growthIsDown ? "text-red-400" : "text-accent", bg: growthIsDown ? "bg-red-500/10" : "bg-accent/10", trend: analyticsData?.growthAvailable ? "vs previous 30 days" : (analyticsData?.growthStatus || "Collecting verified baseline"), link: "/admin/analytics/visitors" },
    ];
  }, [analyticsData]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-foreground leading-tight md:leading-none">
            Muhyo Tech{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-[8px] md:underline-offset-[12px]">
              Intelligence
            </span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-4 font-medium tracking-tight">
            Real-time heuristic analysis and digital orchestration center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-muted/50 border border-border/70 p-2 rounded-2xl">
           {session && (
            <div className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] uppercase font-black tracking-widest border shadow-lg
              ${session.role === 'root-super-admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                session.role === 'super-admin' ? 'bg-accent/10 text-accent border-accent/20' :
                'bg-muted text-muted-foreground border-border'}`}>
              {session.role === 'root-super-admin' ? <Zap className="w-3 h-3 fill-amber-500" /> : <ShieldCheck className="w-3 h-3" />}
              {session.role === 'root-super-admin' ? 'Root Admin' : session.role === 'super-admin' ? 'Super Admin' : session.role}
            </div>
           )}
           <span className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] md:text-[10px] uppercase font-black tracking-widest border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Node Active
           </span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Link href="/admin/analytics/visitors" className="lg:col-span-2 p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group hover:border-border hover:bg-card/50 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                    Visitor Growth
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-[0.1em]">Network traffic traversal (30 days). <span className="text-emerald-400">Click to explore →</span></p>
                </div>
              </div>
              {analyticsLoading ? <div className="h-[300px] flex items-center justify-center"><Zap className="animate-pulse text-emerald-500" /></div> :
                <VisitorGrowthChart data={analyticsData?.monthlyTrend} />
              }
          </Link>

          <div className="p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group">
              <div className="mb-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <FileText className="w-8 h-8 text-indigo-500" />
                    Page Views
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-[0.1em]">Traffic distribution.</p>
              </div>
              {analyticsLoading ? <div className="h-[300px] flex items-center justify-center"><Zap className="animate-pulse text-indigo-500" /></div> :
                <PageViewsChart data={analyticsData?.pageViews} />
              }
          </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <CalendarCheck className="w-8 h-8 text-accent" />
                    Booking Trajectory
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-[0.1em]">Event frequency analysis over 30 days cycle.</p>
                </div>
              </div>
              {chartsLoading ? <div className="h-[300px] flex items-center justify-center"><Zap className="animate-pulse text-accent" /></div> :
                <BookingTrendChart data={chartData?.bookingTrend} />
              }
          </div>

          <div className="p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group">
              <div className="mb-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <Cpu className="w-8 h-8 text-amber-500" />
                    Capabilities
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium uppercase tracking-[0.1em]">Service distribution matrix.</p>
              </div>
              {chartsLoading ? <div className="h-[300px] flex items-center justify-center"><Zap className="animate-pulse text-amber-500" /></div> :
                <ServiceDistributionChart data={chartData?.serviceDistribution} />
              }
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions & Activity */}
          <div className="lg:col-span-2 space-y-8">
              <div className="p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                        <Plus className="w-8 h-8 text-emerald-500" />
                        Quick Deployment
                      </h2>
                  </div>
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-4">
                      {[
                        { label: 'Blog', href: '/admin/blogs', icon: FileText, color: 'text-violet-400' },
                        { label: 'Service', href: '/admin/services', icon: Cpu, color: 'text-amber-400' },
                        { label: 'Project', href: '/admin/projects', icon: Briefcase, color: 'text-accent' },
                        { label: 'Dispatch', href: '/admin/subscribers', icon: Send, color: 'text-accent' },
                      ].map((action) => (
                        <Link key={action.label} href={action.href} className="p-6 border border-border/70 bg-card/50 rounded-3xl hover:border-accent/40 hover:bg-muted/50 transition-all group/link flex flex-col items-center gap-4">
                           <div className={`p-4 rounded-2xl bg-muted/50 ${action.color} border border-border/70 group-hover/link:scale-110 transition-transform`}>
                              <action.icon className="w-6 h-6" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{action.label}</span>
                        </Link>
                      ))}
                  </div>
              </div>

              <div className="p-8 md:p-10 border border-border/70 bg-card/40 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group text-card-foreground">
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                        <Zap className="w-8 h-8 text-accent" />
                        Infrastructure Growth
                      </h2>
                  </div>
                  {chartsLoading ? <div className="h-[300px] flex items-center justify-center"><Zap className="animate-pulse text-accent" /></div> :
                    <ContentActivityChart data={chartData?.activityStats} />
                  }
              </div>
          </div>

          {/* Activity Feed */}
          <div className="p-8 border border-border/70 bg-card/40 rounded-[2.5rem] relative overflow-hidden h-full">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Pulsar Feed</h3>
               </div>
               <div className="space-y-8 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
                  {activities.slice(0, 10).map((act, i) => (
                    <motion.div
                      key={act._id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group"
                    >
                      <button
                        onClick={() => {
                          if (act.module === 'BOOKINGS') {
                            const found = recentData?.bookings?.find(b => b._id === act.targetId);
                            if (found) setSelectedBooking(found);
                            else window.location.href = `/admin/bookings?view=${act.targetId}`;
                          } else if (act.module === 'MESSAGES') {
                            const found = recentData?.messages?.find(m => m._id === act.targetId);
                            if (found) setSelectedMessage(found);
                            else window.location.href = `/admin/messages?view=${act.targetId}`;
                          } else if (act.module === 'SUBSCRIBERS') {
                            const found = recentData?.subscribers?.find(s => s._id === act.targetId);
                            if (found) setSelectedSubscriber(found);
                            else window.location.href = `/admin/subscribers?view=${act.targetId}`;
                          } else {
                            window.location.href = `/admin/${act.module.toLowerCase()}?view=${act.targetId}`;
                          }
                        }}
                        className="w-full flex gap-4 cursor-pointer text-left"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-muted/50 border border-border flex items-center justify-center group-hover:border-accent/40 transition-colors">
                          {act.module === 'PROJECTS' ? <Briefcase className="w-4 h-4 text-muted-foreground group-hover:text-accent" /> :
                          act.module === 'SERVICES' ? <Cpu className="w-4 h-4 text-muted-foreground group-hover:text-accent" /> :
                          act.module === 'BLOGS' ? <FileText className="w-4 h-4 text-muted-foreground group-hover:text-accent" /> :
                          <Users className="w-4 h-4 text-muted-foreground group-hover:text-accent" />}
                        </div>
                        <div className="min-w-0">
                          {act.module === 'VISITOR' ? (
                            <p className="text-[11px] font-bold text-foreground leading-snug group-hover:text-emerald-400 transition-colors">
                              <span className="text-emerald-500 underline decoration-emerald-500/20">{act.user?.name}</span> landed on <b className="text-emerald-400">{act.page}</b>.
                            </p>
                          ) : (
                            <p className="text-[11px] font-bold text-foreground leading-snug group-hover:text-accent transition-colors">
                              Node <span className="text-accent underline decoration-accent/20">{act.user?.name}</span> {act.action === 'CREATE' ? 'instantiated' : act.action === 'UPDATE' ? 'recalibrated' : 'deleted'} a <b>{act.module?.toLowerCase()}</b> object.
                            </p>
                          )}
                          <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground/50 mt-1 flex items-center gap-2">
                            <Clock3 className="w-2 h-2" />
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  ))}
               </div>
          </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MiniTable title="Recent Bookings" data={recentData?.bookings} type="bookings" icon={Calendar} onRowClick={setSelectedBooking} isLoading={recentLoading} />
          <MiniTable title="Recent Inquiries" data={recentData?.messages} type="messages" icon={MessageSquare} onRowClick={setSelectedMessage} isLoading={recentLoading} />
          <MiniTable title="New Subscribers" data={recentData?.subscribers} type="subscribers" icon={Users} onRowClick={setSelectedSubscriber} isLoading={recentLoading} />
      </div>

      {/* Detail Modals Integration */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
        {selectedMessage && (
          <MessageDetailModal
            message={selectedMessage}
            isOpen={!!selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onReplySuccess={() => {
              setSelectedMessage(null);
              queryClient.invalidateQueries(["dashboard-recent"]);
            }}
          />
        )}
        {selectedSubscriber && (
          <SubscriberDetailModal
            subscriber={selectedSubscriber}
            isOpen={!!selectedSubscriber}
            onClose={() => setSelectedSubscriber(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
