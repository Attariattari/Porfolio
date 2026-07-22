"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Activity, ArrowLeft, BarChart3, CalendarDays, CheckCircle2, Download, Eye, FileText, Globe2, Loader2, MapPin, Monitor, Radio, Sparkles, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { disposeSocket, initializeSocket } from "@/lib/socket";
import { EnhancedVisitorChart, MonthlyGrowthComparisonChart, HourlyBreakdownChart, DeviceDistributionChart, TopPagesChart, GeoDistributionChart } from "@/components/admin/AnalyticsCharts";
import { DeviceStatsGrid, LocationCard, RealTimeActivityFeed, AnalyticsTable } from "@/components/admin/AnalyticsComponents";

async function fetchAnalyticsData(url) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error || payload.message || "Analytics request failed");
  return payload.data;
}

function Loader({ height = "h-[320px]" }) { return <div className={`flex ${height} items-center justify-center`}><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>; }

function Panel({ eyebrow, title, description, icon: Icon, action, children, className = "" }) {
  return <section className={`relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm ${className}`}><span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" /><header className="flex flex-col justify-between gap-4 border-b border-border/70 bg-muted/15 p-5 sm:flex-row sm:items-start md:p-6"><div className="flex gap-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent"><Icon className="h-4.5 w-4.5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">{eyebrow}</p><h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">{title}</h2>{description && <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{description}</p>}</div></div>{action}</header>{children}</section>;
}

function Kpi({ label, value, note, icon: Icon, tone = "accent", loading, delay }) {
  const tones = { accent: "bg-accent/10 text-accent", success: "bg-status-success/10 text-status-success", warning: "bg-status-warning/10 text-status-warning", danger: "bg-status-danger/10 text-status-danger" };
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="group relative overflow-hidden rounded-[1.4rem] border border-border/70 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-lg"><span className={`absolute -right-8 -top-10 h-28 w-28 rounded-full blur-3xl ${tones[tone]}`} /><div className="relative flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.17em] text-muted-foreground">{label}</p>{loading ? <span className="mt-3 block h-9 w-20 animate-pulse rounded-lg bg-muted" /> : <p className="mt-2 text-4xl font-black tracking-[-.06em] text-foreground tabular-nums">{value}</p>}</div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-4.5 w-4.5" /></span></div><p className="relative mt-5 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">{note}</p></motion.div>;
}

