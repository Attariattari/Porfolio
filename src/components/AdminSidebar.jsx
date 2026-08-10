"use client";

import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Zap,
  Menu,
  X,
  BellRing,
  Braces,
  CalendarCheck,
  FolderKanban,
  IdCard,
  ListChecks,
  MailCheck,
  Newspaper,
  Share2,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  Wrench,
  Link2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_NAVIGATION_LINKS } from "@/lib/constants";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import {
  useBookingStats,
  useRealTimeBookingUpdates,
} from "@/app/(admin)/hooks/useBookings";
import {
  useMessageStats,
  useRealTimeMessageUpdates,
} from "@/app/(admin)/hooks/useMessages";
import NetworkIndicator from "./admin/NetworkIndicator";
import { formatName } from "@/lib/utils";

const ICON_MAP = {
  LayoutDashboard,
  MessageSquare,
  CalendarCheck,
  Sparkles,
  UserRound,
  Wrench,
  FolderKanban,
  Braces,
  Newspaper,
  Wand2,
  ListChecks,
  IdCard,
  MailCheck,
  Share2,
  BellRing,
  UsersRound,
  SlidersHorizontal,
  Link2,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const displayName = session?.name ? formatName(session.name) : "Admin";
  const isSuperAdmin = ["super-admin", "root-super-admin"].includes(session?.role);

  const {
    notifications,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
  } = useAdminStore();

  const { data: bookingStats } = useBookingStats();
  useRealTimeBookingUpdates();

  const {
    stats: messageStats,
    setStats: setMessageStats,
    refetch: refetchMessageStats,
  } = useMessageStats();
  useRealTimeMessageUpdates({
    onNewMessage: () => refetchMessageStats(),
    onStatusUpdate: () => refetchMessageStats(),
    onStatsUpdate: (newStats) => setMessageStats(newStats),
  });

  useEffect(() => {
    const handleResize = () => {
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobile = window.innerWidth < 1024 || mobileUserAgent;
      setIsMobile(mobile);
      document.documentElement.classList.toggle("admin-mobile-layout", mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.documentElement.classList.remove("admin-mobile-layout");
    };
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setSession(data));
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Secure Logout successful.");
        router.push("/admin/login");
      }
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const unreadLogCount = notifications.filter(
    (n) => n.status === "unread",
  ).length;

  const filteredLinks = ADMIN_NAVIGATION_LINKS.map((link) => {
    if (link.name === "Notifications") {
      return { ...link, badge: unreadLogCount > 0 ? unreadLogCount : null };
    }
    if (link.name === "Bookings" && bookingStats?.new > 0) {
      return { ...link, badge: bookingStats.new, badgeColor: "bg-amber-500" };
    }
    if (link.name === "Messages" && messageStats?.newMessages > 0) {
      return {
        ...link,
        badge: messageStats.newMessages,
        badgeColor: "bg-accent shadow-lg shadow-accent/20",
      };
    }
    return link;
  }).filter((link) => {
    // Role based visibility
    if (
      session?.role !== "super-admin" &&
      session?.role !== "root-super-admin"
    ) {
      // Hide these for Admin/User
      if (
        ["Subscribers", "Notifications", "Users", "Settings"].includes(
          link.name,
        )
      )
        return false;
      if (link.role === "super-admin" || link.role === "root-super-admin")
        return false;
    }
    return true;
  });

  const sidebarSections = [
    {
      label: "Main",
      links: filteredLinks.filter((l) => ["Dashboard"].includes(l.name)),
    },
    {
      label: "Management",
      links: filteredLinks.filter((l) =>
        [
          "Hero",
          "About",
          "Projects",
          "Services",
          "Blog",
          "Blogger Engine",
          "AI Blog Optimizer",
          "Editorial Planner",
          "Internal Links",
          "Skills",
          "Resume",
          "Social Links",
        ].includes(l.name),
      ),
    },
    {
      label: "Communication",
      links: filteredLinks.filter((l) =>
        ["Messages", "Bookings", "Subscribers"].includes(l.name),
      ),
    },
    {
      label: "System",
      links: filteredLinks.filter((l) =>
        ["Notifications", "Users", "Settings"].includes(l.name),
      ),
    },
  ].filter((section) => section.links.length > 0);

  // Determine current effective collapse state
  const isCollapsed = sidebarCollapsed && !isMobile;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-overlay/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          width: isMobile ? 288 : sidebarCollapsed ? 80 : 288,
          x: isMobile && !sidebarOpen ? -288 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="admin-sidebar-shell fixed left-0 top-0 z-[70] flex h-full flex-col border-r border-border/60 bg-background shadow-2xl"
      >
        {/* Desktop Collapse / Expand Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleSidebarCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden lg:flex absolute -right-3.5 top-6 z-[80] h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-lg hover:bg-accent hover:text-accent-foreground hover:scale-110 transition-all"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Inner Wrapper for content transition safety */}
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
          {/* Branding */}
          <div
            className="admin-sidebar-brand flex h-20 shrink-0 items-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-accent/5 to-transparent px-6"
          >
            <div className="flex items-center gap-3 min-w-max">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                <Zap className="h-6 w-6" />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="text-sm font-black uppercase italic leading-none tracking-widest text-foreground">
                    MUHYO
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground tracking-[0.3em] uppercase leading-none mt-1">
                    Control Center
                  </span>
                </motion.div>
              )}
            </div>

            {/* Mobile Close Button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar space-y-8">
            <div className={`px-4 mb-4 ${isCollapsed ? "hidden" : "block"}`}>
              <NetworkIndicator />
            </div>
            {sidebarSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {!isCollapsed && (
                  <h3 className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                    {section.label}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.links.map((link) => {
                    const IconComponent = ICON_MAP[link.icon] || Newspaper;
                    const isActive = pathname === link.href;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        title={isCollapsed ? link.name : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-accent/15 text-accent font-bold shadow-sm"
                            : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                        } ${isCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <IconComponent
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? "text-accent" : "text-muted-foreground"
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{link.name}</span>
                        )}

                        {/* Badges */}
                        {link.badge && (
                          <span
                            className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                              link.badgeColor || "bg-accent"
                            } ${isCollapsed ? "absolute top-1 right-1 h-3 min-w-3 px-0 text-[8px]" : ""}`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile & Logout Footer */}
          <div className="shrink-0 border-t border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs border border-accent/30">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-foreground truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize truncate">
                      {session?.role || "Admin"}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
