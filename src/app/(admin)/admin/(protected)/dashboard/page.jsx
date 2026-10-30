"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen, Briefcase,
  CalendarDays, CheckCircle2, ChevronRight, Clock3, Cpu, Eye, FileText, Loader2,
  Mail, MessageSquare, Radio, Send, ShieldCheck, Sparkles, TrendingDown,
  TrendingUp, Users, Zap,
} from "lucide-react";
import { disposeSocket, initializeSocket, SOCKET_EVENTS } from "@/lib/socket";
import {
  BookingTrendChart,
  ServiceDistributionChart,
  ContentActivityChart,
  VisitorGrowthChart,
  PageViewsChart,
} from "@/components/admin/DashboardCharts";
import BookingDetailModal from "../components/BookingDetailModal";
import MessageDetailModal from "../components/MessageDetailModal";
import SubscriberDetailModal from "../components/SubscriberDetailModal";
import AdminPageLoader from "@/components/admin/AdminPageLoader";

const fetchDashboardData = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || "Dashboard data request failed");
  }
  return payload.data;
};

function formatRelativeTime(dateString) {
  if (!dateString) return "Just now";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Recently";
  }
}

function Skeleton({ className = "h-8 w-20" }) {
  return <span className={`block animate-pulse rounded-lg bg-muted ${className}`} />;
}

