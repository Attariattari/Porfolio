"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolioData } from "@/lib/data";

const IconMap = {
  Home,
  About: User,
  Services: Cpu,
  Projects: Code2,
  Blogs: FileText,
  Resume: FileUser,
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
  { name: "Blogs", href: "/blog", icon: "FileText" },
  { name: "Resume", href: "/resume", icon: "FileUser" },
  { name: "Contact", href: "/contact", icon: "Mail" },
];

export default function Sidebar({ data }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const about = data || portfolioData.about;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.documentElement.style.setProperty("--sidebar-width", "0px");
      } else {
        document.documentElement.style.setProperty(
          "--sidebar-width",
          isCollapsed ? "100px" : "300px",
        );
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Glass Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border/50 z-[60] px-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20 transition-transform group-active:scale-95">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight italic">
            {about.firstName || "Muhyo"}
            <span className="text-accent underline decoration-accent/30 underline-offset-4">
              {about.lastName || "Tech"}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>

      {/* Modern Desktop Sidebar */}
      <div
        className={`fixed left-4 top-4 bottom-4 z-50 hidden md:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
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
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain p-2.5"
                  />
                </div>
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <h1 className="text-lg font-bold text-foreground tracking-tight italic flex items-center gap-1.5 justify-center">
                    {about.firstName}{" "}
                    <span className="text-accent underline decoration-accent/20 underline-offset-4">
                      {about.lastName}
                    </span>
                  </h1>
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
              <div className="p-3.5 rounded-[1.5rem] bg-muted/30 border border-border/40 backdrop-blur-md">
                <div
                  className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"}`}
                >
                  {!isCollapsed && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                        Theme
                      </span>
                      <span className="text-[9px] text-muted-foreground/40 italic">
                        Appearance
                      </span>
                    </div>
                  )}
                  <ThemeToggle isCollapsed={isCollapsed} />
                </div>
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
