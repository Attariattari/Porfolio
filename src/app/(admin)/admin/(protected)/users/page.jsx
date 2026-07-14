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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-white leading-none mb-1">Calibrate <span className="text-blue-500">Authority</span></h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Role Selection */}
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Functional Role</p>
                        <div className="flex flex-wrap gap-4">
                            {availableRoles.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 min-w-[120px] p-4 rounded-2xl border transition-all text-center uppercase text-[10px] font-black tracking-widest ${
                                        role === r 
                                            ? (r === 'super-admin' ? 'bg-accent border-accent text-white' : 'bg-blue-600 border-blue-500 text-white') 
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                    }`}
                                >
                                    {r === 'super-admin' ? '🛡️ Super Admin' : r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Action Permissions</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((mod) => (
                                <div key={mod.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <h3 className="text-xs font-black uppercase text-white mb-4 tracking-wider border-b border-white/5 pb-2">{mod.label}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {mod.actions.map(action => (
                                            <button
                                                key={action}
                                                onClick={() => togglePermission(mod.id, action)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${
                                                    permissions[mod.id]?.[action] 
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                                    : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
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
                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
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
             <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-50 mb-6" />
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] animate-pulse">Syncing Muhyo Tech Records...</p>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                        User <span className="text-blue-500">Directory</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium tracking-tight opacity-70">
                        Manage personnel roles and modular access authorizations.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => fetchUsers()} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="px-5 py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Total Personnel</p>
                             <p className="text-xl font-bold text-white">{(users || []).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search identity map..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0f172a]/40 border border-white/5 p-4 pl-12 rounded-2xl text-white text-sm outline-none focus:border-blue-500/30 transition-all backdrop-blur-md"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'denied', 'removed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                statusFilter === status 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-[#0f172a]/40 text-slate-500 border-white/5 hover:border-blue-500/30'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Data Display */}
            <div className="bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.length === 0 ? (
                        <div className="py-20 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No matching personnel records</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-white/5">
                                {filteredUsers.map((u) => (
                                    <motion.div 
                                        key={u._id || u.email}
                                        ref={(el) => (rowRefs.current[u._id] = el)}
                                        layout
                                        className={`p-6 space-y-4 transition-all duration-1000 relative ${
                                            highlightedItem === u._id 
                                            ? "bg-blue-600/10 border-l-4 border-l-blue-600 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                                            : "hover:bg-white/[0.02]"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${highlightedItem === u._id ? "bg-blue-600 text-white" : "bg-blue-500/10 border border-blue-500/20 text-blue-500"}`}>
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-black italic transition-all ${highlightedItem === u._id ? "text-blue-500 scale-105 origin-left" : "text-white"}`}>{u.name ? formatName(u.name) : "Unknown Identity"}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[150px]">{u.email}</p>
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
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commissioned: {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>
                                            
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
                                                                className="p-2 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                            </button>
                                                        ) }
                                                        {u.status === 'pending' && (
                                                            <button 
                                                                onClick={() => handleAction(u.email, 'approve')}
                                                                className="p-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
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
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Personnel</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Commissioned</th>
                                            <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.map((u) => (
                                            <motion.tr 
                                                key={u._id || u.email}
                                                ref={(el) => (rowRefs.current[u._id] = el)}
                                                layout
                                                className={`transition-all duration-1000 group ${
                                                    highlightedItem === u._id 
                                                    ? "bg-blue-600/10 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                                                    : "hover:bg-white/[0.02]"
                                                }`}
                                            >
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${highlightedItem === u._id ? "bg-blue-600 text-white scale-110 shadow-lg" : "bg-blue-500/10 border border-blue-500/20 text-blue-500"}`}>
                                                            <Mail className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-black italic transition-all ${highlightedItem === u._id ? "text-blue-500 scale-105 origin-left" : "text-white"}`}>{u.name ? formatName(u.name) : "Unknown"}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{u.email}</p>
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
                                                    <span className="text-xs font-bold text-slate-400">{u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>
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
                                                                            className="p-3 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                                                            title="Configure Permissions"
                                                                        >
                                                                            <Settings className="w-5 h-5" />
                                                                        </button>
                                                                    ) }
                                                                    {u.status === 'pending' && (
                                                                        <button 
                                                                            onClick={() => handleAction(u.email, 'approve')}
                                                                            className="p-3 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                                                        >
                                                                            <UserCheck className="w-5 h-5" />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleAction(u.email, u.status === 'removed' ? 'approve' : 'remove')}
                                                                        className={`p-3 border rounded-xl transition-all shadow-lg ${
                                                                            u.status === 'removed' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20 hover:bg-emerald-600 hover:text-white' : 'bg-red-600/10 text-red-500 border-red-600/20 hover:bg-red-600 hover:text-white'
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
