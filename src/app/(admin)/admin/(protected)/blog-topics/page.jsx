"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircle, Archive, ArrowLeft, BrainCircuit, CalendarDays, CheckCircle2, Clock3, Database, FileText, Loader2, Plus, RefreshCw, RotateCcw, Search, Sparkles, Target, Trash2, X, XCircle } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import useModalScrollLock from "@/hooks/useModalScrollLock";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
const filters = ["all", "planned", "ready", "reserve", "selected", "created", "used", "rejected", "failed"];
const statusStyle = {
  planned: "bg-violet-500/10 text-violet-400",
  ready: "bg-accent/10 text-accent",
  reserve: "bg-slate-500/10 text-slate-400",
  selected: "bg-status-warning/10 text-status-warning",
  created: "bg-status-success/10 text-status-success",
  used: "bg-status-success/10 text-status-success",
  rejected: "bg-status-danger/10 text-status-danger",
  failed: "bg-status-danger/10 text-status-danger"
};
const generationSteps = [{
  label: "Request prepared",
  detail: "Generation settings and queue context",
  Icon: Sparkles
}, {
  label: "AI generation",
  detail: "Unique topics and duplicate protection",
  Icon: BrainCircuit
}, {
  label: "Database sync",
  detail: "Saving accepted editorial plans",
  Icon: Database
}, {
  label: "Planner refreshed",
  detail: "Live list and counts updated",
  Icon: RefreshCw
}];
const hasCreatedBlog = topic => Boolean(topic?.usedByBlogId?._id || typeof topic?.usedByBlogId === "string" && topic.usedByBlogId);
const isCompleteCluster = group => {
  const children = [...(group?.supporting || [])].sort((a, b) => Number(a.clusterOrder) - Number(b.clusterOrder));
  return Boolean(group?.pillar && children.length === 2 && Number(children[0]?.clusterOrder) === 1 && Number(children[1]?.clusterOrder) === 2 && [group.pillar, ...children].every(hasCreatedBlog));
};
export default function EditorialPlannerPage() {
  const [topics, setTopics] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [inspectedTopic, setInspectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refilling, setRefilling] = useState(false);
  const [generation, setGeneration] = useState({
    open: false,
    status: "idle",
    stage: 0,
    elapsed: 0,
    added: 0,
    message: "",
    error: ""
  });
  const [confirmation, setConfirmation] = useState({
    type: null,
    topicId: null
  });
  const [deletingId, setDeletingId] = useState(null);
  useModalScrollLock(generation.open || Boolean(inspectedTopic));
  const load = useCallback(async () => {
    const response = await fetch("/api/admin/blog-topics", {
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setTopics(result.data.topics || []);
    setCounts(result.data.counts || {});
    setLoading(false);
  }, []);
  useEffect(() => {
    load().catch(error => {
      toast.error(error.message);
      setLoading(false);
    });
  }, [load]);
  useEffect(() => {
    const refreshProgress = () => {
      if (document.visibilityState === "visible") load().catch(() => {});
    };
    const interval = window.setInterval(refreshProgress, 5000);
    window.addEventListener("focus", refreshProgress);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshProgress);
    };
  }, [load]);
  useEffect(() => {
    const maintainReserve = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/admin/blog-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "maintain-professional-reserve" })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.data?.authority?.message || result.data?.core?.message || "Topic reserve refill failed.");
        if (Number(result.data?.generated || 0) > 0) {
          await load();
          toast.success(`${result.data.generated} professional topics added to the configured reserve.`);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    const interval = window.setInterval(maintainReserve, 10 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => {
    if (!generation.open || generation.status !== "running") return undefined;
    const timer = window.setInterval(() => setGeneration(current => ({
      ...current,
      elapsed: current.elapsed + 1
    })), 1000);
    return () => window.clearInterval(timer);
  }, [generation.open, generation.status]);
  const visible = useMemo(() => {
    let result = topics.filter(topic => {
      const matchesFilter = filter === "all" || topic.status === filter;
      const textToSearch = `${topic.title} ${topic.pillar} ${topic.subtopic} ${topic.problem} ${topic.focusKeyword} ${topic.intelligence?.primaryService?.title || ""}`.toLowerCase();
      const matchesQuery = textToSearch.includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });

    if (sortBy === "score") {
      result.sort((a, b) => (b.intelligence?.opportunityScore || b.priority || 0) - (a.intelligence?.opportunityScore || a.priority || 0));
    } else if (sortBy === "relevance") {
      result.sort((a, b) => (b.intelligence?.primaryService?.relevanceScore || 0) - (a.intelligence?.primaryService?.relevanceScore || 0));
    } else {
      result.sort((a, b) => String(a.clusterKey || a._id).localeCompare(String(b.clusterKey || b._id)) || Number(a.clusterOrder || 0) - Number(b.clusterOrder || 0));
    }
    return result;
  }, [topics, filter, query, sortBy]);
  const clusterSummary = useMemo(() => {
    const groups = new Map();
    topics.forEach(topic => {
      const groupKey = topic.clusterKey || `standalone-${topic._id}`;
      if (!groups.has(groupKey)) groups.set(groupKey, {
        pillar: null,
        supporting: []
      });
      const group = groups.get(groupKey);
      if (["pillar", "standalone_authority", "verified_trend"].includes(topic.articleType)) group.pillar = topic;else group.supporting.push(topic);
    });
    return groups;
  }, [topics]);
  const completedClusters = useMemo(() => [...clusterSummary.values()].filter(isCompleteCluster), [clusterSummary]);
  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (filter === "used" || filter === "selected") {
      return [...clusterSummary.entries()].map(([clusterKey, group]) => ({
        clusterKey,
        pillar: group.pillar,
        parentPillar: group.pillar,
        supporting: [...group.supporting].sort((a, b) => Number(a.clusterOrder) - Number(b.clusterOrder))
      })).filter(group => {
        const allTopics = [group.pillar, ...group.supporting].filter(Boolean);
        const matchesQuery = !normalizedQuery || allTopics.some(topic => `${topic.title} ${topic.pillar} ${topic.subtopic} ${topic.problem} ${topic.focusKeyword} ${topic.intelligence?.primaryService?.title || ""}`.toLowerCase().includes(normalizedQuery));
        if (!matchesQuery) return false;
        if (filter === "used") return isCompleteCluster(group);
        return allTopics.some(topic => topic.status === "selected");
      });
    }
    const visibleIds = new Set(visible.map(topic => topic._id));
    return [...clusterSummary.entries()].map(([clusterKey, group]) => {
      const pillar = group.pillar && visibleIds.has(group.pillar._id) ? group.pillar : null;
      const supporting = group.supporting.filter(topic => visibleIds.has(topic._id)).sort((a, b) => Number(a.clusterOrder) - Number(b.clusterOrder));
      return {
        clusterKey,
        pillar,
        parentPillar: group.pillar,
        supporting
      };
    }).filter(group => group.pillar || group.supporting.length);
  }, [clusterSummary, filter, query, visible]);
  const action = async (id, nextAction) => {
    const response = await fetch("/api/admin/blog-topics", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        action: nextAction
      })
    });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error);
    toast.success("Editorial topic updated.");
    load();
  };
  const executeRemove = async id => {
    setDeletingId(id);
    try {
      const response = await fetch("/api/admin/blog-topics", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id
        })
      });
      const result = await response.json();
      if (!response.ok) return toast.error(result.error);
      setConfirmation({
        type: null,
        topicId: null
      });
      toast.success("Topic removed.");
      await load();
    } finally {
      setDeletingId(null);
    }
  };
  const remove = id => setConfirmation({
    type: "delete",
    topicId: id
  });
  const executeRefill = async () => {
    setConfirmation({
      type: null,
      topicId: null
    });
    setRefilling(true);
    setGeneration({
      open: true,
      status: "running",
      stage: 0,
      elapsed: 0,
      added: 0,
      message: "Preparing a secure generation request…",
      error: ""
    });
    try {
      const request = fetch("/api/admin/blog-topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "rebuild-professional-catalog",
          authorityTarget: 10,
          trendTarget: 2
        })
      });
      setGeneration(current => ({
        ...current,
        stage: 1,
        message: "Gemini is creating and checking unique topic plans…"
      }));
      const response = await request;
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Topic generation failed.");
      setGeneration(current => ({
        ...current,
        stage: 2,
        message: "Topics saved. Refreshing the editorial queue…"
      }));
      await load();
      const coreTopics = result.data.core?.ai?.topics || 0;
      const pillarCount = result.data.core?.ai?.pillarCount ?? result.data.core?.ai?.clusters ?? 0;
      const supportingCount = result.data.core?.ai?.supportingCount ?? coreTopics - pillarCount;
      const authorityCount = result.data.authority?.generated || 0;
      const trendCount = result.data.trends?.verified || 0;
      const added = result.data.totalGenerated || coreTopics + authorityCount + trendCount;
      const message = `${pillarCount} Core Pillars, ${supportingCount} Core Supporting topics, ${authorityCount} standalone authority topics and ${trendCount} verified trends generated. ${added} total plans are ready.`;
      setGeneration(current => ({
        ...current,
        status: "success",
        stage: 3,
        added,
        message
      }));
      toast.success(message);
      window.setTimeout(() => setGeneration(current => current.status === "success" ? {
        ...current,
        open: false
      } : current), 1800);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Topic generation failed.";
      setGeneration(current => ({
        ...current,
        status: "error",
        message: "Generation could not be completed.",
        error: message
      }));
      toast.error(message);
    } finally {
      setRefilling(false);
    }
  };
  const refill = () => setConfirmation({
    type: "rebuild",
    topicId: null
  });
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  return <main className="mx-auto max-w-[1500px] space-y-6 pb-12"><section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><Link href="/admin/blogs" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-accent"><ArrowLeft className="h-4 w-4" /></Link><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-accent"><Sparkles className="h-3.5 w-3.5" /> Professional editorial intelligence</div><h1 className="mt-2 text-3xl font-black tracking-[-.045em] text-foreground md:text-4xl">Editorial planner</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Generates protected Core Pillar clusters, standalone authority articles and only source-verified technology trends in one professional catalog.</p></div></div><div className="flex flex-wrap gap-2"><Link href="/admin/blog-topics/new" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground hover:border-accent/30"><Plus className="h-4 w-4" /> Add manual topic</Link><button onClick={refill} disabled={refilling} className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 disabled:opacity-50">{refilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate professional catalog</button></div></div></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[{
        label: "Ready queue",
        value: counts.ready || 0,
        Icon: Target
      }, {
        label: "Selected",
        value: counts.selected || 0,
        Icon: Clock3
      }, {
        label: "Used clusters",
        value: completedClusters.length,
        Icon: CheckCircle2
      }, {
        label: "Needs review",
        value: (counts.failed || 0) + (counts.rejected || 0),
        Icon: XCircle
      }, {
        label: "All plans",
        value: total,
        Icon: Archive
      }].map(({
        label,
        value,
        Icon
      }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="h-4 w-4" /></span><div><p className="text-2xl font-black text-foreground">{value}</p><p className="text-[10px] font-semibold text-muted-foreground">{label}</p></div></div>)}</section>
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm"><div className="flex flex-col gap-4 border-b border-border/70 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 overflow-x-auto">{filters.map(item => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-bold capitalize ${filter === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item}{item !== "all" && <span className="ml-1.5 opacity-60">{counts[item] || 0}</span>}</button>)}</div><div className="flex items-center gap-3"><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none"><option value="default">Default Order</option><option value="score">Sort by Opportunity Score</option><option value="relevance">Sort by Service Relevance</option></select><label className="relative w-full lg:w-80"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search groups, pillars, service targets…" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent" /></label></div></div>{loading ? <AdminPageLoader title="Loading Editorial Planner" message="Analyzing Pillar clusters, demand scores, and service opportunities..." badge="AI Topic Intelligence" /> : visibleGroups.length ? <div className="grid gap-5 p-4 xl:grid-cols-2">{visibleGroups.map((group, index) => <article key={group.clusterKey} className="overflow-hidden rounded-[1.5rem] border border-accent/25 bg-background/30 shadow-sm"><div className="border-b border-accent/20 bg-accent/5 px-5 py-3"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Topic group {index + 1}</p><span className="rounded-full bg-card px-2.5 py-1 text-[9px] font-bold text-muted-foreground">1 Pillar · 2 Children</span></div><p className="mt-1 truncate text-[10px] text-muted-foreground">Cluster: {group.pillar?.clusterTitle || group.clusterKey}</p></div>{group.pillar && <div className="m-4 rounded-2xl border-2 border-accent/30 bg-card p-5 shadow-md"><div className="flex items-center justify-between gap-3"><span className="rounded-lg bg-accent px-2.5 py-1 text-[9px] font-black uppercase text-accent-foreground">Day 1 · Parent Pillar</span><div className="flex items-center gap-2"><span className="rounded-lg bg-accent/10 px-2 py-1 text-[9px] font-bold text-accent">Score: {group.pillar.intelligence?.opportunityScore || group.pillar.priority || 75}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusStyle[group.pillar.status] || "bg-muted text-muted-foreground"}`}>{group.pillar.status}</span></div></div><h2 className="mt-4 text-lg font-black leading-6 text-foreground">{group.pillar.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{group.pillar.problem}</p><div className="mt-4 flex flex-wrap items-center gap-2">{group.pillar.intelligence?.primaryService && <span className="rounded-lg border border-border bg-card px-2 py-1 text-[9px] font-semibold text-foreground">⚡ {group.pillar.intelligence.primaryService.title} ({group.pillar.intelligence.primaryService.relevanceScore}%)</span>}<span className="rounded-lg bg-accent/10 px-2 py-1 text-[9px] font-semibold text-accent">{group.pillar.focusKeyword}</span><span className="rounded-lg bg-muted px-2 py-1 text-[9px] font-semibold text-muted-foreground uppercase">{group.pillar.searchIntent || "informational"}</span><button onClick={() => setInspectedTopic(group.pillar)} className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold text-accent hover:underline"><BrainCircuit className="h-3 w-3" /> Inspect Intelligence</button></div></div>}<div className="grid gap-3 px-6 pb-5 md:grid-cols-2">{group.supporting.map(child => <div key={child._id} className="relative rounded-xl border border-border/70 bg-card/70 p-3.5 before:absolute before:-top-4 before:left-1/2 before:h-4 before:w-px before:bg-accent/30"><div className="flex items-center justify-between gap-2"><span className="text-[8px] font-black uppercase tracking-wider text-accent">Day {Number(child.clusterOrder) + 1} · Child {child.clusterOrder}</span><span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${statusStyle[child.status] || "bg-muted text-muted-foreground"}`}>{child.status}</span></div><h3 className="mt-2 text-xs font-bold leading-5 text-foreground">{child.title}</h3><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{child.problem}</p><div className="mt-2.5 flex flex-wrap gap-1">{child.intelligence?.primaryService && <span className="rounded-md border border-border/50 bg-background/50 px-1.5 py-0.5 text-[8px] font-semibold text-foreground">⚡ {child.intelligence.primaryService.title}</span>}<span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[8px] font-bold text-accent">Score: {child.intelligence?.opportunityScore || child.priority || 75}</span></div><div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2"><span className="truncate text-[8px] font-semibold text-accent">{child.focusKeyword}</span><button onClick={() => setInspectedTopic(child)} className="text-[8px] font-bold text-accent hover:underline">Inspect</button></div></div>)}</div></article>)}</div> : <div className="flex min-h-80 flex-col items-center justify-center text-center"><FileText className="h-8 w-8 text-muted-foreground/40" /><h3 className="mt-4 text-sm font-bold text-foreground">No topic groups in this view</h3><p className="mt-1 text-xs text-muted-foreground">Try another filter or generate a fresh AI cluster queue.</p></div>}</section>
    {generation.open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="AI topic generation progress"><div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-2xl"><div className="absolute inset-x-0 top-0 h-1 bg-muted"><div className={`h-full bg-accent transition-all duration-700 ${generation.status === "success" ? "w-full" : generation.status === "error" ? "w-full bg-status-danger" : generation.stage === 0 ? "w-1/4" : generation.stage === 1 ? "w-1/2 animate-pulse" : "w-3/4"}`} /></div><div className="border-b border-border/70 p-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${generation.status === "error" ? "bg-status-danger/10 text-status-danger" : generation.status === "success" ? "bg-status-success/10 text-status-success" : "bg-accent/10 text-accent"}`}>{generation.status === "error" ? <AlertCircle className="h-5 w-5" /> : generation.status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5 animate-pulse" />}</span><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">AI editorial engine</p><h2 className="mt-1 text-xl font-black tracking-tight text-foreground">{generation.status === "success" ? "Topics are ready" : generation.status === "error" ? "Generation needs attention" : "Generating unique topics"}</h2></div></div>{generation.status === "error" && <button onClick={() => setGeneration(current => ({
              ...current,
              open: false
            }))} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>}</div><p className="mt-4 text-sm leading-6 text-muted-foreground">{generation.message}</p></div><div className="space-y-2 p-6">{generationSteps.map(({
            label,
            detail,
            Icon
          }, index) => {
            const complete = generation.status === "success" || generation.stage > index;
            const active = generation.status === "running" && generation.stage === index;
            return <div key={label} className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${active ? "border-accent/30 bg-accent/5" : "border-border/60"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${complete ? "bg-status-success/10 text-status-success" : active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{complete ? <CheckCircle2 className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}</span><div className="min-w-0"><p className="text-xs font-bold text-foreground">{label}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{detail}</p></div></div>;
          })}</div><div className="flex items-center justify-between border-t border-border/70 bg-muted/25 px-6 py-4"><span className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{generation.elapsed}s elapsed</span>{generation.status === "running" && <span className="text-[10px] font-bold text-accent">Please keep this window open</span>}{generation.status === "success" && <span className="text-[10px] font-bold text-status-success">{generation.added} topics processed · closing automatically</span>}{generation.status === "error" && <button onClick={refill} className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-4 text-[10px] font-bold text-accent-foreground"><RefreshCw className="h-3.5 w-3.5" />Try again</button>}</div>{generation.error && <div className="mx-6 mb-6 rounded-xl border border-status-danger/20 bg-status-danger/10 p-3 text-xs leading-5 text-status-danger"><strong className="block text-[9px] uppercase tracking-wider">Error details</strong>{generation.error}</div>}</div></div>}
    {inspectedTopic && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-md" role="dialog" aria-modal="true"><div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-2xl"><div className="flex items-center justify-between border-b border-border/70 p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><BrainCircuit className="h-5 w-5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Topic Intelligence Inspection</p><h2 className="text-lg font-black text-foreground">{inspectedTopic.title}</h2></div></div><button onClick={() => setInspectedTopic(null)} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button></div><div className="max-h-[70vh] overflow-y-auto p-6 space-y-6"><div><h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">5-Dimension Score Breakdown</h4><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-semibold text-muted-foreground">Demand Score</p><p className="text-lg font-black text-accent">{inspectedTopic.intelligence?.scoreBreakdown?.demandScore || 80}/100</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-semibold text-muted-foreground">Intent Score</p><p className="text-lg font-black text-accent">{inspectedTopic.intelligence?.scoreBreakdown?.intentScore || 75}/100</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-semibold text-muted-foreground">Authority Score</p><p className="text-lg font-black text-accent">{inspectedTopic.intelligence?.scoreBreakdown?.authorityScore || 85}/100</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-semibold text-muted-foreground">Commercial Score</p><p className="text-lg font-black text-accent">{inspectedTopic.intelligence?.scoreBreakdown?.commercialScore || 70}/100</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-semibold text-muted-foreground">Service Relevance</p><p className="text-lg font-black text-accent">{inspectedTopic.intelligence?.scoreBreakdown?.serviceRelevanceScore || 80}/100</p></div><div className="rounded-xl border border-border bg-card p-3"><p className="text-[10px] font-semibold text-accent">Overall Score</p><p className="text-lg font-black text-foreground">{inspectedTopic.intelligence?.opportunityScore || inspectedTopic.priority || 75}/100</p></div></div></div><div><h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Service Mapping & Recommendation</h4><div className="rounded-xl border border-border bg-background p-4 space-y-2"><p className="text-xs text-foreground"><strong className="text-accent">Primary Service:</strong> {inspectedTopic.intelligence?.primaryService ? `${inspectedTopic.intelligence.primaryService.title} (${inspectedTopic.intelligence.primaryService.relevanceScore}% Match)` : "No direct service mapping"}</p><p className="text-xs text-foreground"><strong className="text-accent">AI Recommendation:</strong> <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400">{inspectedTopic.intelligence?.aiRecommendation || "GENERATE"}</span></p><p className="text-xs text-muted-foreground"><strong className="text-foreground">Focus Keyword:</strong> {inspectedTopic.focusKeyword || "N/A"}</p><p className="text-xs text-muted-foreground"><strong className="text-foreground">Problem Solved:</strong> {inspectedTopic.problem || "N/A"}</p></div></div></div><div className="flex justify-end border-t border-border/70 bg-muted/25 px-6 py-4"><button onClick={() => setInspectedTopic(null)} className="rounded-xl bg-accent px-5 py-2 text-xs font-bold text-accent-foreground">Close Inspection</button></div></div></div>}
    <ConfirmDialog isOpen={confirmation.type === "rebuild"} tone="accent" title="Generate the professional topic catalog?" message="One Core AI request will prepare 6 candidates and keep the best 5 protected Pillar clusters with 10 Supporting articles. One smaller Authority request will add up to 10 duplicate-safe standalone topics, while trends are added only after official verification. Used history remains protected." confirmText="Generate full catalog" cancelText="Keep current topics" isDeleting={refilling} onCancel={() => setConfirmation({
      type: null,
      topicId: null
    })} onConfirm={executeRefill} />
    <ConfirmDialog isOpen={confirmation.type === "delete"} title="Delete this topic plan?" message="This unused topic will be removed from the editorial queue. This action cannot be undone." confirmText="Delete topic" isDeleting={Boolean(deletingId)} onCancel={() => setConfirmation({
      type: null,
      topicId: null
    })} onConfirm={() => executeRemove(confirmation.topicId)} />
  </main>;
}