function MetricCard({ label, value, note, icon: Icon, href, loading, status = "accent", delay = 0, span = "xl:col-span-3" }) {
  const tones = {
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-status-success/10 text-status-success border-status-success/20",
    warning: "bg-status-warning/10 text-status-warning border-status-warning/20",
    danger: "bg-status-danger/10 text-status-danger border-status-danger/20",
  };
  const lines = {
    accent: "bg-accent",
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`group relative min-h-40 overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl ${span}`}
    >
      <span className={`absolute inset-y-5 left-0 w-1 rounded-r-full ${lines[status] || lines.accent}`} />
      <span className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full blur-3xl ${tones[status] || tones.accent}`} />
      
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tones[status] || tones.accent}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
          <Link
            href={href}
            aria-label={`Open ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background/50 text-muted-foreground transition-all duration-200 hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                {label}
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-9 w-20" />
              ) : (
                <p className="mt-1 text-3xl font-black tracking-[-.06em] text-foreground tabular-nums">
                  {value}
                </p>
              )}
            </div>
            <BarChart3 className="mb-1 h-6 w-6 text-muted-foreground/15" />
          </div>
          <p className="mt-2.5 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground truncate">
            {note}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Panel({ eyebrow, title, description, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md ${className}`}>
      <span className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <header className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/15 px-5 py-3.5 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">
                {eyebrow}
              </p>
            )}
            <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function ChartState({ loading, children }) {
  return loading ? (
    <div className="flex h-full min-h-[220px] flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <span className="text-xs text-muted-foreground font-medium">Loading telemetry...</span>
      </div>
    </div>
  ) : (
    <div className="flex h-full flex-1 flex-col">{children}</div>
  );
}

function statusTone(status) {
  if (["confirmed", "completed", "approved", "active"].includes(status)) return "bg-status-success/10 text-status-success border border-status-success/20";
  if (["new", "pending", "unread"].includes(status)) return "bg-status-warning/10 text-status-warning border border-status-warning/20";
  if (["cancelled", "denied", "removed"].includes(status)) return "bg-status-danger/10 text-status-danger border border-status-danger/20";
  return "bg-muted text-muted-foreground border border-border/60";
}

function RecentQueue({ title, href, icon: Icon, items = [], loading, onSelect, getTitle, getSubtitle }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-accent">
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {loading ? (
          [1, 2, 3].map((key) => <Skeleton key={key} className="h-14 w-full" />)
        ) : (
          items.slice(0, 4).map((item, index) => (
            <button
              key={item._id || item.id || index}
              onClick={() => onSelect(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2.5 text-left transition hover:border-border hover:bg-muted/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                {String(getTitle(item) || "?").charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {getTitle(item)}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {getSubtitle(item)}
                </span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold capitalize ${statusTone(item.status || "active")}`}>
                {item.status || "active"}
              </span>
            </button>
          ))
        )}
        {!loading && !items.length && (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">Nothing new here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  const queryOptions = { refetchInterval: 5000, refetchIntervalInBackground: true };
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/stats"),
    ...queryOptions,
  });
  const { data: charts, isLoading: chartsLoading } = useQuery({
    queryKey: ["dashboard-charts"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/charts"),
    ...queryOptions,
  });
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: () => fetchDashboardData("/api/admin/analytics"),
    ...queryOptions,
  });
  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => fetchDashboardData("/api/admin/dashboard/recent"),
    ...queryOptions,
  });
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => fetchDashboardData("/api/admin/activity"),
    ...queryOptions,
  });

  useEffect(() => {
    fetch("/api/admin/me")
      .then((response) => response.json())
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;
    const invalidate = () =>
      ["dashboard-stats", "dashboard-charts", "dashboard-recent", "activities", "dashboard-analytics"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    const events = [
      SOCKET_EVENTS.NEW_MESSAGE,
      SOCKET_EVENTS.NEW_BOOKING,
      SOCKET_EVENTS.BOOKING_UPDATED,
      SOCKET_EVENTS.BOOKING_DELETED,
      SOCKET_EVENTS.BOOKING_STATS_UPDATED,
      SOCKET_EVENTS.STATS_UPDATED,
      SOCKET_EVENTS.NEW_SUBSCRIBER,
      SOCKET_EVENTS.NEW_BLOG,
      SOCKET_EVENTS.BLOG_UPDATED,
      SOCKET_EVENTS.NEW_SERVICE,
      SOCKET_EVENTS.SERVICE_CREATED,
      SOCKET_EVENTS.SERVICE_UPDATED,
      SOCKET_EVENTS.SERVICES_IMPORTED,
      SOCKET_EVENTS.NEW_PROJECT,
      SOCKET_EVENTS.PUBLIC_DATA_UPDATED,
      SOCKET_EVENTS.CACHE_INVALIDATED,
    ];
    events.forEach((event) => socket.on(event, invalidate));
    const onVisitor = (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-analytics"] });
      queryClient.setQueryData(["activities"], (old) => [
        {
          _id: `visitor_${Date.now()}`,
          module: "VISITOR",
          action: "LANDED",
          page: data?.page || "/",
          user: { name: data?.isFirstVisit ? "New visitor" : "Returning visitor" },
          createdAt: data?.timestamp || new Date().toISOString(),
        },
        ...(Array.isArray(old) ? old : []),
      ].slice(0, 10));
    };
    socket.on("new_visitor", onVisitor);
    return () => {
      events.forEach((event) => socket.off(event, invalidate));
      socket.off("new_visitor", onVisitor);
      disposeSocket(socket);
    };
  }, [queryClient]);

  const metrics = useMemo(() => {
    const growth = analytics?.growthRate;
    const down = typeof growth === "number" && growth < 0;
    return [
      {
        label: "Total bookings",
        value: stats?.bookings?.total || 0,
        note: `${stats?.bookings?.new || 0} awaiting review`,
        icon: CalendarDays,
        href: "/admin/bookings",
        status: stats?.bookings?.new ? "warning" : "accent",
        span: "xl:col-span-2",
      },
      {
        label: "Unread messages",
        value: stats?.unreadMessages || 0,
        note: "Customer inquiries",
        icon: Mail,
        href: "/admin/messages",
        status: stats?.unreadMessages ? "warning" : "success",
        span: "xl:col-span-2",
      },
      {
        label: "Subscribers",
        value: stats?.subscribers || 0,
        note: "Active audience",
        icon: Users,
        href: "/admin/subscribers",
        status: "accent",
        span: "xl:col-span-2",
      },
      {
        label: "Unique visitors",
        value: analytics?.uniqueVisitors ?? "—",
        note: "Distinct website visitors",
        icon: Eye,
        href: "/admin/analytics/visitors",
        status: "accent",
        span: "xl:col-span-2",
      },
      {
        label: "Page views",
        value: analytics?.totalPageViews ?? "—",
        note: "Recorded page loads",
        icon: BarChart3,
        href: "/admin/analytics/visitors",
        status: "success",
        span: "xl:col-span-2",
      },
      {
        label: "Monthly growth",
        value: typeof growth === "number" ? `${growth > 0 ? "+" : ""}${growth}%` : "—",
        note: analytics?.growthAvailable ? "Compared with last month" : (analytics?.growthStatus || "Awaiting comparison"),
        icon: down ? TrendingDown : TrendingUp,
        href: "/admin/analytics/visitors",
        status: down ? "danger" : "success",
        span: "xl:col-span-2",
      },
    ];
  }, [analytics, stats]);

  const activityFeed = useMemo(() => {
    const grouped = new Map();
    for (const item of activities) {
      const key =
        item.module === "VISITOR"
          ? `VISITOR:${item.page || "/"}`
          : `${item.module || "CONTENT"}:${item.action || "CHANGE"}:${item.user?.name || "Admin"}`;
      if (grouped.has(key)) {
        grouped.get(key).repeatCount += 1;
      } else {
        grouped.set(key, { ...item, repeatCount: 1 });
      }
    }
    return [...grouped.values()].slice(0, 4);
  }, [activities]);

  const openActivity = (activity) => {
    const activityModule = activity.module;
    if (activityModule === "VISITOR") return window.location.assign("/admin/analytics/visitors");
    const map = {
      BOOKINGS: [recent?.bookings, setSelectedBooking, "bookings"],
      MESSAGES: [recent?.messages, setSelectedMessage, "messages"],
      SUBSCRIBERS: [recent?.subscribers, setSelectedSubscriber, "subscribers"],
    };
    if (map[activityModule]) {
      const [items, setter, route] = map[activityModule];
      const found = items?.find((item) => item._id === activity.targetId);
      return found ? setter(found) : window.location.assign(`/admin/${route}?view=${activity.targetId || ""}`);
    }
    window.location.assign(`/admin/${String(activityModule || "dashboard").toLowerCase()}?view=${activity.targetId || ""}`);
  };

  const quickActions = [
    {
      label: "New article",
      note: "Write & publish blog",
      href: "/admin/blogs/new",
      Icon: BookOpen,
      badge: "Article",
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "New service",
      note: "Add client offering",
      href: "/admin/services/new",
      Icon: Cpu,
      badge: "Offering",
      accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "New project",
      note: "Add portfolio case study",
      href: "/admin/projects/new",
      Icon: Briefcase,
      badge: "Portfolio",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Client inbox",
      note: "Review & reply inquiries",
      href: "/admin/messages",
      Icon: Send,
      badge: stats?.unreadMessages ? `${stats.unreadMessages} New` : "Inbox",
      badgeColor: stats?.unreadMessages ? "bg-status-warning/20 text-status-warning border-status-warning/30" : null,
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  const firstName = session?.name?.trim()?.split(" ")[0] || "Admin";

  const total30dTrend = Array.isArray(analytics?.monthlyTrend)
    ? analytics.monthlyTrend.reduce((sum, d) => sum + (Number(d.count) || 0), 0)
    : null;

  if (statsLoading && chartsLoading && analyticsLoading && recentLoading) {
    return (
      <AdminPageLoader
        title="Loading Workspace Dashboard"
        message="Aggregating live analytics, bookings, and telemetry metrics..."
        badge="Command Center"
      />
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] space-y-7 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-xl shadow-overlay/5">
        <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div className="relative grid min-h-[300px] xl:grid-cols-[1.35fr_.65fr]">
          <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
            <div>
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.22em] text-accent">
                <Sparkles className="h-3 w-3" /> Portfolio control room
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-[1] tracking-[-.055em] text-foreground md:text-5xl">
                Welcome back,<br />
                <span className="text-accent">{firstName}.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                Your website is live. Review new opportunities, audience growth and publishing activity from one focused workspace.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin/bookings"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5"
              >
                Review bookings <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/50 px-5 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                Open portfolio <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <aside className="relative border-t border-border/70 bg-muted/20 p-6 xl:border-l xl:border-t-0 xl:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-muted-foreground">Today’s attention</p>
                <p className="mt-1 text-sm font-bold text-foreground">Workspace pulse</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-status-success/10 text-status-success">
                <Radio className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-6 space-y-2.5">
              {[
                { label: "New bookings", value: stats?.bookings?.new || 0, href: "/admin/bookings", Icon: CalendarDays },
                { label: "Unread messages", value: stats?.unreadMessages || 0, href: "/admin/messages", Icon: Mail },
                { label: "Content library", value: (stats?.projects || 0) + (stats?.blogs || 0), href: "/admin/projects", Icon: FileText },
              ].map(({ label, value, href, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 transition hover:border-accent/30 hover:bg-card"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                    {label}
                  </span>
                  <span className="text-xl font-black tracking-tight text-foreground">
                    {statsLoading ? "—" : value}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4 text-[10px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-status-success" />
              </span>
              System operational · {session?.role?.replaceAll("-", " ") || "checking access"}
            </div>
          </aside>
        </div>
      </section>

      {/* KPI Metrics Row */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Live overview</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Business performance</h2>
          </div>
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Radio className="h-3.5 w-3.5 text-status-success" /> Refreshes every 5 seconds
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
              loading={statsLoading || (index > 2 && analyticsLoading)}
              delay={index * 0.035}
            />
          ))}
        </div>
      </section>

      {/* Main Center Section: Perfectly Equalized 2 Columns (Zero Dead Space) */}
      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,.75fr)]">
        {/* Left Column: Website Performance */}
        <div className="flex h-full flex-col">
          <Panel
            eyebrow="Audience intelligence"
            title="Website performance"
            description="Visitor movement and the pages attracting attention."
            icon={TrendingUp}
            className="h-full"
            action={
              <Link
                href="/admin/analytics/visitors"
                className="group inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
              >
                <span>Full analytics</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          >
            {/* Quick KPI Strip inside Performance Panel */}
            <div className="grid flex-shrink-0 grid-cols-2 sm:grid-cols-4 border-b border-border/70 bg-muted/10 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
              <div className="px-5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">30-Day Traffic</p>
                <p className="mt-0.5 text-base font-black text-foreground tabular-nums">
                  {analyticsLoading ? "—" : (total30dTrend ? total30dTrend.toLocaleString() : (analytics?.totalPageViews ?? 0).toLocaleString())}
                  <span className="ml-1 text-[11px] font-semibold text-muted-foreground">views</span>
                </p>
              </div>
              <div className="px-5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unique Visitors</p>
                <p className="mt-0.5 text-base font-black text-foreground tabular-nums">
                  {analyticsLoading ? "—" : (analytics?.uniqueVisitors ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="px-5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recorded Loads</p>
                <p className="mt-0.5 text-base font-black text-foreground tabular-nums">
                  {analyticsLoading ? "—" : (analytics?.totalPageViews ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="px-5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Traffic Trend</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    typeof analytics?.growthRate === "number" && analytics.growthRate < 0
                      ? "bg-status-danger/10 text-status-danger"
                      : "bg-status-success/10 text-status-success"
                  }`}>
                    {typeof analytics?.growthRate === "number" ? `${analytics.growthRate > 0 ? "+" : ""}${analytics.growthRate}%` : "Stable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Grid - Fills entire remaining height */}
            <div className="grid flex-1 lg:grid-cols-[1.6fr_1fr]">
              {/* Visitor Trend */}
              <div className="flex flex-col justify-between border-b border-border/70 p-5 md:p-6 lg:border-b-0 lg:border-r">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                    </span>
                    <h3 className="text-xs font-bold text-foreground">Visitor trend · 30 days</h3>
                  </div>
                  <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Velocity
                  </span>
                </div>
                <ChartState loading={analyticsLoading}>
                  <VisitorGrowthChart data={analytics?.monthlyTrend} />
                </ChartState>
              </div>

              {/* Most Viewed Pages */}
              <div className="flex flex-col justify-between p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground">Most viewed pages</h3>
                  <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Distribution
                  </span>
                </div>
                <ChartState loading={analyticsLoading}>
                  <PageViewsChart data={analytics?.pageViews} />
                </ChartState>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Shortcuts & Recent Activity (Balanced Height) */}
        <div className="flex h-full flex-col justify-between gap-4">
          {/* Quick Actions Panel */}
          <Panel
            eyebrow="Shortcuts"
            title="Quick actions"
            description="Jump directly into your common tasks."
            icon={Zap}
            className="flex-shrink-0"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
              {quickActions.map(({ label, note, href, Icon, badge, badgeColor, accent }) => (
                <Link
                  key={label}
                  href={href}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/70 bg-background/50 p-2.5 transition-all duration-200 hover:border-accent/40 hover:bg-card hover:shadow-md"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105 ${accent}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block truncate text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                        {label}
                      </span>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.2 text-[8px] font-bold border ${badgeColor || "border-border/60 bg-muted/60 text-muted-foreground"}`}>
                        {badge}
                      </span>
                    </div>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {note}
                    </span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </Panel>

          {/* Recent Activity Panel */}
          <Panel
            eyebrow="Live workspace"
            title="Recent activity"
            description="Latest updates & visitor actions."
            icon={Activity}
            className="flex-1 flex flex-col justify-between"
            action={
              <Link
                href="/admin/notifications"
                className="group inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-accent transition-colors"
              >
                <span>Notifications</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          >
            <div className="flex-1 flex flex-col justify-between p-3">
              {activitiesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activityFeed.map((item, index) => {
                    const isVisitor = item.module === "VISITOR";
                    const isBooking = item.module === "BOOKINGS";
                    const isMessage = item.module === "MESSAGES";
                    const isUser = item.module === "USERS";
                    const isBlog = item.module === "BLOGS";
                    const isProject = item.module === "PROJECTS";

                    const iconColor = isVisitor
                      ? "text-teal-400 bg-teal-500/10 border-teal-500/20"
                      : isBooking
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : isMessage
                      ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                      : isUser
                      ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                      : isBlog
                      ? "text-sky-400 bg-sky-500/10 border-sky-500/20"
                      : isProject
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-accent bg-accent/10 border-accent/20";

                    const ActivityIcon = isVisitor
                      ? Eye
                      : isBooking
                      ? CalendarDays
                      : isMessage
                      ? MessageSquare
                      : isUser
                      ? ShieldCheck
                      : isBlog
                      ? BookOpen
                      : isProject
                      ? Briefcase
                      : FileText;

                    const actionVerb = item.action === "CREATE"
                      ? "created"
                      : item.action === "UPDATE"
                      ? "updated"
                      : item.action === "DELETE"
                      ? "removed"
                      : (item.action || "changed").toLowerCase();

                    return (
                      <motion.button
                        key={item._id || index}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => openActivity(item)}
                        className="group relative flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2 text-left transition-all hover:border-border/80 hover:bg-muted/40"
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${iconColor}`}>
                          <ActivityIcon className="h-3.5 w-3.5" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1 text-xs leading-tight text-foreground">
                            <span className="font-bold text-foreground">
                              {item.user?.name || (isVisitor ? "A visitor" : "Administrator")}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {isVisitor ? "opened" : actionVerb}
                            </span>
                            <span className="rounded-md border border-border/60 bg-muted/60 px-1 py-0.2 text-[9px] font-mono font-medium text-accent truncate max-w-[130px]">
                              {isVisitor ? (item.page || "/") : String(item.module || "content").toLowerCase()}
                            </span>
                            {item.repeatCount > 1 && (
                              <span className="rounded-full bg-accent/15 px-1.5 py-0.2 text-[8px] font-bold text-accent">
                                ×{item.repeatCount}
                              </span>
                            )}
                          </span>

                          <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock3 className="h-2.5 w-2.5" />
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </span>

                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-accent" />
                      </motion.button>
                    );
                  })}
                  {!activityFeed.length && (
                    <p className="py-8 text-center text-xs text-muted-foreground">Activity will appear here.</p>
                  )}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Business Pipeline */}
      <Panel
        eyebrow="Business pipeline"
        title="Bookings & service demand"
        description="Track inquiry momentum and the services clients request."
        icon={Briefcase}
      >
        <div className="grid lg:grid-cols-[1.7fr_1fr]">
          <div className="border-b border-border/70 p-5 md:p-6 lg:border-b-0 lg:border-r">
            <p className="mb-4 text-xs font-semibold text-muted-foreground">Booking activity · 30 days</p>
            <ChartState loading={chartsLoading}>
              <BookingTrendChart data={charts?.bookingTrend} />
            </ChartState>
          </div>
          <div className="p-5 md:p-6">
            <p className="mb-4 text-xs font-semibold text-muted-foreground">Service distribution</p>
            <ChartState loading={chartsLoading}>
              <ServiceDistributionChart data={charts?.serviceDistribution} />
            </ChartState>
          </div>
        </div>
      </Panel>

      {/* Content Pulse */}
      <Panel
        eyebrow="Content pulse"
        title="Publishing activity"
        description="How your portfolio content is growing over time."
        icon={FileText}
      >
        <div className="p-5 md:p-6">
          <ChartState loading={chartsLoading}>
            <ContentActivityChart data={charts?.activityStats} />
          </ChartState>
        </div>
      </Panel>

      {/* Work Queues */}
      <Panel
        eyebrow="Work queues"
        title="Needs your attention"
        description="Open recent bookings, messages and subscribers without leaving the dashboard."
        icon={Bell}
      >
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          <RecentQueue
            title="Recent bookings"
            href="/admin/bookings"
            icon={CalendarDays}
            items={recent?.bookings}
            loading={recentLoading}
            onSelect={setSelectedBooking}
            getTitle={(item) => item.name || item.email || "Booking"}
            getSubtitle={(item) => item.service || item.date || "Consultation request"}
          />
          <RecentQueue
            title="Recent messages"
            href="/admin/messages"
            icon={MessageSquare}
            items={recent?.messages}
            loading={recentLoading}
            onSelect={setSelectedMessage}
            getTitle={(item) => item.name || item.email || "Message"}
            getSubtitle={(item) => item.subject || "Website inquiry"}
          />
          <RecentQueue
            title="New subscribers"
            href="/admin/subscribers"
            icon={Users}
            items={recent?.subscribers}
            loading={recentLoading}
            onSelect={setSelectedSubscriber}
            getTitle={(item) => item.name || item.email || "Subscriber"}
            getSubtitle={(item) => item.email || "Newsletter subscriber"}
          />
        </div>
      </Panel>

      {/* Detail Modals */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            isOpen
            onClose={() => setSelectedBooking(null)}
          />
        )}
        {selectedMessage && (
          <MessageDetailModal
            message={selectedMessage}
            isOpen
            onClose={() => setSelectedMessage(null)}
            onReplySuccess={() => {
              setSelectedMessage(null);
              queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] });
            }}
          />
        )}
        {selectedSubscriber && (
          <SubscriberDetailModal
            subscriber={selectedSubscriber}
            isOpen
            onClose={() => setSelectedSubscriber(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}