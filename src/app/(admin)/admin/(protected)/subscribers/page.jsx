"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, Send, Filter, Users, UserCheck, UserX, CheckSquare, Square, MoreHorizontal, ShieldAlert, Zap, Loader2, RefreshCcw } from "lucide-react";
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
                <span className="text-white font-bold tracking-tight">{format(new Date(item.sentAt), "MMM d, HH:mm")}</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">{format(new Date(item.sentAt), "yyyy-MM-dd")}</span>
            </div>
        )
    },
    {
        key: "type",
        label: "Content Class",
        render: (item) => (
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.15em] border ${
                item.type === 'manual' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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
                <span className="text-white font-medium truncate">{item.subject}</span>
                {item.contentSummary && <span className="text-[9px] text-slate-500 truncate mt-1 italic">&ldquo;{item.contentSummary}&rdquo;</span>}
            </div>
        )
    },
    {
        key: "sentToCount",
        label: "Target Nodes",
        render: (item) => (
            <span className="text-[12px] font-black italic tracking-tighter text-white">{item.sentToCount}</span>
        )
    },
    {
        key: "results",
        label: "Success / Failure",
        render: (item) => (
            <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">{item.successCount}</span>
                <span className="text-slate-600">/</span>
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
            if (currentType === "manual") return <p className="text-[10px] text-slate-500 italic mt-2">Custom message mode: No source required.</p>;
            
            // Handle loading content options
            if (currentType !== contentType) {
                setContentType(currentType);
                fetchContentOptions(currentType);
            }

            return (
                <select 
                    {...register("targetId")}
                    className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent font-medium mt-1"
                >
                    <option value="">Select specific entry...</option>
                    {contentOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0a0f1c]">{opt.label}</option>)}
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
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Newsletter <span className="text-accent underline decoration-accent/20 underline-offset-8">Hub</span>
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 mt-2 md:mt-4 font-medium tracking-tight uppercase tracking-widest">
            Manage the global audience core and deploy multi-tier intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 mr-4">
                <button 
                    onClick={() => setActiveTab("subscribers")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'subscribers' ? 'bg-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    Active Nodes
                </button>
                <button 
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-accent text-black' : 'text-slate-500 hover:text-white'}`}
                >
                    Campaign Logs
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
                className={`flex items-center gap-2 px-6 py-3 ${session?.role === 'super-admin' ? 'bg-blue-600' : 'bg-slate-800 opacity-50'} text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95 whitespace-nowrap`}
             >
                <Zap className="w-4 h-4" />
                Launch Campaign
             </button>
        </div>
      </div>

      {/* Stats Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users className="w-5 h-5" />} label="Network Reach" value={stats.total} color="blue" />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Validated Nodes" value={stats.active} color="emerald" />
          <StatCard icon={<UserX className="w-5 h-5" />} label="Ghost Origins" value={stats.inactive} color="red" />
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
          {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-[#0a0f1c]/90 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-8"
              >
                  <div className="flex flex-col">
                      <span className="text-accent text-[11px] font-black uppercase tracking-widest">Action Required</span>
                      <span className="text-white text-[10px] font-bold opacity-60 uppercase">{selectedIds.length} Nodes Selected</span>
                  </div>
                  
                  <div className="h-10 w-[1px] bg-white/10" />

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
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                      >
                         Deploy Intelligence
                      </button>
                      <button 
                        onClick={() => setSelectedIds([])}
                        className="p-3 rounded-xl text-slate-500 hover:text-white transition-all uppercase text-[9px] font-black"
                      >
                         Clear
                      </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
              {["all", "active", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setFilterStatus(status); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
                        filterStatus === status 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
              ))}
          </div>
          
          <div className="relative w-full sm:w-64 group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="text"
                placeholder="PROBE NODES..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-accent/40"
              />
          </div>
      </div>

      {activeTab === 'subscribers' ? (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 z-10 bg-[#0a0f1c]/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <RefreshCcw className="w-8 h-8 text-accent/20" />
                    </motion.div>
                </div>
            )}
            <DataTable
                title="Subscriber Records"
                columns={[
                    {
                        key: "select",
                        label: (
                            <button onClick={() => handleSelectAll(selectedIds.length !== subscribers.length)}>
                                {selectedIds.length === subscribers.length && subscribers.length > 0 ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4" />}
                            </button>
                        ),
                        render: (item) => (
                            <button onClick={() => handleSelectOne(item._id, !selectedIds.includes(item._id))}>
                                {selectedIds.includes(item._id) ? <CheckSquare className="w-4 h-4 text-accent" /> : <Square className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" />}
                            </button>
                        )
                    },
                    { 
                        key: "email", 
                        label: "Subscriber Node",
                        render: (item) => (
                            <div className={`flex flex-col ${!item.isActive ? 'opacity-40 grayscale' : ''}`}>
                                <span className="font-bold text-white tracking-tight">{item.email}</span>
                                <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">ID: {item._id.slice(-6)}</span>
                            </div>
                        )
                    },
                    {
                      key: "isActive",
                      label: "Node Status",
                      render: (item) => (
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.15em] border ${
                          item.isActive 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {item.isActive ? 'Active Node' : 'Terminated'}
                        </span>
                      ),
                    },
                    {
                      key: "lastSent",
                      label: "Last Pulse",
                      render: (item) => (
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {item.lastSent ? format(new Date(item.lastSent), "MMM d, HH:mm") : "NEVER"}
                        </span>
                      ),
                    },
                    {
                      key: "subscribedAt",
                      label: "Inception",
                      render: (item) => (
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {item.subscribedAt ? format(new Date(item.subscribedAt), "MMM d, yyyy") : "N/A"}
                        </span>
                      ),
                    },
                ]}
                data={subscribers}
                onDelete={(item) => {
                    setDeletingId(item._id);
                    setIsConfirmOpen(true);
                }}
                onEdit={(item) => {
                    setEditingItem(item);
                    setIsEditModalOpen(true);
                }}
                onView={(item) => setViewingItem(item)}
                searchPlaceholder="Locate email node..."
                totalCount={stats.total}
                onPageChange={setPage}
                onSearchChange={setSearch}
                currentPage={page}
                itemsPerPage={limit}
                isLoading={loading}
            />
        </div>
      ) : (
        <DataTable
            title="Intelligence History (Campaign Logs)"
            columns={logColumns}
            data={logs}
            searchPlaceholder="Filter mission logs..."
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0a0f1c] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8">
                        <button onClick={() => setViewingItem(null)} className="text-slate-500 hover:text-white transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Node Metadata</h3>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">ID: {viewingItem._id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Email Identity" value={viewingItem.email} />
                            <DetailItem label="Authorization" value={viewingItem.isActive ? "ACTIVE" : "TERMINATED"} />
                            <DetailItem label="Inception" value={format(new Date(viewingItem.subscribedAt), "PPP")} />
                            <DetailItem label="Last Pulse" value={viewingItem.lastSent ? format(new Date(viewingItem.lastSent), "PPP HH:mm") : "NONE"} />
                        </div>
                        
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Internal Analytics</span>
                            <p className="text-xs text-white/60 leading-relaxed italic">
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

function DetailItem({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className="text-[13px] font-bold text-white tracking-tight">{value}</span>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    const colorMap = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
        red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/5"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl border ${colorMap[color]} shadow-2xl flex items-center gap-6`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{label}</p>
                <h3 className="text-3xl font-black italic tracking-tighter text-white">{value}</h3>
            </div>
        </motion.div>
    );
}
