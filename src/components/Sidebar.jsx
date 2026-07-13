"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  User,
  Cpu,
  Code2,
  FileText,
  Mail,
  FileUser,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Sun,
  Moon,
  Circle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { portfolioData } from "@/lib/data";
import { useTheme } from "@/components/ThemeProvider";

const IconMap = {
  Home,
  About: User,
  Services: Cpu,
  Projects: Code2,
  Blogs: FileText,
  Resume: FileUser,
  Goals: Target,
  Contact: Mail,
};

const resolveIcon = (name, icon) => {
  return IconMap[name] || IconMap[icon] || Home;
};

const navLinks = [
  { name: "Home", href: "/", icon: "Home" },
  { name: "About", href: "/about", icon: "User" },
  { name: "Services", href: "/services", icon: "Cpu" },
  { name: "Projects", href: "/projects", icon: "Code2" },
  { name: "Goals", href: "/goals", icon: "Target" },
  { name: "Blogs", href: "/blog", icon: "FileText" },
  { name: "Resume", href: "/resume", icon: "FileUser" },
  { name: "Contact", href: "/contact", icon: "Mail" },
];

const SIDEBAR_STORAGE_KEY = "muhyo:sidebar-collapsed";
const themeOptions = [
  { id: "light", label: "Light theme", icon: Sun },
  { id: "dark", label: "Dark theme", icon: Moon },
  { id: "black", label: "Black theme", icon: Circle },
];

function ThemeButtons({ theme, onChange, compact = false }) {
  return (
    <div
      className={`flex items-center rounded-2xl border border-border/60 bg-background/65 p-1 ${compact ? "gap-0.5" : "gap-1"}`}
      role="group"
      aria-label="Choose website theme"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            title={option.label}
            aria-label={option.label}
            aria-pressed={isActive}
            className={`flex items-center justify-center rounded-xl border transition-colors ${
              compact ? "h-7 w-7" : "h-9 flex-1"
            } ${
              isActive
                ? "border-accent/40 bg-accent text-accent-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${option.id === "black" && isActive ? "fill-current" : ""}`} />
          </button>
        );
      })}
    </div>
  );
}

export default function Sidebar({ data }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const about = data || portfolioData.about;
  const { theme, setTheme } = useTheme();

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme, { persistPreference: true });
  };

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const savedState = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (savedState === "true") setIsCollapsed(true);
        if (savedState === "false") setIsCollapsed(false);
      } catch {}
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.classList.toggle(
        "sidebar-collapsed",
        window.innerWidth >= 768 && isCollapsed,
      );
      document.documentElement.classList.toggle(
        "sidebar-expanded",
        window.innerWidth >= 768 && !isCollapsed,
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((current) => {
      const next = !current;

      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}

      return next;
    });
  };

  return (
    <>
      {/* Mobile Glass Header */}
      <div className="site-sidebar-shell md:hidden fixed top-0 left-0 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-[60] px-4 flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20 transition-transform group-active:scale-95">
            <Image
              src="/logo.webp"
              alt="Muhyo Tech logo"
              width={40}
              height={40}
              className="w-full h-full object-contain p-1"
              priority
            />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight italic">
            {about.firstName || "Muhyo"}
            <span className="text-accent underline decoration-accent/30 underline-offset-4">
              {about.lastName || "Tech"}
            </span>
          </span>
        </Link>
        <ThemeButtons theme={theme} onChange={changeTheme} compact />
      </div>

      {/* Modern Desktop Sidebar */}
      <div
        className={`site-sidebar-shell fixed left-4 top-4 bottom-4 z-50 hidden md:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <aside className="h-full w-full bg-card/40 backdrop-blur-2xl rounded-[2.5rem] flex flex-col border border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] group overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/10 blur-[80px] pointer-events-none" />

          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden relative scrollbar-none py-4">
            {/* Logo Section */}
            <div
              className={`mb-6 flex flex-col items-center transition-all duration-500 ${isCollapsed ? "px-0" : "px-6"}`}
            >
              <div className="relative group/logo">
                <div className="absolute inset-0 bg-accent blur-2xl opacity-0 group-hover/logo:opacity-30 transition-opacity duration-700" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-card to-muted border border-border/50 flex items-center justify-center shadow-xl transition-all duration-500 group-hover/logo:scale-105 group-hover/logo:rotate-3 backdrop-blur-xl group-hover/logo:border-accent/40 overflow-hidden">
                  <Image
                    src="/logo.webp"
                    alt="Muhyo Tech logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain p-2.5"
                    priority
                  />
                </div>
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <div className="text-lg font-bold text-foreground tracking-tight italic flex items-center gap-1.5 justify-center">
                    {about.firstName}{" "}
                    <span className="text-accent underline decoration-accent/20 underline-offset-4">
                      {about.lastName}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium tracking-[0.1em] uppercase mt-1 opacity-70">
                    {about.title || "Software Engineer"}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Navigation Links (Flat List) */}
            <nav className="flex-grow space-y-1.5 px-4">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = resolveIcon(link.name, link.icon);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_self"
                    prefetch={true}
                    aria-current={isActive ? "page" : undefined}
                    className={`group/link relative flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-accent/5 text-accent shadow-[0_4px_20px_rgba(var(--accent-rgb),0.05)]"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}

                    <div
                      className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-accent/10 border border-accent/20"
                          : "bg-transparent group-hover/link:bg-card group-hover/link:shadow-sm"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-accent"
                            : "text-muted-foreground group-hover/link:text-foreground group-hover/link:scale-110"
                        }`}
                      />
                    </div>

                    {!isCollapsed && (
                      <span className="text-[13px] font-medium tracking-tight transition-transform duration-300 group-hover/link:translate-x-1">
                        {link.name}
                      </span>
                    )}

                    {isActive && !isCollapsed && (
                      <Sparkles
                        size={12}
                        className="ml-auto text-accent/40 animate-pulse"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto px-4 pt-4 space-y-3">
              <div className={isCollapsed ? "flex justify-center" : ""}>
                {isCollapsed ? (
                  <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-background/65 p-1">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = theme === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => changeTheme(option.id)}
                          title={option.label}
                          aria-label={option.label}
                          aria-pressed={isActive}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                            isActive
                              ? "border-accent/40 bg-accent text-accent-foreground"
                              : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${option.id === "black" && isActive ? "fill-current" : ""}`} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
                        Appearance
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground/45">
                        Choose theme
                      </span>
                    </div>
                    <ThemeButtons theme={theme} onChange={changeTheme} />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="px-4 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground/30 font-medium">
                    &copy; {new Date().getFullYear()} Muhyo Tech
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Improved Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-24 bg-card border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 transition-all hover:scale-105 group/toggle shadow-xl z-50 backdrop-blur-xl"
        >
          <div className="transition-transform duration-500 group-hover/toggle:rotate-180">
            {isCollapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronLeft size={12} />
            )}
          </div>
        </button>
      </div>
    </>
  );
}
