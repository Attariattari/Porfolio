"use client";

import { Bell, Search, User, LogOut, ExternalLink, Settings, X, Check, Trash2, ShieldCheck, Mail, Cpu, UserCheck, MessageSquare, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import useAdminStore from "@/lib/store/adminStore";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatName } from "@/lib/utils";

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [session, setSession] = useState(null);
  const {
    notifications,
    fetchNotifications,
    updateNotification,
    deleteNotification,
    toggleSidebar,
  } = useAdminStore();
  const dropdownRef = useRef(null);
  const displayName = session?.name
    ? formatName(session.name)
    : "Admin";
  const isSuperAdmin = ["super-admin", "root-super-admin"].includes(session?.role);

  useEffect(() => {
    let cancelled = false;

    const refreshAdminState = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await res.json();
        if (!cancelled) setSession(data);
      } catch {
        // Keep the current UI and retry on the next poll.
      }

      if (!cancelled) fetchNotifications();
    };

    refreshAdminState();
    const interval = setInterval(refreshAdminState, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === "unread").length,
    [notifications],
  );
  const latestNotifications = useMemo(
    () => notifications.slice(0, 10),
    [notifications],
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      
      // Module Keywords Mapping for Quick Navigation
      const modules = {
        "dashboard": "/admin/dashboard",
        "blog": "/admin/blogs",
        "blogs": "/admin/blogs",
        "project": "/admin/projects",
        "projects": "/admin/projects",
        "service": "/admin/services",
        "services": "/admin/services",
        "about": "/admin/about",
        "resume": "/admin/resume",
        "skill": "/admin/skills",
        "skills": "/admin/skills",
        "message": "/admin/messages",
        "messages": "/admin/messages",
        "analytics": "/admin/analytics",
        "setting": "/admin/settings",
        "settings": "/admin/settings",
        "user": "/admin/users",
        "users": "/admin/users",
        "notification": "/admin/notifications",
        "notifications": "/admin/notifications",
        "hero": "/admin/hero",
        "social": "/admin/social-links",
        "booking": "/admin/bookings",
        "subscriber": "/admin/subscribers",
      };

      if (modules[query]) {
        router.push(modules[query]);
        setSearchQuery(""); // Clear search on direct nav
        return;
      }

      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2.5 hover:bg-muted/60 rounded-xl text-muted-foreground hover:text-foreground transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2.5 bg-muted/45 border border-border/70 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all w-64 lg:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 mr-4 border-r border-border/70 pr-4">
          <Link
            href="/"
            target="_blank"
            className="p-2.5 hover:bg-muted/60 rounded-xl text-muted-foreground hover:text-accent transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden lg:inline">Live Site</span>
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 hover:bg-muted/60 rounded-xl transition-all ${showNotifications ? "bg-muted/60 text-accent shadow-xl" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-accent text-[9px] font-black text-accent-foreground rounded-full border-2 border-background flex items-center justify-center animate-bounce shadow-xl">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed left-4 right-4 top-24 z-50 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card shadow-2xl backdrop-blur-3xl md:absolute md:left-auto md:right-0 md:top-auto md:mt-4 md:w-[450px]"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic italic-tighter">
                    System Activity
                  </h3>
                  <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md font-black uppercase tracking-widest border border-blue-500/20">
                    {unreadCount} Notifications
                  </span>
                </div>

                <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                  {latestNotifications.length > 0 ? (
                    latestNotifications.map((n) => {
                      const Icon =
                        n.type === "USER_REQUEST"
                          ? UserCheck
                          : n.type === "MESSAGE"
                            ? MessageSquare
                            : Cpu;
                      const isUnread = n.status === "unread";

                      return (
                        <div
                          key={n.id}
                          className={`p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group ${isUnread ? "bg-blue-500/[0.03]" : ""}`}
                        >
                          <div className="flex gap-4">
                            <div
                              className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white/5 flex-shrink-0 transition-transform ${isUnread ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-slate-500/5 text-slate-600"}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4 mb-1">
                                <h4
                                  className={`text-xs font-bold truncate ${isUnread ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                  {n.title}
                                </h4>
                                <span className="text-[9px] text-slate-600 font-bold whitespace-nowrap uppercase tracking-tighter">
                                  {formatDistanceToNow(new Date(n.createdAt))}{" "}
                                  ago
                                </span>
                              </div>
                              <p
                                className={`text-[11px] leading-relaxed truncate-2-lines ${isUnread ? "text-slate-300" : "text-slate-600 opacity-60"}`}
                              >
                                {n.message}
                              </p>

                              <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {isUnread && (
                                    <button
                                      onClick={() =>
                                        updateNotification(n.id, "read")
                                      }
                                      className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                      <Check className="w-3 h-3" /> Mark as Read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(n.id)}
                                    className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                {n.type === "USER_REQUEST" && (
                                  <Link
                                    href="/admin/users"
                                    className="text-[9px] font-black uppercase tracking-widest text-white hover:text-blue-500 ml-auto"
                                    onClick={() => setShowNotifications(false)}
                                  >
                                    Authorize →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-16 text-center text-slate-600 italic">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Authority Status Normal
                      </p>
                      <p className="text-[10px] opacity-50 mt-1 uppercase">
                        No security events recorded
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/notifications"
                  className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-white bg-blue-600/10 hover:bg-blue-600 transition-all border-t border-white/5 active:scale-95"
                  onClick={() => setShowNotifications(false)}
                >
                  View Activity Log
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/admin/settings"
          className="p-2.5 hover:bg-white/5 rounded-xl text-slate-500 hover:text-foreground transition-all"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">
              {displayName}
              {isSuperAdmin && <span className="text-accent"> (Super Admin)</span>}
            </span>
            <span className="max-w-64 truncate text-[10px] font-medium text-muted-foreground">
              {session?.email || "Synchronizing..."}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 p-0.5 shadow-xl shadow-blue-500/20 group hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] bg-background">
              {session?.avatar ? (
                <Image
                  src={session.avatar}
                  alt={`Muhyo Tech administrator ${displayName}`}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
