"use client";

import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Cpu,
  Code2,
  Users,
  User,
  Bell,
  Activity,
  Zap,
  Menu,
  X,
  Calendar,
  Layers,
  Phone,
  Mail,
  Newspaper,
  Target,
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
  Briefcase,
  Cpu,
  FileText,
  Code2,
  MessageSquare,
  Settings,
  Users,
  User,
  Bell,
  Activity,
  Calendar,
  Zap,
  Layers,
  Phone,
  Mail,
  Newspaper,
  Target,
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
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        badgeColor: "bg-blue-500 shadow-lg shadow-blue-500/20",
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
          "Skills",
          "Resume",
          "Goals",
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          width: isMobile ? 288 : sidebarCollapsed ? 80 : 288,
          x: isMobile && !sidebarOpen ? -288 : 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="fixed left-0 top-0 z-[70] flex h-full flex-col border-r border-border/60 bg-background shadow-2xl"
      >
        {/* Inner Wrapper for content transition safety */}
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative">
          {/* Branding */}
          <div
            className="flex h-20 shrink-0 items-center overflow-hidden border-b border-border/60 bg-gradient-to-br from-accent/5 to-transparent px-6"
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
                  <span className="text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase leading-none mt-1">
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
                  <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                    {section.label}
                  </h3>
                )}
                {isCollapsed && <div className="h-px bg-border mx-4 my-4" />}

                <div className="space-y-1">
                  {section.links.map((link) => {
                    const IconComponent = ICON_MAP[link.icon] || FileText;
                    const isActive = pathname === link.href;

                    return (
                      <SidebarItem
                        key={link.name}
                        href={link.href}
                        icon={IconComponent}
                        label={link.name}
                        active={isActive}
                        collapsed={isCollapsed}
                        badge={link.badge}
                        badgeColor={link.badgeColor}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-border/60 space-y-4 shrink-0 bg-card/35">
            <div
              className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-2"}`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-0.5 shadow-lg shadow-blue-500/20 shrink-0`}
              >
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[9px] bg-background">
                  {session?.avatar ? (
                    <Image
                      src={session.avatar}
                      alt={displayName}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">
                    {displayName}
                    {isSuperAdmin && <span className="text-accent"> (Super Admin)</span>}
                  </span>
                  <span className="truncate text-[10px] font-medium text-muted-foreground">
                    {session?.email || "Synchronizing..."}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  className="ml-auto p-2 text-muted-foreground hover:text-red-500 transition-colors bg-muted/50 rounded-lg border border-border/60 hover:border-red-500/30"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {isCollapsed && (
              <button
                onClick={handleLogout}
                className="w-full p-2 text-slate-500 hover:text-red-400 transition-colors flex justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse Toggle Button (Desktop) - PLACED OUTSIDE OVERFLOW HIDDEN CONTAINER */}
        {!isMobile && (
          <button
            onClick={toggleSidebarCollapse}
            className="absolute -right-3 top-24 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground shadow-lg z-[80] hover:scale-110 transition-transform active:scale-95 border border-border"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        )}
      </motion.div>
    </>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
  badgeColor,
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center h-12 rounded-xl transition-all duration-300 ${
        active
          ? "bg-accent/10 text-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {/* Active Indicator Line */}
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
        />
      )}

      <div
        className={`flex items-center w-full px-4 gap-4 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <div
          className={`relative transition-transform duration-300 group-hover:scale-110 ${active ? "text-blue-500" : "group-hover:text-blue-400"}`}
        >
          <Icon size={collapsed ? 22 : 20} strokeWidth={active ? 2.5 : 2} />

          {/* Badge for Collapsed View */}
          {collapsed && badge && (
            <span
              className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ${badgeColor || "bg-accent"} border border-background`}
            />
          )}
        </div>

        {!collapsed && (
          <span
            className={`text-[13px] font-semibold tracking-wide transition-all ${active ? "text-foreground" : ""}`}
          >
            {label}
          </span>
        )}

        {!collapsed && badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm ${badgeColor || "bg-blue-600"}`}
          >
            {badge}
          </motion.span>
        )}
      </div>

      {/* Tooltip for Collapsed view */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible pointer-events-none transition-all translate-x-3 group-hover:translate-x-0 shadow-xl whitespace-nowrap z-[100]">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-blue-600 rotate-45" />
        </div>
      )}
    </Link>
  );
}
