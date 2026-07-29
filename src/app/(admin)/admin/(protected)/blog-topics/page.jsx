"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircle, Archive, ArrowLeft, BrainCircuit, CalendarDays, CheckCircle2, Clock3, Database, FileText, Loader2, Plus, RefreshCw, RotateCcw, Search, Sparkles, Target, Trash2, X, XCircle } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import useModalScrollLock from "@/hooks/useModalScrollLock";
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
  useModalScrollLock(generation.open);
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
    if (!generation.open || generation.status !== "running") return undefined;
    const timer = window.setInterval(() => setGeneration(current => ({
      ...current,
      elapsed: current.elapsed + 1
    })), 1000);
    return () => window.clearInterval(timer);
  }, [generation.open, generation.status]);
  const visible = useMemo(() => topics.filter(topic => (filter === "all" || topic.status === filter) && `${topic.title} ${topic.pillar} ${topic.subtopic} ${topic.problem} ${topic.focusKeyword}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => String(a.clusterKey || a._id).localeCompare(String(b.clusterKey || b._id)) || Number(a.clusterOrder || 0) - Number(b.clusterOrder || 0)), [topics, filter, query]);
  const clusterSummary = useMemo(() => {
    const groups = new Map();
    topics.forEach(topic => {
      const groupKey = topic.clusterKey || `standalone-${topic._id}`;
      if (!groups.has(groupKey)) groups.set(groupKey, {
        pillar: null,
        supporting: []
      });
      const group = groups.get(groupKey);
      if (topic.articleType === "pillar") group.pillar = topic;else group.supporting.push(topic);
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
        const matchesQuery = !normalizedQuery || allTopics.some(topic => `${topic.title} ${topic.pillar} ${topic.subtopic} ${topic.problem} ${topic.focusKeyword}`.toLowerCase().includes(normalizedQuery));
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
          action: "rebuild-clusters"
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
      const added = result.data.ai?.topics || 0;
      const pillarCount = result.data.ai?.pillarCount ?? result.data.ai?.clusters ?? 0;
      const supportingCount = result.data.ai?.supportingCount ?? added - pillarCount;
      const message = `${pillarCount} AI Pillar clusters generated, ${supportingCount} Supporting topics, ${added} total topics. Used-topic history was preserved.`;
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
  return <main className="mx-auto max-w-[1500px] space-y-6 pb-12"><section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><Link href="/admin/blogs" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-accent"><ArrowLeft className="h-4 w-4" /></Link><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-accent"><Sparkles className="h-3.5 w-3.5" /> Smart editorial queue</div><h1 className="mt-2 text-3xl font-black tracking-[-.045em] text-foreground md:text-4xl">Editorial planner</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A Pillar-first pipeline of duplicate-checked AI content clusters. Used-topic history remains preserved and Supporting topics stay linked to their published Pillar.</p></div></div><div className="flex flex-wrap gap-2"><Link href="/admin/blog-topics/new" className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground hover:border-accent/30"><Plus className="h-4 w-4" /> Add manual topic</Link><button onClick={refill} disabled={refilling} className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 disabled:opacity-50">{refilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate unique topics</button></div></div></section>
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
    <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm"><div className="flex flex-col gap-4 border-b border-border/70 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 overflow-x-auto">{filters.map(item => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-bold capitalize ${filter === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item}{item !== "all" && <span className="ml-1.5 opacity-60">{counts[item] || 0}</span>}</button>)}</div><label className="relative w-full lg:w-80"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search groups, pillars, child topics…" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent" /></label></div>{loading ? <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div> : visibleGroups.length ? <div className="grid gap-5 p-4 xl:grid-cols-2">{visibleGroups.map((group, index) => <article key={group.clusterKey} className="overflow-hidden rounded-[1.5rem] border border-accent/25 bg-background/30 shadow-sm"><div className="border-b border-accent/20 bg-accent/5 px-5 py-3"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Topic group {index + 1}</p><span className="rounded-full bg-card px-2.5 py-1 text-[9px] font-bold text-muted-foreground">1 Pillar · 2 Children</span></div><p className="mt-1 truncate text-[10px] text-muted-foreground">Cluster: {group.pillar?.clusterTitle || group.clusterKey}</p></div>{group.pillar && <div className="m-4 rounded-2xl border-2 border-accent/30 bg-card p-5 shadow-md"><div className="flex items-center justify-between gap-3"><span className="rounded-lg bg-accent px-2.5 py-1 text-[9px] font-black uppercase text-accent-foreground">Day 1 · Parent Pillar</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusStyle[group.pillar.status] || "bg-muted text-muted-foreground"}`}>{group.pillar.status}</span></div><h2 className="mt-4 text-lg font-black leading-6 text-foreground">{group.pillar.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{group.pillar.problem}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-accent/10 px-2 py-1 text-[9px] font-semibold text-accent">{group.pillar.focusKeyword}</span><span className="rounded-lg bg-muted px-2 py-1 text-[9px] font-semibold text-muted-foreground">2,000–3,500 words</span></div></div>}<div className="grid gap-3 px-6 pb-5 md:grid-cols-2">{group.supporting.map(child => <div key={child._id} className="relative rounded-xl border border-border/70 bg-card/70 p-3.5 before:absolute before:-top-4 before:left-1/2 before:h-4 before:w-px before:bg-accent/30"><div className="flex items-center justify-between gap-2"><span className="text-[8px] font-black uppercase tracking-wider text-accent">Day {Number(child.clusterOrder) + 1} · Child {child.clusterOrder}</span><span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${statusStyle[child.status] || "bg-muted text-muted-foreground"}`}>{child.status}</span></div><h3 className="mt-2 text-xs font-bold leading-5 text-foreground">{child.title}</h3><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{child.problem}</p><div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2"><span className="truncate text-[8px] font-semibold text-accent">{child.focusKeyword}</span><span className="text-[8px] text-muted-foreground">900–1,200 words</span></div></div>)}</div></article>)}</div> : <div className="flex min-h-80 flex-col items-center justify-center text-center"><FileText className="h-8 w-8 text-muted-foreground/40" /><h3 className="mt-4 text-sm font-bold text-foreground">No topic groups in this view</h3><p className="mt-1 text-xs text-muted-foreground">Try another filter or generate a fresh AI cluster queue.</p></div>}</section>
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
    <ConfirmDialog isOpen={confirmation.type === "rebuild"} tone="accent" title="Generate a fresh topic catalog?" message="Every unused topic will be replaced only after Gemini prepares exactly 10 duplicate-checked AI Pillar clusters with 20 linked Supporting topics. Used topic history will remain protected." confirmText="Generate topics" cancelText="Keep current topics" isDeleting={refilling} onCancel={() => setConfirmation({
      type: null,
      topicId: null
    })} onConfirm={executeRefill} />
    <ConfirmDialog isOpen={confirmation.type === "delete"} title="Delete this topic plan?" message="This unused topic will be removed from the editorial queue. This action cannot be undone." confirmText="Delete topic" isDeleting={Boolean(deletingId)} onCancel={() => setConfirmation({
      type: null,
      topicId: null
    })} onConfirm={() => executeRemove(confirmation.topicId)} />
  </main>;
}
