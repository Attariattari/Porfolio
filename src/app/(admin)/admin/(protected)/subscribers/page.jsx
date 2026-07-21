"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, Send, Filter, Users, UserCheck, UserX, CheckSquare, Square, Zap, RefreshCcw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const newsletterSchema = z.object({
  type: z.enum(["blog", "service", "project", "manual"]),
  targetId: z.string().optional(),
  recipients: z.enum(["selected", "all"]),
  subject: z.string().min(5, "Subject is too short"),
  message: z.string().min(10, "Message must be descriptive"),
});

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Pagination & Selection
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal Data
  const [contentOptions, setContentOptions] = useState([]);
  const [contentType, setContentType] = useState("manual");
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("subscribers");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/subscribers?status=${filterStatus}&search=${search}&page=${page}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setStats(data.stats);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      toast.error("Network synchronization failed.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, page, limit]);

  const fetchLogs = useCallback(async () => {
    try {
        setLoadingLogs(true);
        const res = await fetch("/api/admin/newsletter/logs");
        const data = await res.json();
        if (data.success) {
            setLogs(data.logs);
        }
    } catch (error) {
        toast.error("Failed to load campaign protocols.");
    } finally {
        setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === 'subscribers') fetchSubscribers();
      else fetchLogs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSubscribers, fetchLogs, activeTab]);

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(d => setSession(d));
  }, []);

  // Auto-open detail if 'view' param is present
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!viewId || subscribers.length === 0) return;
      const target = subscribers.find(s => s._id === viewId);
      if (target) {
        setViewingItem(target);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [viewId, subscribers]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(subscribers.map(s => s._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkStatusUpdate = async (isActive) => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Initiating bulk ${isActive ? 'reactivation' : 'deactivation'}...`);
    try {
        const res = await fetch("/api/admin/subscribers/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds, isActive })
        });
        const data = await res.json();
        if (data.success) {
            toast.success(data.message, { id: toastId });
            fetchSubscribers();
            setSelectedIds([]);
        } else {
            toast.error(data.error, { id: toastId });
        }
    } catch (error) {
        toast.error("Operation failed: Shield violation.", { id: toastId });
    }
  };

  const fetchContentOptions = async (type) => {
    if (type === 'manual') return;
    try {
        const res = await fetch(`/api/${type}s`); // blogs, services, projects
        const data = await res.json();
        if (data.success) {
            const options = data.data.map(item => ({
                value: item._id,
                label: item.title
            }));
            setContentOptions(options);
        }
    } catch (err) {
        toast.error(`Failed to fetch ${type} list.`);
    }
  };

  const logColumns = [
    {
        key: "sentAt",
        label: "Deployment Time",
        render: (item) => (
            <div className="flex flex-col">
                <span className="text-foreground font-bold tracking-tight">{format(new Date(item.sentAt), "MMM d, HH:mm")}</span>
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">{format(new Date(item.sentAt), "yyyy-MM-dd")}</span>
            </div>
        )
    },
    {
        key: "type",
        label: "Content Class",
        render: (item) => (
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.15em] border ${
                item.type === 'manual' ? 'bg-muted/50 border-border text-muted-foreground' : 'bg-accent/10 text-accent border-accent/20'
            }`}>
                {item.type}
            </span>
        )
    },
    {
        key: "subject",
        label: "Transmission Line",
        render: (item) => (
            <div className="flex flex-col max-w-xs">
                <span className="text-foreground font-medium truncate">{item.subject}</span>
                {item.contentSummary && <span className="text-[9px] text-muted-foreground truncate mt-1 italic">&ldquo;{item.contentSummary}&rdquo;</span>}
            </div>
        )
    },
    {
        key: "sentToCount",
        label: "Target Nodes",
        render: (item) => (
            <span className="text-[12px] font-black italic tracking-tighter text-foreground">{item.sentToCount}</span>
        )
    },
    {
        key: "results",
        label: "Success / Failure",
        render: (item) => (
            <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">{item.successCount}</span>
                <span className="text-muted-foreground/80">/</span>
                <span className="text-red-500 font-bold">{item.failedCount}</span>
            </div>
        )
    }
  ];

  const newsletterFields = [
    {
        name: "type",
        label: "Intelligence Type",
        type: "select",
        options: [
            { value: "manual", label: "Custom Protocol (Manual)" },
            { value: "blog", label: "Blog Archive" },
            { value: "service", label: "Service Expansion" },
            { value: "project", label: "Project Launch" },
        ],
        required: true
    },
    {
        name: "targetId",
        label: "Content Source",
        type: "custom",
        render: ({ watch, register }) => {
            const currentType = watch("type");
            if (currentType === "manual") return <p className="text-[10px] text-muted-foreground italic mt-2">Custom message mode: No source required.</p>;

            // Handle loading content options
            if (currentType !== contentType) {
                setContentType(currentType);
                fetchContentOptions(currentType);
            }

            return (
                <select
                    {...register("targetId")}
                    className="w-full p-4 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-accent font-medium mt-1"
                >
                    <option value="">Select specific entry...</option>
                    {contentOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-background">{opt.label}</option>)}
                </select>
            );
        }
    },
    {
        name: "recipients",
        label: "Target Range",
        type: "select",
        options: [
            { value: "all", label: "Global Broadcast (All Active)" },
            { value: "selected", label: `Focused Broadcast (${selectedIds.length} Selected)` },
        ],
        required: true
    },
    { name: "subject", label: "Transmission Line (Subject)", placeholder: "Enter email subject...", required: true, fullWidth: true },
    { name: "message", label: "Core Intelligence (Message)", type: "textarea", placeholder: "Compose newsletter content...", required: true, fullWidth: true },
  ];

  const editFields = [
    { name: "email", label: "Email Address", type: "text", required: true },
    {
        name: "isActive",
        label: "Node Authorization",
        type: "select",
        options: [
            { value: "true", label: "ACTIVE NODE" },
            { value: "false", label: "TERMINATED" },
        ],
        required: true
    },
  ];

  const editSchema = z.object({
    email: z.string().email("Invalid email sequence."),
    isActive: z.enum(["true", "false"]),
  });

  const onUpdateNode = async (data) => {
    const toastId = toast.loading("Recalibrating Node data...");
    try {
        const res = await fetch(`/api/admin/subscribers/${editingItem._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                isActive: data.isActive === "true"
            })
        });
        const result = await res.json();
        if (result.success) {
            toast.success(result.message, { id: toastId });
            setIsEditModalOpen(false);
            fetchSubscribers();
        } else {
            toast.error(result.error, { id: toastId });
        }
    } catch (error) {
        toast.error("Calibration failure.", { id: toastId });
    }
  };

  const onSubmitCampaign = async (data) => {
    if (session?.role !== 'super-admin') {
        toast.error("Administrative Override Denied. Super-Admin clearance required.");
        return;
    }

    const toastId = toast.loading("Executing Campaign Sequence...");
    try {
        const res = await fetch("/api/admin/newsletter/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                selectedIds: data.recipients === 'selected' ? selectedIds : []
            })
        });
        const result = await res.json();
        if (result.success) {
            toast.success(result.message, { id: toastId });
            setIsModalOpen(false);
            fetchSubscribers();
            setSelectedIds([]);
        } else {
            toast.error(result.error || "Deployment failed.", { id: toastId });
        }
    } catch (error) {
        toast.error("Transmission breakdown: Network interference.", { id: toastId });
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 pb-20">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#101b2c] to-[#0b1422] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-emerald-400/[0.07] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.24em] text-emerald-300">Audience workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-white md:text-4xl">Newsletter subscribers</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Manage your audience, subscriber health and newsletter campaigns from one clear workspace.</p>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-slate-950/30 p-1">
                <button
                    onClick={() => setActiveTab("subscribers")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'subscribers' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    Subscribers
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    Campaign history
                </button>
             </div>

             <button
                onClick={() => {
                    if (session?.role !== 'super-admin') {
                        toast.error("Access Denied: Super Admin Authority Required");
                        return;
                    }
                    setIsModalOpen(true);
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-xs font-bold transition ${session?.role === 'super-admin' ? 'bg-emerald-300 text-slate-950 hover:bg-emerald-200' : 'bg-white/5 text-slate-600'}`}
             >
                <Zap className="w-4 h-4" />
                Create campaign
             </button>
        </div></div>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1727] sm:grid-cols-3">
          <AudienceStat icon={<Users className="size-4" />} label="Total audience" value={stats.total} />
          <AudienceStat icon={<UserCheck className="size-4" />} label="Active subscribers" value={stats.active} tone="emerald" />
          <AudienceStat icon={<UserX className="size-4" />} label="Unsubscribed" value={stats.inactive} tone="rose" last />
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
          {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-5 rounded-2xl border border-white/10 bg-[#111b2b]/95 px-5 py-4 shadow-2xl backdrop-blur-2xl"
              >
                  <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{selectedIds.length} selected</span>
                      <span className="text-[10px] text-slate-500">Choose a bulk action</span>
                  </div>

                  <div className="h-10 w-[1px] bg-muted" />

                  <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleBulkStatusUpdate(false)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                        title="Deactivate Selected"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBulkStatusUpdate(true)}
                        className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                        title="Reactivate Selected"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 rounded-xl bg-accent text-foreground font-black uppercase text-[10px] tracking-widest hover:bg-accent shadow-lg shadow-accent/20 transition-all"
                      >
                         Send campaign
                      </button>
                      <button
                        onClick={() => setSelectedIds([])}
                        className="p-3 rounded-xl text-muted-foreground hover:text-foreground transition-all uppercase text-[9px] font-black"
                      >
                         Clear
                      </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
              {["all", "active", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setFilterStatus(status); setPage(1); }}
                    className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        filterStatus === status
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {status}
                  </button>
              ))}
          </div>

          <div className="relative w-full sm:w-64 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search email address..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0d1727] py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-emerald-400/35"
              />
          </div>
      </div>

      {activeTab === 'subscribers' ? (
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]">
            {loading && (
                <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <RefreshCcw className="w-8 h-8 text-accent/20" />
                    </motion.div>
                </div>
            )}
            <div className="flex items-center border-b border-white/[0.07] px-5 py-4"><button onClick={() => handleSelectAll(selectedIds.length !== subscribers.length)} className="mr-4 text-slate-500">{selectedIds.length === subscribers.length && subscribers.length > 0 ? <CheckSquare className="size-4 text-emerald-300" /> : <Square className="size-4" />}</button><span className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Audience directory</span></div>
            <div className="divide-y divide-white/[0.055]">{subscribers.map((item) => <SubscriberRow key={item._id} item={item} selected={selectedIds.includes(item._id)} onSelect={() => handleSelectOne(item._id, !selectedIds.includes(item._id))} onView={() => setViewingItem(item)} onEdit={() => { setEditingItem(item); setIsEditModalOpen(true); }} onDelete={() => { setDeletingId(item._id); setIsConfirmOpen(true); }} />)}</div>
            {!loading && subscribers.length === 0 && <div className="grid min-h-72 place-items-center text-center"><div><Mail className="mx-auto size-9 text-slate-700"/><p className="mt-4 text-sm text-slate-400">No subscribers found</p></div></div>}
            {totalPages > 1 && <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-4"><p className="text-xs text-slate-500">Page {page} of {totalPages}</p><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] disabled:opacity-30"><ChevronLeft className="size-4" /></button><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="grid size-9 place-items-center rounded-lg border border-white/[0.08] disabled:opacity-30"><ChevronRight className="size-4" /></button></div></div>}
        </div>
      ) : (
        <DataTable
            title="Campaign history"
            columns={logColumns}
            data={logs}
            searchPlaceholder="Search campaigns..."
            isLoading={loadingLogs}
        />
      )}

      <AnimatePresence>
        {isModalOpen && (
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Intelligence Deployment CLI"
            schema={newsletterSchema}
            onSubmit={onSubmitCampaign}
            fields={newsletterFields}
            defaultValues={{
                type: 'manual',
                recipients: selectedIds.length > 0 ? 'selected' : 'all',
                subject: '',
                message: ''
            }}
          />
        )}

        {isEditModalOpen && (
            <FormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Node Calibration"
                schema={editSchema}
                onSubmit={onUpdateNode}
                fields={editFields}
                defaultValues={{
                    email: editingItem?.email,
                    isActive: editingItem?.isActive ? "true" : "false"
                }}
            />
        )}

        {viewingItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setViewingItem(null)}
                    className="absolute inset-0 bg-overlay/80 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-background border border-border rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={() => setViewingItem(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Node Metadata</h3>
                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: {viewingItem._id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Email Identity" value={viewingItem.email} />
                            <DetailItem label="Authorization" value={viewingItem.isActive ? "ACTIVE" : "TERMINATED"} />
                            <DetailItem label="Inception" value={format(new Date(viewingItem.subscribedAt), "PPP")} />
                            <DetailItem label="Last Pulse" value={viewingItem.lastSent ? format(new Date(viewingItem.lastSent), "PPP HH:mm") : "NONE"} />
                        </div>

                        <div className="p-4 bg-muted/50 border border-border/70 rounded-2xl">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Internal Analytics</span>
                            <p className="text-xs text-muted-foreground/70 leading-relaxed italic">
                                This node was registered via the {viewingItem.email.includes("gmail") ? "Google" : "External"} SMTP relay.
                                Intelligence feeds are dispatched on a monthly cycle.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onConfirm={async () => {
            const res = await fetch(`/api/admin/subscribers/${deletingId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Subscriber deleted successfully.");
                fetchSubscribers();
                setIsConfirmOpen(false);
            }
        }}
        onCancel={() => setIsConfirmOpen(false)}
        title="Delete Intelligence Node?"
        message="This will permanently delete the subscriber record and its associated data from the system. This action is irreversible."
      />
    </div>
  );
}

function SubscriberRow({ item, selected, onSelect, onView, onEdit, onDelete }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`group grid items-center gap-4 px-5 py-4 transition hover:bg-emerald-400/[0.025] sm:grid-cols-[auto_minmax(220px,1fr)_140px_150px_auto] ${!item.isActive ? 'opacity-60' : ''}`}>
            <button onClick={onSelect} className="text-slate-600">{selected ? <CheckSquare className="size-4 text-emerald-300" /> : <Square className="size-4" />}</button>
            <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Mail className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{item.email}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">Subscriber · {item._id.slice(-6)}</p></div></div>
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Status</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${item.isActive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{item.isActive ? 'Active' : 'Unsubscribed'}</span></div>
            <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Joined</p><p className="mt-1 text-xs text-slate-400">{item.subscribedAt ? format(new Date(item.subscribedAt), "MMM d, yyyy") : "Unknown"}</p></div>
            <div className="flex items-center justify-end gap-1"><button onClick={onView} title="View details" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white"><Eye className="size-3.5" /></button><button onClick={onEdit} title="Edit subscriber" className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-white"><Pencil className="size-3.5" /></button><button onClick={onDelete} title="Delete subscriber" className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button></div>
        </motion.div>
    );
}

function AudienceStat({ icon, label, value, tone = "sky", last = false }) {
    const colors = { sky: "text-sky-300 bg-sky-400/10", emerald: "text-emerald-300 bg-emerald-400/10", rose: "text-rose-300 bg-rose-400/10" };
    return <div className={`flex items-center gap-4 p-5 sm:p-6 ${!last ? 'border-b border-white/[0.07] sm:border-b-0 sm:border-r' : ''}`}><span className={`grid size-10 place-items-center rounded-xl ${colors[tone]}`}>{icon}</span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value ?? 0}</p></div></div>;
}

function DetailItem({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
            <span className="text-[13px] font-bold text-foreground tracking-tight">{value}</span>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    const colorMap = {
        blue: "text-accent bg-accent/10 border-accent/20 shadow-accent/5",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border ${colorMap[color]} shadow-2xl flex items-center gap-6`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-foreground">{value}</h3>
            </div>
        </motion.div>
    );
}
