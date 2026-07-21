"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronRight,
  Circle,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserRoundPlus,
  UserX,
  X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import useAdminStore from "@/lib/store/adminStore";

const filters = [
  { id: "all", label: "All notifications", icon: Inbox },
  { id: "unread", label: "Unread", icon: BellRing },
  { id: "read", label: "Read", icon: CheckCheck },
  { id: "user_requests", label: "Access requests", icon: UserRoundPlus },
  { id: "MESSAGE", label: "Messages", icon: Mail },
  { id: "SYSTEM", label: "System", icon: ShieldCheck },
];

function getNotificationMeta(type = "") {
  const normalized = type.toUpperCase();
  if (normalized.includes("USER") || normalized.includes("REQUEST") || normalized.includes("VERIFY")) {
    return { label: "Access", Icon: UserRoundPlus, tone: "violet" };
  }
  if (normalized.includes("MESSAGE")) return { label: "Message", Icon: Mail, tone: "emerald" };
  return { label: "System", Icon: ShieldCheck, tone: "amber" };
}

const tones = {
  violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, updateNotification, deleteNotification, updateUserStatus } = useAdminStore();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    await fetchNotifications();
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let active = true;
    fetchNotifications().finally(() => active && setLoading(false));
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchNotifications();
    }, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((item) => item.status === "unread").length;
  const readCount = notifications.length - unreadCount;
  const requestCount = notifications.filter((item) => item.type === "USER_REQUEST" && item.status === "unread").length;

  const filteredNotifications = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const filterMatches =
        filter === "all" ||
        (filter === "unread" && item.status === "unread") ||
        (filter === "read" && item.status !== "unread") ||
        (filter === "user_requests" && ["USER_REQUEST", "REVERIFY_REQUEST"].includes(item.type)) ||
        item.type === filter;
      const searchMatches = !needle || `${item.title || ""} ${item.message || ""} ${item.type || ""}`.toLowerCase().includes(needle);
      return filterMatches && searchMatches;
    });
  }, [filter, notifications, query]);

  const markAllRead = async () => {
    const unread = notifications.filter((item) => item.status === "unread");
    await Promise.all(unread.map((item) => updateNotification(item._id || item.id, "read")));
    toast.success(unread.length ? "All notifications marked as read." : "You are already all caught up.");
  };

  const handleAccess = async (notification, decision) => {
    const match = notification.message?.match(/\(([^)]+)\)/);
    const email = match ? match[1] : notification.message?.split(" ")[0];
    if (!email) return toast.error("User email could not be found.");
    await updateUserStatus(email, decision);
    toast.success(decision === "approve" ? "Access request approved." : "Access request denied.");
    refresh(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-border/70 bg-card/40">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-foreground">Loading notifications</p>
        <p className="mt-1 text-xs text-muted-foreground">Bringing your latest activity together…</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-card bg-blue-500" />}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Admin workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Notification center</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review account requests, messages and system activity. Unread updates stay highlighted until you review them.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => refresh()} disabled={refreshing} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={markAllRead} disabled={!unreadCount} className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unread", value: unreadCount, note: "Needs your attention", Icon: BellRing, style: "text-blue-500 bg-blue-500/10" },
          { label: "Read", value: readCount, note: "Already reviewed", Icon: CheckCheck, style: "text-emerald-500 bg-emerald-500/10" },
          { label: "Pending access", value: requestCount, note: "Requires a decision", Icon: UserRoundPlus, style: "text-violet-500 bg-violet-500/10" },
        ].map(({ label, value, note, Icon, style }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold leading-none text-foreground">{value}</p><p className="mt-1 text-sm font-semibold text-foreground">{label}</p><p className="text-xs text-muted-foreground">{note}</p></div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/70 p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
              {filters.map(({ id, label, icon: Icon }) => {
                const count = id === "all" ? notifications.length : id === "unread" ? unreadCount : id === "read" ? readCount : null;
                return <button key={id} onClick={() => setFilter(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${filter === id ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}{count !== null && <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${filter === id ? "bg-background/15" : "bg-muted"}`}>{count}</span>}</button>;
              })}
            </div>
            <div className="relative w-full xl:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications…" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10" />
              {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5">
          <AnimatePresence mode="popLayout">
            {!filteredNotifications.length ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Inbox className="h-7 w-7" /></div>
                <h2 className="text-lg font-bold text-foreground">No notifications found</h2>
                <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">Try another filter or clear your search. New updates will appear here automatically.</p>
              </motion.div>
            ) : filteredNotifications.map((notification, index) => {
              const id = notification._id || notification.id;
              const unread = notification.status === "unread";
              const pendingRequest = ["USER_REQUEST", "REVERIFY_REQUEST"].includes(notification.type) && unread;
              const { label, Icon, tone } = getNotificationMeta(notification.type);
              const createdAt = new Date(notification.createdAt);
              return (
                <motion.article key={id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ delay: Math.min(index * .025, .15) }} className={`group relative mb-3 overflow-hidden rounded-2xl border p-4 transition md:p-5 ${unread ? "border-blue-500/25 bg-blue-500/[0.055] shadow-sm" : "border-border/70 bg-background/35 hover:bg-muted/35"}`}>
                  {unread && <span className="absolute inset-y-0 left-0 w-1 bg-blue-500" />}
                  <div className="flex gap-3 md:gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tones[tone]} ${!unread ? "grayscale-[.35] opacity-70" : ""}`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className={`text-sm md:text-base ${unread ? "font-bold text-foreground" : "font-semibold text-foreground/75"}`}>{notification.title || "Notification"}</h2>
                            {unread ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-500"><Circle className="h-1.5 w-1.5 fill-current" /> Unread</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500"><Check className="h-3 w-3" /> Read</span>}
                            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>{label}</span>
                          </div>
                          <p className={`mt-2 max-w-3xl text-sm leading-6 ${unread ? "text-foreground/80" : "text-muted-foreground"}`}>{notification.message}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span title={format(createdAt, "PPpp")}>{formatDistanceToNow(createdAt, { addSuffix: true })}</span><span>•</span><span>{format(createdAt, "MMM d, yyyy · h:mm a")}</span></div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          {pendingRequest && <><button onClick={() => handleAccess(notification, "approve")} className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-500 px-3 text-xs font-bold text-white transition hover:bg-emerald-600"><UserCheck className="h-4 w-4" /> Approve</button><button onClick={() => handleAccess(notification, "deny")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 text-xs font-bold text-red-500 transition hover:bg-red-500 hover:text-white"><UserX className="h-4 w-4" /> Deny</button></>}
                          <button onClick={() => updateNotification(id, unread ? "read" : "unread")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-muted" title={unread ? "Mark as read" : "Mark as unread"}>{unread ? <Check className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}<span className="hidden sm:inline">{unread ? "Mark read" : "Mark unread"}</span></button>
                          <button onClick={() => deleteNotification(id)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500" title="Delete notification"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="mt-3 hidden h-4 w-4 text-muted-foreground/30 md:block" />
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