function CompactList({ title, icon: Icon, data = [], loading }) {
  return <div className="rounded-2xl border border-border/70 bg-background/25 p-4"><div className="mb-4 flex items-center gap-2"><Icon className="h-4 w-4 text-accent" /><h3 className="text-sm font-bold text-foreground">{title}</h3></div>{loading ? <Loader height="h-40" /> : <div className="space-y-2">{data.slice(0, 6).map((item, index) => <div key={item._id || index} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted/50"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-[10px] font-bold text-accent">{index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{item._id || "Unknown"}</span><span className="text-xs font-bold text-accent tabular-nums">{item.count?.toLocaleString?.() || 0}</span></div>)}{!data.length && <p className="py-8 text-center text-xs text-muted-foreground">No data available</p>}</div>}</div>;
}

export default function VisitorAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [view, setView] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();
  const polling = { refetchInterval: 10000 };
  const { data: visitors, isLoading: visitorsLoading, isFetching } = useQuery({ queryKey: ["analytics-visitors", period, view], queryFn: () => fetchAnalyticsData(`/api/admin/analytics/visitors?period=${period}&view=${view}`), refetchInterval: 5000 });
  const { data: devices, isLoading: devicesLoading } = useQuery({ queryKey: ["analytics-devices", period], queryFn: () => fetchAnalyticsData(`/api/admin/analytics/devices?period=${period}`), ...polling });
  const { data: pages, isLoading: pagesLoading } = useQuery({ queryKey: ["analytics-pages", period], queryFn: () => fetchAnalyticsData(`/api/admin/analytics/pages?period=${period}`), ...polling });
  const { data: geography, isLoading: geoLoading } = useQuery({ queryKey: ["analytics-geo", period], queryFn: () => fetchAnalyticsData(`/api/admin/analytics/geo?period=${period}`), ...polling });
  const { data: active, isLoading: activeLoading } = useQuery({ queryKey: ["analytics-active"], queryFn: () => fetchAnalyticsData("/api/admin/analytics/active"), refetchInterval: 5000 });
  const { data: monthly, isLoading: monthlyLoading } = useQuery({ queryKey: ["analytics-monthly-growth", selectedMonth], queryFn: () => fetchAnalyticsData(`/api/admin/analytics/monthly-growth?month=${selectedMonth}`), refetchInterval: 5000, refetchIntervalInBackground: true });

  useEffect(() => {
    const socket = initializeSocket(); if (!socket) return;
    const refresh = () => ["analytics-visitors", "analytics-devices", "analytics-pages", "analytics-geo", "analytics-active", "analytics-monthly-growth"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    const visitor = (data) => { refresh(); toast.info(`${data.isFirstVisit ? "New" : "Returning"} visitor from ${data.country || "Unknown"} on ${data.page || "/"}`, { icon: <Activity className="h-4 w-4 text-status-success" />, duration: 3000 }); };
    socket.on("STATS_UPDATED", refresh); socket.on("new_visitor", visitor);
    return () => { socket.off("STATS_UPDATED", refresh); socket.off("new_visitor", visitor); disposeSocket(socket); };
  }, [queryClient]);

  const months = useMemo(() => Array.from({ length: 24 }, (_, index) => { const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - index); return { value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, label: date.toLocaleDateString(undefined, { month: "long", year: "numeric" }) }; }), []);
  const duration = (seconds) => seconds == null ? "—" : seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const growth = visitors?.stats?.growthRate;
  const growthDown = typeof growth === "number" && growth < 0;
  const kpis = [
    { label: "Page views", value: visitors?.stats?.totalPageViews ?? "—", note: `Recorded in the last ${period} days`, icon: FileText, tone: "accent" },
    { label: "Unique visitors", value: visitors?.stats?.uniqueVisitors ?? "—", note: typeof growth === "number" ? `${growth > 0 ? "+" : ""}${growth}% versus previous period` : (visitors?.stats?.growthStatus || "Building comparison baseline"), icon: Users, tone: growthDown ? "danger" : "success" },
    { label: "Bounce rate", value: visitors?.stats?.bounceRate == null ? "—" : `${visitors.stats.bounceRate}%`, note: visitors?.stats?.measuredSessions ? `${visitors.stats.measuredSessions} measured sessions` : "Awaiting verified sessions", icon: Activity, tone: "warning" },
    { label: "Average session", value: duration(visitors?.stats?.avgSessionDuration), note: "Time visitors actively engaged", icon: Zap, tone: "accent" },
  ];

  const exportReport = () => {
    try { const rows = [["Visitor Analytics Report", `Period: Last ${period} days`], [], ["Metric", "Value"], ["Page Views", visitors?.stats?.totalPageViews ?? ""], ["Unique Visitors", visitors?.stats?.uniqueVisitors ?? ""], ["Growth", visitors?.stats?.growthRate ?? ""], ["Bounce Rate", visitors?.stats?.bounceRate ?? ""], ["Avg Session Duration", visitors?.stats?.avgSessionDuration ?? ""]]; const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `visitor-analytics-${new Date().toISOString().split("T")[0]}.csv`; anchor.click(); URL.revokeObjectURL(url); toast.success("Analytics report exported."); } catch { toast.error("Report could not be exported."); }
  };

  const growthTone = monthly?.growthRate < 0 ? "danger" : "success";
  return <main className="mx-auto max-w-[1500px] space-y-6 pb-12">
    <section className="relative overflow-hidden rounded-[2.1rem] border border-border/70 bg-card shadow-xl shadow-overlay/5"><div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-accent/15 blur-3xl" /><div className="relative grid xl:grid-cols-[1.2fr_.8fr]"><div className="p-6 md:p-9 lg:p-11"><Link href="/admin/dashboard" className="mb-7 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-accent"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20"><BarChart3 className="h-6 w-6" /></span><div><div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-accent"><Sparkles className="h-3.5 w-3.5" /> Audience intelligence</div><h1 className="text-3xl font-black tracking-[-.045em] text-foreground md:text-5xl">Visitor analytics</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Understand who visits your portfolio, what attracts attention and how your audience grows.</p></div></div></div><aside className="border-t border-border/70 bg-muted/20 p-6 md:p-8 xl:border-l xl:border-t-0"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-muted-foreground">Live tracking</p><p className="mt-1 text-sm font-bold text-foreground">Analysis window</p></div><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-status-success" /></span></div><div className="mt-6 grid grid-cols-4 gap-2 rounded-xl border border-border bg-card/60 p-1.5">{[7, 14, 30, 90].map((days) => <button key={days} onClick={() => setPeriod(days)} className={`rounded-lg py-2.5 text-[10px] font-bold transition ${period === days ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{days}d</button>)}</div><div className="mt-4 flex items-center justify-between gap-3"><span className="text-[10px] text-muted-foreground">{isFetching && !visitorsLoading ? "Refreshing live data…" : `Last ${period} days selected`}</span><button onClick={exportReport} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground transition hover:border-accent/30 hover:text-accent"><Download className="h-4 w-4" /> Export CSV</button></div></aside></div></section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{kpis.map((item, index) => <Kpi key={item.label} {...item} loading={visitorsLoading} delay={index * .04} />)}</section>

    <Panel eyebrow="Growth intelligence" title="Month-over-month performance" description="Compare unique visitors with the previous calendar month." icon={monthly?.growthRate < 0 ? TrendingDown : TrendingUp} action={<label className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="h-10 min-w-48 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-accent">{months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}</select></label>}><div className="grid xl:grid-cols-[340px_1fr]"><div className="border-b border-border/70 p-5 xl:border-b-0 xl:border-r md:p-6">{monthlyLoading ? <Loader /> : <><div className="grid grid-cols-2 gap-3">{[{ label: monthly?.monthLabel || "Current", value: monthly?.currentVisitors || 0 }, { label: monthly?.previousMonthLabel || "Previous", value: monthly?.previousVisitors || 0 }].map((item) => <div key={item.label} className="rounded-xl border border-border/70 bg-background/30 p-4"><p className="truncate text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-black text-foreground tabular-nums">{item.value.toLocaleString()}</p></div>)}</div><div className={`mt-3 rounded-2xl p-5 ${growthTone === "danger" ? "bg-status-danger/10" : "bg-status-success/10"}`}><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Growth rate</p><div className="mt-2 flex items-end justify-between"><p className={`text-4xl font-black tracking-tight ${growthTone === "danger" ? "text-status-danger" : "text-status-success"}`}>{typeof monthly?.growthRate === "number" ? `${monthly.growthRate > 0 ? "+" : ""}${monthly.growthRate}%` : monthly?.currentVisitors > 0 ? "New" : "0%"}</p><span className="text-xs font-bold text-muted-foreground">{monthly?.difference > 0 ? "+" : ""}{monthly?.difference || 0} visitors</span></div></div></>}</div><div className="p-5 md:p-6">{monthlyLoading ? <Loader height="h-[360px]" /> : <MonthlyGrowthComparisonChart data={monthly?.daily} currentLabel={monthly?.monthLabel} previousLabel={monthly?.previousMonthLabel} />}</div></div></Panel>

    <div className="grid gap-6 xl:grid-cols-[1.45fr_.55fr]"><Panel eyebrow="Traffic behavior" title="Visitor trend" description={view === "daily" ? "Daily unique visitors across the selected window." : `Visitor activity by hour across the last ${period} days.`} icon={TrendingUp} action={<div className="flex rounded-xl border border-border bg-background p-1">{["daily", "hourly"].map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-4 py-2 text-[10px] font-bold capitalize ${view === item ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>)}</div>}><div className="p-5 md:p-6">{visitorsLoading ? <Loader height="h-[400px]" /> : <EnhancedVisitorChart data={view === "daily" ? visitors?.trend : visitors?.hourly} view={view} />}</div></Panel><Panel eyebrow="Peak timing" title="Hourly breakdown" description={`Engagement distribution across the last ${period} days.`} icon={CalendarDays}><div className="p-5 md:p-6">{visitorsLoading ? <Loader /> : <HourlyBreakdownChart data={visitors?.hourly} />}</div></Panel></div>

    <div className="grid gap-6 lg:grid-cols-2"><Panel eyebrow="Audience technology" title="Device breakdown" description="How visitors access your portfolio." icon={Monitor}><div className="p-5 md:p-6">{devicesLoading ? <Loader /> : <DeviceDistributionChart data={devices?.devices} />}</div></Panel><Panel eyebrow="Content discovery" title="Top pages" description="Pages receiving the strongest attention." icon={FileText}><div className="p-5 md:p-6">{pagesLoading ? <Loader /> : <TopPagesChart data={pages?.topPages} />}</div></Panel></div>

    <Panel eyebrow="Device detail" title="Technology snapshot" description="Visit share and unique audience by device category." icon={Monitor}><div className="p-4 md:p-6"><DeviceStatsGrid devices={devices?.devices} isLoading={devicesLoading} /></div></Panel>

    <Panel eyebrow="Geographic reach" title="Traffic by country" description="Where your audience is connecting from." icon={Globe2}><div className="px-4 py-2 md:px-5 md:py-3"><div className="mx-auto w-full max-w-4xl">{geoLoading ? <Loader height="h-[190px]" /> : <GeoDistributionChart data={geography?.countries} />}</div></div></Panel>

    <RealTimeActivityFeed activities={active?.recentActivity} isLoading={activeLoading} />

    <Panel eyebrow="Location intelligence" title="Top visitor locations" description="Leading countries and cities during the selected period." icon={MapPin}><div className="grid gap-4 p-4 lg:grid-cols-2"><div className="rounded-2xl border border-border/70 bg-background/25 p-4"><h3 className="mb-4 text-sm font-bold text-foreground">Countries</h3><div className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar">{geoLoading ? <Loader height="h-40" /> : geography?.countries?.length ? geography.countries.map((item, index) => <LocationCard key={`${item.country}-${index}`} location={item} type="country" maxVisitors={geography.countries[0]?.visitors} />) : <p className="py-8 text-center text-xs text-muted-foreground">No country data</p>}</div></div><div className="rounded-2xl border border-border/70 bg-background/25 p-4"><h3 className="mb-4 text-sm font-bold text-foreground">Cities</h3><div className="max-h-96 space-y-2 overflow-y-auto custom-scrollbar">{geoLoading ? <Loader height="h-40" /> : geography?.cities?.length ? geography.cities.map((item, index) => <LocationCard key={`${item.city}-${index}`} location={item} type="city" maxVisitors={geography.cities[0]?.visitors} />) : <p className="py-8 text-center text-xs text-muted-foreground">No city data</p>}</div></div></div></Panel>

    <AnalyticsTable title="Page engagement" data={pages?.pageEngagement} columns={["Page", "Visits", "AvgSessionDuration", "BounceRate", "UniqueVisitors"]} icon={FileText} isLoading={pagesLoading} />

    <Panel eyebrow="Browser environment" title="Platforms & software" description="Browsers and operating systems used by your visitors." icon={Monitor}><div className="grid gap-4 p-4 lg:grid-cols-2"><CompactList title="Top browsers" icon={Globe2} data={devices?.browsers} loading={devicesLoading} /><CompactList title="Operating systems" icon={Monitor} data={devices?.operatingSystems} loading={devicesLoading} /></div></Panel>
  </main>;
}
