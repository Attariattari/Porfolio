"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen, Briefcase,
  CalendarDays, CheckCircle2, Clock3, Cpu, Eye, FileText, Gauge, Loader2,
  Mail, MessageSquare, Plus, Radio, Send, ShieldCheck, Sparkles, TrendingDown,
  TrendingUp, UserRound, Users, Zap,
} from "lucide-react";
import { disposeSocket, initializeSocket, SOCKET_EVENTS } from "@/lib/socket";
import { BookingTrendChart, ServiceDistributionChart, ContentActivityChart, VisitorGrowthChart, PageViewsChart } from "@/components/admin/DashboardCharts";
import BookingDetailModal from "../components/BookingDetailModal";
import MessageDetailModal from "../components/MessageDetailModal";
import SubscriberDetailModal from "../components/SubscriberDetailModal";

const fetchDashboardData = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.message || payload.error || "Dashboard data request failed");
  return payload.data;
};

function Skeleton({ className = "h-8 w-20" }) {
  return <span className={`block animate-pulse rounded-lg bg-muted ${className}`} />;
}

function MetricCard({ label, value, note, icon: Icon, href, loading, status = "accent", delay = 0, span = "xl:col-span-3" }) {
  const tones = { accent: "bg-accent/10 text-accent", success: "bg-status-success/10 text-status-success", warning: "bg-status-warning/10 text-status-warning", danger: "bg-status-danger/10 text-status-danger" };
  const lines = { accent: "bg-accent", success: "bg-status-success", warning: "bg-status-warning", danger: "bg-status-danger" };
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`group relative min-h-44 overflow-hidden rounded-[1.4rem] border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-accent/25 hover:shadow-xl ${span}`}>
    <span className={`absolute inset-y-5 left-0 w-1 rounded-r-full ${lines[status] || lines.accent}`} /><span className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full blur-3xl ${tones[status] || tones.accent}`} />
    <div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl border border-current/10 ${tones[status] || tones.accent}`}><Icon className="h-4.5 w-4.5" /></span><Link href={href} aria-label={`Open ${label}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition hover:border-accent/30 hover:text-accent"><ArrowUpRight className="h-4 w-4" /></Link></div>
    <div className="mt-6"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p>{loading ? <Skeleton className="mt-2 h-9 w-20" /> : <p className="mt-1 text-4xl font-black tracking-[-.06em] text-foreground tabular-nums">{value}</p>}</div><BarChart3 className="mb-1 h-6 w-6 text-muted-foreground/15" /></div><p className="mt-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">{note}</p></div></div>
  </motion.div>;
}

function Panel({ eyebrow, title, description, icon: Icon, action, children, className = "" }) {
  return <section className={`relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm ${className}`}><span className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" /><header className="flex items-start justify-between gap-4 border-b border-border/70 bg-muted/15 p-5 md:p-6"><div className="flex min-w-0 gap-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent shadow-inner"><Icon className="h-4.5 w-4.5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">{eyebrow}</p><h2 className="mt-1 text-base font-bold tracking-tight text-foreground md:text-lg">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}</div></div>{action}</header>{children}</section>;
}

function ChartState({ loading, children }) {
  return loading ? <div className="flex h-[290px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : children;
}

function statusTone(status) {
  if (["confirmed", "completed", "approved", "active"].includes(status)) return "bg-status-success/10 text-status-success";
  if (["new", "pending", "unread"].includes(status)) return "bg-status-warning/10 text-status-warning";
  if (["cancelled", "denied", "removed"].includes(status)) return "bg-status-danger/10 text-status-danger";
  return "bg-muted text-muted-foreground";
}

function RecentQueue({ title, href, icon: Icon, items = [], loading, onSelect, getTitle, getSubtitle }) {
  return <div className="rounded-2xl border border-border/70 bg-background/30 p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-accent" /><h3 className="text-sm font-bold text-foreground">{title}</h3></div><Link href={href} className="text-xs font-semibold text-muted-foreground transition hover:text-accent">View all</Link></div>
    <div className="space-y-2">{loading ? [1, 2, 3].map((key) => <Skeleton key={key} className="h-16 w-full" />) : items.slice(0, 4).map((item, index) => <button key={item._id || item.id || index} onClick={() => onSelect(item)} className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-border hover:bg-muted/50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">{String(getTitle(item) || "?").charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-foreground">{getTitle(item)}</span><span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{getSubtitle(item)}</span></span><span className={`rounded-full px-2 py-1 text-[9px] font-bold capitalize ${statusTone(item.status || "active")}`}>{item.status || "active"}</span></button>)}{!loading && !items.length && <div className="py-8 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-muted-foreground/40" /><p className="mt-2 text-xs text-muted-foreground">Nothing new here</p></div>}</div>
  </div>;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const queryOptions = { refetchInterval: 5000, refetchIntervalInBackground: true };
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => fetchDashboardData("/api/admin/dashboard/stats"), ...queryOptions });
  const { data: charts, isLoading: chartsLoading } = useQuery({ queryKey: ["dashboard-charts"], queryFn: () => fetchDashboardData("/api/admin/dashboard/charts"), ...queryOptions });
  const { data: analytics, isLoading: analyticsLoading } = useQuery({ queryKey: ["dashboard-analytics"], queryFn: () => fetchDashboardData("/api/admin/analytics"), ...queryOptions });
  const { data: recent, isLoading: recentLoading } = useQuery({ queryKey: ["dashboard-recent"], queryFn: () => fetchDashboardData("/api/admin/dashboard/recent"), ...queryOptions });
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({ queryKey: ["activities"], queryFn: () => fetchDashboardData("/api/admin/activity"), ...queryOptions });

  useEffect(() => { fetch("/api/admin/me").then((response) => response.json()).then(setSession).catch(() => setSession(null)); }, []);
  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;
    const invalidate = () => ["dashboard-stats", "dashboard-charts", "dashboard-recent", "activities", "dashboard-analytics"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    const events = [SOCKET_EVENTS.NEW_MESSAGE, SOCKET_EVENTS.NEW_BOOKING, SOCKET_EVENTS.BOOKING_UPDATED, SOCKET_EVENTS.BOOKING_DELETED, SOCKET_EVENTS.BOOKING_STATS_UPDATED, SOCKET_EVENTS.STATS_UPDATED, SOCKET_EVENTS.NEW_SUBSCRIBER, SOCKET_EVENTS.NEW_BLOG, SOCKET_EVENTS.BLOG_UPDATED, SOCKET_EVENTS.NEW_SERVICE, SOCKET_EVENTS.SERVICE_CREATED, SOCKET_EVENTS.SERVICE_UPDATED, SOCKET_EVENTS.SERVICES_IMPORTED, SOCKET_EVENTS.NEW_PROJECT, SOCKET_EVENTS.PUBLIC_DATA_UPDATED, SOCKET_EVENTS.CACHE_INVALIDATED];
    events.forEach((event) => socket.on(event, invalidate));
    const onVisitor = (data) => { queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] }); queryClient.setQueryData(["activities"], (old) => [{ _id: `visitor_${Date.now()}`, module: "VISITOR", action: "LANDED", page: data?.page || "/", user: { name: data?.isFirstVisit ? "New visitor" : "Returning visitor" }, createdAt: data?.timestamp || new Date().toISOString() }, ...(Array.isArray(old) ? old : [])].slice(0, 10)); };
    socket.on("new_visitor", onVisitor);
    return () => { events.forEach((event) => socket.off(event, invalidate)); socket.off("new_visitor", onVisitor); disposeSocket(socket); };
  }, [queryClient]);

  const metrics = useMemo(() => {
    const growth = analytics?.growthRate; const down = typeof growth === "number" && growth < 0;
    return [
      { label: "Total bookings", value: stats?.bookings?.total || 0, note: `${stats?.bookings?.new || 0} awaiting review`, icon: CalendarDays, href: "/admin/bookings", status: (stats?.bookings?.new || 0) ? "warning" : "accent", span: "xl:col-span-2" },
      { label: "Unread messages", value: stats?.unreadMessages || 0, note: "Customer inquiries", icon: Mail, href: "/admin/messages", status: stats?.unreadMessages ? "warning" : "success", span: "xl:col-span-2" },
      { label: "Subscribers", value: stats?.subscribers || 0, note: "Active audience", icon: Users, href: "/admin/subscribers", status: "accent", span: "xl:col-span-2" },
      { label: "Unique visitors", value: analytics?.uniqueVisitors ?? "—", note: "Distinct website visitors", icon: Eye, href: "/admin/analytics/visitors", status: "accent", span: "xl:col-span-2" },
      { label: "Page views", value: analytics?.totalPageViews ?? "—", note: "Recorded page loads", icon: BarChart3, href: "/admin/analytics/visitors", status: "success", span: "xl:col-span-2" },
      { label: "Monthly growth", value: typeof growth === "number" ? `${growth > 0 ? "+" : ""}${growth}%` : "—", note: analytics?.growthAvailable ? "Compared with last month" : (analytics?.growthStatus || "Awaiting comparison"), icon: down ? TrendingDown : TrendingUp, href: "/admin/analytics/visitors", status: down ? "danger" : "success", span: "xl:col-span-2" },
    ];
  }, [analytics, stats]);

  const activityFeed = useMemo(() => {
    const grouped = new Map();
    for (const item of activities) {
      const key = item.module === "VISITOR"
        ? `VISITOR:${item.page || "/"}`
        : `${item.module || "CONTENT"}:${item.action || "CHANGE"}:${item.user?.name || "Admin"}`;
      if (grouped.has(key)) {
        grouped.get(key).repeatCount += 1;
      } else {
        grouped.set(key, { ...item, repeatCount: 1 });
      }
    }
    return [...grouped.values()].slice(0, 6);
  }, [activities]);

  const openActivity = (activity) => {
    const activityModule = activity.module;
    if (activityModule === "VISITOR") return window.location.assign("/admin/analytics/visitors");
    const map = { BOOKINGS: [recent?.bookings, setSelectedBooking, "bookings"], MESSAGES: [recent?.messages, setSelectedMessage, "messages"], SUBSCRIBERS: [recent?.subscribers, setSelectedSubscriber, "subscribers"] };
    if (map[activityModule]) { const [items, setter, route] = map[activityModule]; const found = items?.find((item) => item._id === activity.targetId); return found ? setter(found) : window.location.assign(`/admin/${route}?view=${activity.targetId || ""}`); }
    window.location.assign(`/admin/${String(activityModule || "dashboard").toLowerCase()}?view=${activity.targetId || ""}`);
  };

  const quickActions = [
    { label: "New article", note: "Write and publish", href: "/admin/blogs/new", Icon: BookOpen },
    { label: "New service", note: "Expand your offering", href: "/admin/services/new", Icon: Cpu },
    { label: "New project", note: "Add a case study", href: "/admin/projects/new", Icon: Briefcase },
    { label: "View inbox", note: "Reply to inquiries", href: "/admin/messages", Icon: Send },
  ];
  const firstName = session?.name?.trim()?.split(" ")[0] || "Admin";

  return <main className="mx-auto max-w-[1500px] space-y-7 pb-12">
    <section className="relative overflow-hidden rounded-[2.15rem] border border-border/70 bg-card shadow-xl shadow-overlay/5"><div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" /><div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="relative grid min-h-[310px] xl:grid-cols-[1.35fr_.65fr]"><div className="flex flex-col justify-between p-6 md:p-9 lg:p-11"><div><div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.22em] text-accent"><Sparkles className="h-3 w-3" /> Portfolio control room</div><h1 className="max-w-3xl text-4xl font-black leading-[.98] tracking-[-.055em] text-foreground md:text-6xl">Welcome back,<br /><span className="text-accent">{firstName}.</span></h1><p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">Your website is live. Review new opportunities, audience growth and publishing activity from one focused workspace.</p></div><div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/bookings" className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20">Review bookings <ArrowRight className="h-4 w-4" /></Link><Link href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background/50 px-5 text-xs font-bold text-foreground transition hover:bg-muted">Open portfolio <ArrowUpRight className="h-4 w-4" /></Link></div></div>
        <aside className="relative border-t border-border/70 bg-muted/20 p-6 xl:border-l xl:border-t-0 xl:p-8"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-muted-foreground">Today’s attention</p><p className="mt-1 text-sm font-bold text-foreground">Workspace pulse</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-status-success/10 text-status-success"><Radio className="h-4 w-4" /></span></div><div className="mt-8 space-y-3">{[{ label: "New bookings", value: stats?.bookings?.new || 0, href: "/admin/bookings", Icon: CalendarDays }, { label: "Unread messages", value: stats?.unreadMessages || 0, href: "/admin/messages", Icon: Mail }, { label: "Content library", value: (stats?.projects || 0) + (stats?.blogs || 0), href: "/admin/projects", Icon: FileText }].map(({ label, value, href, Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 transition hover:border-accent/30 hover:bg-card"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="h-4 w-4" /></span><span className="flex-1 text-xs font-semibold text-muted-foreground group-hover:text-foreground">{label}</span><span className="text-2xl font-black tracking-tight text-foreground">{statsLoading ? "—" : value}</span></Link>)}</div><div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-5 text-[10px] text-muted-foreground"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60" /><span className="relative h-2 w-2 rounded-full bg-status-success" /></span>System operational · {session?.role?.replaceAll("-", " ") || "checking access"}</div></aside></div>
    </section>

    <section><div className="mb-4 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Live overview</p><h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Business performance</h2></div><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Radio className="h-3.5 w-3.5 text-status-success" /> Refreshes every 5 seconds</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">{metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} loading={statsLoading || (index > 2 && analyticsLoading)} delay={index * .035} />)}</div></section>

    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,.7fr)]">
      <div><Panel eyebrow="Audience intelligence" title="Website performance" description="Visitor movement and the pages attracting attention." icon={TrendingUp} action={<Link href="/admin/analytics/visitors" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">Full analytics <ArrowRight className="h-3.5 w-3.5" /></Link>}><div className="grid lg:grid-cols-[1.65fr_1fr]"><div className="border-b border-border/70 p-5 md:p-6 lg:border-b-0 lg:border-r"><p className="mb-4 text-xs font-semibold text-muted-foreground">Visitor trend · 30 days</p><ChartState loading={analyticsLoading}><VisitorGrowthChart data={analytics?.monthlyTrend} /></ChartState></div><div className="p-5 md:p-6"><p className="mb-4 text-xs font-semibold text-muted-foreground">Most viewed pages</p><ChartState loading={analyticsLoading}><PageViewsChart data={analytics?.pageViews} /></ChartState></div></div></Panel></div>

      <div className="space-y-6"><Panel eyebrow="Shortcuts" title="Quick actions" description="Jump directly into your most common tasks." icon={Zap}><div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-1">{quickActions.map(({ label, note, href, Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-muted/50"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-foreground">{label}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{note}</span></span><Plus className="h-4 w-4 text-muted-foreground transition group-hover:rotate-90 group-hover:text-accent" /></Link>)}</div></Panel>
        <Panel eyebrow="Live workspace" title="Recent activity" description="Latest meaningful changes, grouped to reduce repetition." icon={Activity} action={<Link href="/admin/notifications" className="text-[10px] font-semibold text-accent hover:underline">View notifications</Link>}><div className="p-4">{activitiesLoading ? <div className="space-y-3">{[1, 2, 3, 4].map((key) => <Skeleton key={key} className="h-16 w-full" />)}</div> : <div className="relative space-y-1 before:absolute before:bottom-7 before:left-[19px] before:top-7 before:w-px before:bg-border">{activityFeed.map((item, index) => <motion.button key={item._id || index} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} onClick={() => openActivity(item)} className="group relative flex w-full gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted/50"><span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground group-hover:border-accent/30 group-hover:text-accent">{item.module === "VISITOR" ? <Eye className="h-3.5 w-3.5" /> : item.module === "BOOKINGS" ? <CalendarDays className="h-3.5 w-3.5" /> : item.module === "MESSAGES" ? <MessageSquare className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}</span><span className="min-w-0 flex-1"><span className="flex items-start gap-2 text-xs leading-5 text-foreground"><span className="min-w-0 flex-1">{item.module === "VISITOR" ? <><b>{item.user?.name || "A visitor"}</b> opened <span className="font-semibold text-accent">{item.page || "/"}</span></> : <><b>{item.user?.name || "An administrator"}</b> {item.action === "CREATE" ? "created" : item.action === "UPDATE" ? "updated" : "changed"} <span className="font-semibold text-accent">{String(item.module || "content").toLowerCase()}</span></>}</span>{item.repeatCount > 1 && <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold text-accent">×{item.repeatCount}</span>}</span><span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" />{item.createdAt ? new Date(item.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}</span></span></motion.button>)}{!activityFeed.length && <p className="py-12 text-center text-xs text-muted-foreground">Activity will appear here.</p>}</div>}</div></Panel></div>
    </div>

    <Panel eyebrow="Business pipeline" title="Bookings & service demand" description="Track inquiry momentum and the services clients request." icon={Briefcase}><div className="grid lg:grid-cols-[1.7fr_1fr]"><div className="border-b border-border/70 p-5 md:p-6 lg:border-b-0 lg:border-r"><p className="mb-4 text-xs font-semibold text-muted-foreground">Booking activity · 30 days</p><ChartState loading={chartsLoading}><BookingTrendChart data={charts?.bookingTrend} /></ChartState></div><div className="p-5 md:p-6"><p className="mb-4 text-xs font-semibold text-muted-foreground">Service distribution</p><ChartState loading={chartsLoading}><ServiceDistributionChart data={charts?.serviceDistribution} /></ChartState></div></div></Panel>

    <Panel eyebrow="Content pulse" title="Publishing activity" description="How your portfolio content is growing over time." icon={FileText}><div className="p-5 md:p-6"><ChartState loading={chartsLoading}><ContentActivityChart data={charts?.activityStats} /></ChartState></div></Panel>

    <Panel eyebrow="Work queues" title="Needs your attention" description="Open recent bookings, messages and subscribers without leaving the dashboard." icon={Bell}><div className="grid gap-4 p-4 lg:grid-cols-3"><RecentQueue title="Recent bookings" href="/admin/bookings" icon={CalendarDays} items={recent?.bookings} loading={recentLoading} onSelect={setSelectedBooking} getTitle={(item) => item.name || item.email || "Booking"} getSubtitle={(item) => item.service || item.date || "Consultation request"} /><RecentQueue title="Recent messages" href="/admin/messages" icon={MessageSquare} items={recent?.messages} loading={recentLoading} onSelect={setSelectedMessage} getTitle={(item) => item.name || item.email || "Message"} getSubtitle={(item) => item.subject || "Website inquiry"} /><RecentQueue title="New subscribers" href="/admin/subscribers" icon={Users} items={recent?.subscribers} loading={recentLoading} onSelect={setSelectedSubscriber} getTitle={(item) => item.name || item.email || "Subscriber"} getSubtitle={(item) => item.email || "Newsletter subscriber"} /></div></Panel>

    <AnimatePresence>{selectedBooking && <BookingDetailModal booking={selectedBooking} isOpen onClose={() => setSelectedBooking(null)} />}{selectedMessage && <MessageDetailModal message={selectedMessage} isOpen onClose={() => setSelectedMessage(null)} onReplySuccess={() => { setSelectedMessage(null); queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] }); }} />}{selectedSubscriber && <SubscriberDetailModal subscriber={selectedSubscriber} isOpen onClose={() => setSelectedSubscriber(null)} />}</AnimatePresence>
  </main>;
}
