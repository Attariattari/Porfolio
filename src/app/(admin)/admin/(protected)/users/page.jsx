"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useAdminStore from "@/lib/store/adminStore";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Filter, ShieldCheck, Mail, Calendar, UserCheck, UserX, Loader2, Trash2, ShieldAlert, AlertCircle, RefreshCw, Settings, Shield, X, Check, CheckSquare, Square, Zap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatName } from "@/lib/utils";

const PermissionsModal = ({ user, actorRole, onClose, onUpdate }) => {
    const defaultPermissions = {
        projects: { create: false, edit: false, delete: false },
        services: { create: false, edit: false, delete: false },
        blogs: { create: false, edit: false, delete: false },
        skills: { create: false, edit: false, delete: false },
        about: { edit: false },
        resume: { edit: false }
    };

    // Robust merge: ensures every nested field exists in local state
    const [permissions, setPermissions] = useState(() => {
        const merged = { ...defaultPermissions };
        if (user && user.permissions) {
            Object.keys(defaultPermissions).forEach(module => {
                if (user.permissions[module]) {
                    merged[module] = { ...defaultPermissions[module], ...user.permissions[module] };
                }
            });
        }
        return merged;
    });
    const [role, setRole] = useState(user?.role || "admin");
    const [isSaving, setIsSaving] = useState(false);

    // Check if actor is Root Admin to allow promotion to Super Admin
    const canPromoteToSuper = actorRole === 'root-super-admin';
    const availableRoles = canPromoteToSuper ? ['super-admin', 'admin', 'user'] : ['admin', 'user'];

    const togglePermission = (module, action) => {
        setPermissions(prev => {
            const updated = JSON.parse(JSON.stringify(prev)); // Deep clone for force refresh
            updated[module][action] = !updated[module][action];
            console.log(`Toggling ${module}:${action} to ${updated[module][action]}`);
            return updated;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        console.log("Saving Permissions for", user.email, { role, permissions });
        const res = await onUpdate(user.email, role, permissions);
        setIsSaving(false);
        if (res.success) onClose();
    };

    const modules = [
        { id: 'projects', label: 'Projects', actions: ['create', 'edit', 'delete'] },
        { id: 'services', label: 'Services', actions: ['create', 'edit', 'delete'] },
        { id: 'blogs', label: 'Blogs', actions: ['create', 'edit', 'delete'] },
        { id: 'skills', label: 'Skills', actions: ['create', 'edit', 'delete'] },
        { id: 'about', label: 'About', actions: ['edit'] },
        { id: 'resume', label: 'Resume', actions: ['edit'] },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-overlay/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-card border border-border w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-border/70 flex items-center justify-between bg-card/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-xl">
                            <Shield className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-foreground leading-none mb-1">Calibrate <span className="text-accent">Authority</span></h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Role Selection */}
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Functional Role</p>
                        <div className="flex flex-wrap gap-4">
                            {availableRoles.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 min-w-[120px] p-4 rounded-2xl border transition-all text-center uppercase text-[10px] font-black tracking-widest ${
                                        role === r
                                            ? (r === 'super-admin' ? 'bg-accent border-accent text-foreground' : 'bg-accent border-accent text-foreground')
                                            : 'bg-muted/50 border-border/70 text-muted-foreground hover:border-border'
                                    }`}
                                >
                                    {r === 'super-admin' ? '🛡️ Super Admin' : r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Action Permissions</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((mod) => (
                                <div key={mod.id} className="p-5 bg-card/50 border border-border/70 rounded-2xl">
                                    <h3 className="text-xs font-black uppercase text-foreground mb-4 tracking-wider border-b border-border/70 pb-2">{mod.label}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mod.actions.map(action => (
                                            <button
                                                key={action}
                                                onClick={() => togglePermission(mod.id, action)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
                                                    permissions[mod.id]?.[action]
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                    : 'bg-muted/50 border-border/70 text-muted-foreground/80 hover:text-muted-foreground'
                                                }`}
                                            >
                                                {permissions[mod.id]?.[action] ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border/70 bg-card/40 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-foreground transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-accent hover:bg-accent disabled:opacity-50 text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-accent/20 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Apply Authorization
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function UserManagementPage() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");
    const [highlightedItem, setHighlightedItem] = useState(null);
    const rowRefs = useRef({});

    const { users, fetchUsers, updateUserStatus, updateUserPermissions } = useAdminStore();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [session, setSession] = useState(null);

    useEffect(() => {
        fetch("/api/admin/me")
            .then(res => res.json())
            .then(data => setSession(data));
    }, []);

    useEffect(() => {
        const startTimer = window.setTimeout(() => {
          if (!highlightId || users.length === 0) return;
            setHighlightedItem(highlightId);

            const timer = setTimeout(() => {
                setHighlightedItem(null);
            }, 4000);

            setTimeout(() => {
                const element = rowRefs.current[highlightId];
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);

        }, 0);
        return () => window.clearTimeout(startTimer);
    }, [highlightId, users]);

    useEffect(() => {
        fetchUsers().then(() => setLoading(false));

        const interval = setInterval(fetchUsers, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredUsers = (users || []).filter(u => {
        if (!u || !u.email) return false;
        const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
                              (u.name && u.name.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = async (email, action) => {
        toast.promise(updateUserStatus(email, action), {
            loading: `Executing ${action} protocol...`,
            success: `Identity recalibrated: ${action}`,
            error: "Protocol failure."
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-12 h-12 text-accent animate-spin opacity-50 mb-6" />
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] animate-pulse">Syncing Muhyo Tech Records...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/70">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-2">
                        User <span className="text-accent">Directory</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-tight opacity-70">
                        Manage personnel roles and modular access authorizations.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => fetchUsers()} className="p-4 bg-muted/50 hover:bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="px-5 py-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-3">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-accent">Total Personnel</p>
                             <p className="text-xl font-bold text-foreground">{(users || []).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search identity map..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card/40 border border-border/70 p-4 pl-12 rounded-2xl text-foreground text-sm outline-none focus:border-accent/30 transition-all backdrop-blur-md"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'denied', 'removed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                statusFilter === status
                                ? 'bg-accent text-foreground border-accent'
                                : 'bg-card/40 text-muted-foreground border-border/70 hover:border-accent/30'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Data Display */}
            <div className="bg-card/40 backdrop-blur-3xl border border-border/70 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.length === 0 ? (
                        <div className="py-20 text-center">
                            <AlertCircle className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest">No matching personnel records</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-border">
                                {filteredUsers.map((u) => (
                                    <motion.div
                                        key={u._id || u.email}
                                        ref={(el) => (rowRefs.current[u._id] = el)}
                                        layout
                                        className={`p-6 space-y-4 transition-all duration-1000 relative ${
                                            highlightedItem === u._id
                                            ? "bg-accent/10 border-l-4 border-l-blue-600 shadow-inner"
                                            : "hover:bg-card/50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${highlightedItem === u._id ? "bg-accent text-foreground" : "bg-accent/10 border border-accent/20 text-accent"}`}>
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-black italic transition-all ${highlightedItem === u._id ? "text-accent scale-105 origin-left" : "text-foreground"}`}>{u.name ? formatName(u.name) : "Unknown Identity"}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase truncate max-w-[150px]">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                                u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                u.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {u.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Commissioned: {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>

                                            <div className="flex gap-2">
                                                {u.role === 'root-super-admin' ? (
                                                    <div className="text-[8px] font-black uppercase text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                                        <Zap className="w-3 h-3 fill-amber-500" /> Root Admin
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {u.role === 'super-admin' && (
                                                            <div className="text-[8px] font-black uppercase text-accent flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg border border-accent/20 mr-1">
                                                                <ShieldCheck className="w-3 h-3" /> Super
                                                            </div>
                                                        )}
                                                        {u.status === 'approved' && (
                                                            <button
                                                                onClick={() => { setSelectedUser(u); setIsPermissionsOpen(true); }}
                                                                className="p-2 bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-foreground transition-all"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </button>
                                                        ) }
                                                        {u.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleAction(u.email, 'approve')}
                                                                className="p-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg hover:bg-emerald-600 hover:text-foreground transition-all"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction(u.email, u.status === 'removed' ? 'approve' : 'remove')}
                                                            className={`p-2 border rounded-lg transition-all ${
                                                                u.status === 'removed' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600' : 'bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600'
                                                            }`}
                                                        >
                                                            {u.status === 'removed' ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/70 bg-card/50">
                                            <th className="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Personnel</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Commissioned</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.map((u) => (
                                            <motion.tr
                                                key={u._id || u.email}
                                                ref={(el) => (rowRefs.current[u._id] = el)}
                                                layout
                                                className={`transition-all duration-1000 group ${
                                                    highlightedItem === u._id
                                                    ? "bg-accent/10 shadow-inner"
                                                    : "hover:bg-card/50"
                                                }`}
                                            >
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${highlightedItem === u._id ? "bg-accent text-foreground scale-110 shadow-lg" : "bg-accent/10 border border-accent/20 text-accent"}`}>
                                                            <Mail className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-black italic transition-all ${highlightedItem === u._id ? "text-accent scale-105 origin-left" : "text-foreground"}`}>{u.name ? formatName(u.name) : "Unknown"}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold uppercase">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                                                        u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        u.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-xs font-bold text-muted-foreground">{u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {u.role === 'root-super-admin' ? (
                                                            <div className="text-[9px] font-black uppercase text-amber-500 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
                                                                <Zap className="w-4 h-4 fill-amber-500" /> Root Admin
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {u.role === 'super-admin' && (
                                                                    <div className="text-[9px] font-black uppercase text-accent flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
                                                                        <ShieldCheck className="w-4 h-4" /> Super Admin
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-2">
                                                                    {u.status === 'approved' && (
                                                                        <button
                                                                            onClick={() => { setSelectedUser(u); setIsPermissionsOpen(true); }}
                                                                            className="p-3 bg-accent/10 text-accent border border-accent/20 rounded-xl hover:bg-accent hover:text-foreground transition-all shadow-lg"
                                                                            title="Configure Permissions"
                                                                        >
                                                                            <Settings className="w-5 h-5" />
                                                                        </button>
                                                                    ) }
                                                                    {u.status === 'pending' && (
                                                                        <button
                                                                            onClick={() => handleAction(u.email, 'approve')}
                                                                            className="p-3 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-xl hover:bg-emerald-600 hover:text-foreground transition-all"
                                                                        >
                                                                            <UserCheck className="w-5 h-5" />
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleAction(u.email, u.status === 'removed' ? 'approve' : 'remove')}
                                                                        className={`p-3 border rounded-xl transition-all shadow-lg ${
                                                                            u.status === 'removed' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-foreground' : 'bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-foreground'
                                                                        }`}
                                                                    >
                                                                        {u.status === 'removed' ? <RefreshCw className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isPermissionsOpen && (
                    <PermissionsModal
                        user={selectedUser}
                        actorRole={session?.role}
                        onClose={() => setIsPermissionsOpen(false)}
                        onUpdate={updateUserPermissions}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
