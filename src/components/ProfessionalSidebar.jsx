"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  Circle,
  Code2,
  Cpu,
  FileText,
  FileUser,
  Home,
  Mail,
  Moon,
  Sun,
  Target,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: User },
  { name: "Services", href: "/services", icon: Cpu },
  { name: "Projects", href: "/projects", icon: Code2 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Resume", href: "/resume", icon: FileUser },
  { name: "Contact", href: "/contact", icon: Mail },
];

const themeOptions = [
  { id: "light", label: "Light theme", icon: Sun },
  { id: "dark", label: "Dark theme", icon: Moon },
  { id: "black", label: "Black theme", icon: Circle },
];

const SIDEBAR_STORAGE_KEY = "muhyo:sidebar-collapsed";

function ThemeSwitcher({ theme, onChange, collapsed = false, compact = false }) {
  return (
    <div
      className={`flex border border-border/60 bg-background/55 p-1 shadow-sm ${
        collapsed
          ? "flex-col gap-1 rounded-2xl"
          : compact
            ? "gap-0.5 rounded-xl"
            : "gap-1 rounded-2xl"
      }`}
      role="group"
      aria-label="Choose website theme"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const active = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-label={option.label}
            aria-pressed={active}
            title={option.label}
            className={`relative flex items-center justify-center rounded-xl border transition-[background-color,color,border-color,transform] duration-200 active:scale-95 ${
              collapsed
                ? "h-9 w-9"
                : compact
                  ? "h-7 w-7"
                  : "h-9 flex-1"
            } ${
              active
                ? "border-accent/35 bg-accent text-accent-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Icon
              aria-hidden="true"
              className={`h-3.5 w-3.5 ${
                option.id === "black" && active ? "fill-current" : ""
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ProfessionalSidebar({ data }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const about = data || {};
  const firstName = about.firstName || "Muhyo";
  const lastName = about.lastName || "Tech";
  const professionalTitle = about.title || "Full-Stack Engineer";

  const changeTheme = (nextTheme) => {
    setTheme(nextTheme, { persistPreference: true });
  };

  const isActiveRoute = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const prefetchOnIntent = (href) => {
    if (href !== pathname) router.prefetch(href);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setCollapsed(
          window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
        );
      } catch {}
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const syncLayout = () => {
      const desktop = window.innerWidth >= 768;
      document.documentElement.classList.toggle(
        "sidebar-collapsed",
        desktop && collapsed,
      );
      document.documentElement.classList.toggle(
        "sidebar-expanded",
        desktop && !collapsed,
      );
    };

    syncLayout();
    window.addEventListener("resize", syncLayout, { passive: true });
    return () => window.removeEventListener("resize", syncLayout);
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      <header className="site-sidebar-shell fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-border/55 bg-background/88 px-4 backdrop-blur-xl md:hidden">
        <Link
          href="/"
          prefetch={false}
          className="group flex min-w-0 items-center gap-3"
          aria-label="Muhyo Tech home"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-accent/10 shadow-sm">
            <Image
              src="/logo.webp"
              alt="Muhyo Tech logo"
              width={40}
              height={40}
              sizes="40px"
              priority
              className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-active:scale-95"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black tracking-tight text-foreground">
              {firstName} <span className="text-accent">{lastName}</span>
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Digital engineering studio
            </span>
          </span>
        </Link>
        <ThemeSwitcher
          theme={theme}
          onChange={changeTheme}
          compact
        />
      </header>

      <div
        className={`site-sidebar-shell fixed bottom-4 left-4 top-4 z-50 hidden transition-[width] duration-300 ease-out md:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <aside
          aria-label="Primary navigation"
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-card/78 shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />

          <div
            className={`flex h-[92px] shrink-0 items-center border-b border-border/50 ${
              collapsed ? "justify-center px-3" : "px-5"
            }`}
          >
            <Link
              href="/"
              prefetch={false}
              className={`group flex min-w-0 items-center ${
                collapsed ? "justify-center" : "gap-3.5"
              }`}
              aria-label="Muhyo Tech home"
            >
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[0.95rem] border border-accent/25 bg-accent/10 shadow-[0_8px_24px_rgba(var(--accent-rgb),0.12)] transition-transform duration-300 group-hover:-translate-y-0.5">
                <Image
                  src="/logo.webp"
                  alt="Muhyo Tech logo"
                  width={44}
                  height={44}
                  sizes="44px"
                  priority
                  className="h-full w-full object-contain p-1.5"
                />
              </span>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="min-w-0"
                  >
                    <span className="block truncate text-[15px] font-black tracking-tight text-foreground">
                      {firstName} <span className="text-accent">{lastName}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75">
                      {professionalTitle}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-none">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-2 flex items-center justify-between px-3"
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/65">
                    Navigation
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground/40">
                    08 sections
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <nav className="space-y-1" aria-label="Portfolio pages">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onPointerEnter={() => prefetchOnIntent(item.href)}
                    onFocus={() => prefetchOnIntent(item.href)}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? item.name : undefined}
                    title={collapsed ? item.name : undefined}
                    className={`group/nav relative flex h-12 items-center overflow-hidden rounded-2xl transition-[background-color,color,transform] duration-200 active:scale-[0.98] ${
                      collapsed ? "justify-center px-2" : "gap-3 px-3"
                    } ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-muted/55 hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="professional-sidebar-active"
                        className="absolute inset-0 rounded-2xl border border-accent/20 bg-accent/10 shadow-[inset_3px_0_0_var(--color-accent)]"
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 34,
                        }}
                      />
                    )}

                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-[background-color,border-color,color,transform] duration-200 group-hover/nav:scale-105 ${
                        active
                          ? "border-accent/25 bg-accent text-accent-foreground shadow-sm"
                          : "border-transparent bg-background/35 text-muted-foreground group-hover/nav:border-border/60 group-hover/nav:text-foreground"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.16 }}
                          className="relative z-10 flex min-w-0 flex-1 items-center justify-between"
                        >
                          <span className="truncate text-[13px] font-semibold tracking-tight">
                            {item.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold tabular-nums ${
                              active
                                ? "text-accent"
                                : "text-muted-foreground/35"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>

                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4">
              <Link
                href="/book-a-call"
                prefetch={false}
                onPointerEnter={() => prefetchOnIntent("/book-a-call")}
                onFocus={() => prefetchOnIntent("/book-a-call")}
                aria-label="Book a project call"
                className={`group/cta relative flex overflow-hidden rounded-2xl border border-accent/25 bg-accent text-accent-foreground shadow-[0_10px_30px_rgba(var(--accent-rgb),0.18)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  collapsed
                    ? "h-11 items-center justify-center"
                    : "items-center gap-3 px-3.5 py-3"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-foreground/10">
                  <Mail aria-hidden="true" className="h-4 w-4" />
                </span>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-black uppercase tracking-[0.12em]">
                      Start a project
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium text-accent-foreground/70">
                      Book a discovery call
                    </span>
                  </span>
                )}
                {!collapsed && (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                  />
                )}
              </Link>
            </div>
          </div>

          <div
            className={`shrink-0 border-t border-border/50 bg-background/20 ${
              collapsed ? "px-3 py-4" : "px-4 py-3.5"
            }`}
          >
            {collapsed ? (
              <ThemeSwitcher
                theme={theme}
                onChange={changeTheme}
                collapsed
              />
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/65">
                    Appearance
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    Available
                  </span>
                </div>
                <ThemeSwitcher theme={theme} onChange={changeTheme} />
              </div>
            )}
          </div>
        </aside>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3 top-[76px] z-[70] flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-lg transition-[color,border-color,transform] duration-200 hover:scale-105 hover:border-accent/40 hover:text-accent active:scale-95"
        >
          <ChevronLeft
            aria-hidden="true"
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </>
  );
}
