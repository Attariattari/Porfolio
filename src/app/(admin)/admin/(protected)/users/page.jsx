"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3,
  Loader2, Mail, RefreshCw, Search, Settings2, Shield, ShieldCheck,
  Sparkles, Trash2, UserCheck, Users, UserX, X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import useAdminStore from "@/lib/store/adminStore";
import { formatName } from "@/lib/utils";

const permissionModules = [
  { id: "projects", label: "Projects", description: "Portfolio case studies", actions: ["create", "edit", "delete"] },
  { id: "services", label: "Services", description: "Service catalogue", actions: ["create", "edit", "delete"] },
  { id: "blogs", label: "Articles", description: "Blog and publishing", actions: ["create", "edit", "delete"] },
  { id: "skills", label: "Skills", description: "Expertise library", actions: ["create", "edit", "delete"] },
  { id: "about", label: "About", description: "Profile information", actions: ["edit"] },
  { id: "resume", label: "Resume", description: "Career information", actions: ["edit"] },
];

const defaultPermissions = Object.fromEntries(permissionModules.map(({ id, actions }) => [id, Object.fromEntries(actions.map((action) => [action, false]))]));

const statusMeta = {
  approved: { label: "Active", Icon: CheckCircle2, classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" },
  pending: { label: "Pending", Icon: Clock3, classes: "border-amber-500/20 bg-amber-500/10 text-amber-500" },
  denied: { label: "Denied", Icon: UserX, classes: "border-red-500/20 bg-red-500/10 text-red-500" },
  removed: { label: "Removed", Icon: Trash2, classes: "border-slate-500/20 bg-slate-500/10 text-slate-500" },
};

function initials(user) {
  const source = user.name?.trim() || user.email || "U";
  return source.split(/[\s@]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function UserAvatar({ user }) {
  const [failed, setFailed] = useState(false);
  const avatar = user.avatar || user.profileImage || user.picture || "";

  if (!avatar || failed) {
    return <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white shadow-md shadow-violet-500/15">{initials(user)}</div>;
  }

  return <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted shadow-md shadow-violet-500/10">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={avatar} alt={`${user.name || "User"} profile`} className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  </div>;
}

function roleLabel(role) {
  if (role === "root-super-admin") return "Root administrator";
  if (role === "super-admin") return "Super administrator";
  if (role === "admin") return "Administrator";
  return "Team member";
}

function PermissionsPanel({ user, actorRole, onClose, onUpdate }) {
  const [role, setRole] = useState(user?.role || "admin");
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState(() => Object.fromEntries(
    permissionModules.map(({ id }) => [id, { ...defaultPermissions[id], ...(user?.permissions?.[id] || {}) }])
  ));
  const roles = actorRole === "root-super-admin" ? ["super-admin", "admin", "user"] : ["admin", "user"];
  const enabledCount = Object.values(permissions).reduce((total, actions) => total + Object.values(actions).filter(Boolean).length, 0);

  const toggle = (module, action) => setPermissions((current) => ({
    ...current, [module]: { ...current[module], [action]: !current[module][action] },
  }));

  const save = async () => {
    setSaving(true);
    const result = await onUpdate(user.email, role, permissions);
    setSaving(false);
    if (result.success) onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
      <motion.aside initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 260 }} onMouseDown={(event) => event.stopPropagation()} className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between border-b border-border/70 p-6 md:p-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500"><Shield className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-500">Access management</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Role & permissions</h2><p className="mt-1 text-sm text-muted-foreground">{user.email}</p></div>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
          <section>
            <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold text-foreground">Account role</h3><p className="text-xs text-muted-foreground">Choose the user’s level of responsibility.</p></div></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {roles.map((item) => <button key={item} onClick={() => setRole(item)} className={`rounded-2xl border p-4 text-left transition ${role === item ? "border-violet-500 bg-violet-500/10 ring-4 ring-violet-500/10" : "border-border bg-background/40 hover:bg-muted/40"}`}><div className="mb-3 flex items-center justify-between"><ShieldCheck className={`h-5 w-5 ${role === item ? "text-violet-500" : "text-muted-foreground"}`} />{role === item && <Check className="h-4 w-4 text-violet-500" />}</div><p className="text-sm font-bold capitalize text-foreground">{item.replaceAll("-", " ")}</p></button>)}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between"><div><h3 className="text-sm font-bold text-foreground">Content permissions</h3><p className="text-xs text-muted-foreground">Enable only the actions this user needs.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{enabledCount} enabled</span></div>
            <div className="space-y-3">
              {permissionModules.map((module) => <div key={module.id} className="rounded-2xl border border-border/70 bg-background/35 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-foreground">{module.label}</p><p className="text-xs text-muted-foreground">{module.description}</p></div><div className="flex flex-wrap gap-2">{module.actions.map((action) => { const enabled = permissions[module.id]?.[action]; return <button key={action} onClick={() => toggle(module.id, action)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${enabled ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}><span className={`flex h-4 w-4 items-center justify-center rounded ${enabled ? "bg-emerald-500 text-white" : "border border-border"}`}>{enabled && <Check className="h-3 w-3" />}</span>{action}</button>; })}</div></div></div>)}
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border/70 bg-background/30 p-5 md:px-8"><p className="hidden text-xs text-muted-foreground sm:block">Changes apply immediately after saving.</p><div className="ml-auto flex gap-3"><button onClick={onClose} className="h-11 rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:bg-muted">Cancel</button><button onClick={save} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Save access</button></div></footer>
      </motion.aside>
    </motion.div>
  );
}

export default function UserManagementPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const rowRefs = useRef({});
  const { users = [], fetchUsers, updateUserStatus, updateUserPermissions } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => { fetch("/api/admin/me").then((response) => response.json()).then(setSession); }, []);
  useEffect(() => {
    let active = true;
    fetchUsers().finally(() => active && setLoading(false));
    const interval = window.setInterval(() => { if (document.visibilityState === "visible") fetchUsers(); }, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, [fetchUsers]);
  useEffect(() => {
    if (!highlightId || !users.length) return;
    const timer = window.setTimeout(() => rowRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    return () => window.clearTimeout(timer);
  }, [highlightId, users]);

  const counts = useMemo(() => ({
    all: users.length,
    approved: users.filter((user) => user.status === "approved").length,
    pending: users.filter((user) => user.status === "pending").length,
    admin: users.filter((user) => ["admin", "super-admin", "root-super-admin"].includes(user.role)).length,
  }), [users]);
  const filteredUsers = useMemo(() => users.filter((user) => {
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || `${user.name || ""} ${user.email || ""} ${user.role || ""}`.toLowerCase().includes(needle);
    return matchesSearch && (statusFilter === "all" || user.status === statusFilter);
  }), [search, statusFilter, users]);

  const handleAction = async (email, action) => {
    await updateUserStatus(email, action);
    toast.success(action === "approve" ? "User account is now active." : action === "deny" ? "Access request denied." : "User removed from active access.");
  };
  const refresh = async () => { setRefreshing(true); await fetchUsers(); setRefreshing(false); };

  if (loading) return <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-border/70 bg-card/40"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Loader2 className="h-6 w-6 animate-spin" /></div><p className="text-sm font-semibold text-foreground">Loading users</p><p className="mt-1 text-xs text-muted-foreground">Preparing your team directory…</p></div>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/20"><Users className="h-6 w-6" /></div><div><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-violet-500"><Sparkles className="h-3.5 w-3.5" /> Team workspace</div><h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Users & access</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review new requests, manage active accounts and control who can update portfolio content.</p></div></div>
          <button onClick={refresh} disabled={refreshing} className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh users</button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total users", value: counts.all, note: "All registered accounts", Icon: Users, color: "text-blue-500 bg-blue-500/10" }, { label: "Active", value: counts.approved, note: "Can access the workspace", Icon: UserCheck, color: "text-emerald-500 bg-emerald-500/10" }, { label: "Pending review", value: counts.pending, note: "Waiting for approval", Icon: Clock3, color: "text-amber-500 bg-amber-500/10" }, { label: "Administrators", value: counts.admin, note: "Elevated access", Icon: ShieldCheck, color: "text-violet-500 bg-violet-500/10" }].map(({ label, value, note, Icon, color }) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold leading-none text-foreground">{value}</p><p className="mt-1 text-sm font-semibold text-foreground">{label}</p><p className="text-xs text-muted-foreground">{note}</p></div></div>)}
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1 xl:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email or role…" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}</div>
          <div className="flex gap-2 overflow-x-auto">{["all", "pending", "approved", "denied", "removed"].map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold capitalize transition ${statusFilter === status ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground hover:text-foreground"}`}>{status === "approved" ? "Active" : status}{status === "pending" && counts.pending > 0 && <span className="ml-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">{counts.pending}</span>}</button>)}</div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold text-foreground">Team directory</h2><p className="text-sm text-muted-foreground">Showing {filteredUsers.length} of {users.length} users</p></div></div>
        <AnimatePresence mode="popLayout">
          {!filteredUsers.length ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/40 px-6 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><AlertCircle className="h-7 w-7" /></div><h3 className="text-lg font-bold text-foreground">No users found</h3><p className="mt-1 text-sm text-muted-foreground">Try changing your search or account-status filter.</p></motion.div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredUsers.map((user, index) => {
            const id = user._id || user.email; const meta = statusMeta[user.status] || statusMeta.pending; const StatusIcon = meta.Icon; const isRoot = user.role === "root-super-admin"; const highlighted = highlightId === user._id;
            return <motion.article key={id} ref={(element) => { if (user._id) rowRefs.current[user._id] = element; }} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ delay: Math.min(index * .025, .15) }} className={`group relative overflow-hidden rounded-[1.6rem] border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${highlighted ? "border-violet-500 ring-4 ring-violet-500/10" : "border-border/70"}`}>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><UserAvatar user={user} /><div className="min-w-0"><h3 className="truncate text-base font-bold text-foreground">{user.name ? formatName(user.name) : "Unnamed user"}</h3><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.classes}`}><StatusIcon className="h-3 w-3" />{meta.label}</span></div>
              <div className="my-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</p><p className="mt-1 truncate text-xs font-semibold text-foreground">{roleLabel(user.role)}</p></div><div className="rounded-xl bg-muted/45 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Joined</p><p className="mt-1 text-xs font-semibold text-foreground">{user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "Not available"}</p></div></div>
              {user.createdAt && <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</div>}
              <div className="flex items-center gap-2 border-t border-border/70 pt-4">{isRoot ? <div className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 text-xs font-bold text-amber-500"><ShieldCheck className="h-4 w-4" /> Protected root account</div> : <>{user.status === "pending" && <><button onClick={() => handleAction(user.email, "approve")} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-xs font-bold text-white transition hover:bg-emerald-600"><UserCheck className="h-4 w-4" /> Approve</button><button onClick={() => handleAction(user.email, "deny")} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"><UserX className="h-4 w-4" /> Deny</button></>}{user.status === "approved" && <button onClick={() => setSelectedUser(user)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-bold text-background transition hover:opacity-90"><Settings2 className="h-4 w-4" /> Manage access <ChevronRight className="h-3.5 w-3.5" /></button>}{user.status !== "pending" && <button onClick={() => handleAction(user.email, user.status === "removed" ? "approve" : "remove")} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${user.status === "removed" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : "border-border text-muted-foreground hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"}`} title={user.status === "removed" ? "Restore user" : "Remove user"}>{user.status === "removed" ? <RefreshCw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}</button>}</>}</div>
            </motion.article>;
          })}</div>}
        </AnimatePresence>
      </section>

      <AnimatePresence>{selectedUser && <PermissionsPanel user={selectedUser} actorRole={session?.role} onClose={() => setSelectedUser(null)} onUpdate={updateUserPermissions} />}</AnimatePresence>
    </main>
  );
}
