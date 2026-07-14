"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Cpu,
  Code2,
  FileText,
  Mail,
  FileUser,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: User },
  { name: "Services", href: "/services", icon: Cpu },
  { name: "Projects", href: "/projects", icon: Code2 },
  { name: "Blogs", href: "/blog", icon: FileText },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Resume", href: "/resume", icon: FileUser },
  { name: "Contact", href: "/contact", icon: Mail },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const checkModal = () => {
      setIsModalOpen(document.body.classList.contains("modal-open"));
    };
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (isModalOpen) return null;

  return (
    <nav className="site-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
      <div className="flex items-center justify-between p-2 bg-card/80 backdrop-blur-3xl border border-border/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={false}
              className={`relative flex items-center justify-center transition-all duration-500 ease-out ${
                isActive
                  ? "flex-[2] bg-accent/10 rounded-2xl py-2.5 px-3"
                  : "flex-1 py-2.5"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  size={isActive ? 18 : 20}
                  className={`transition-all duration-300 ${
                    isActive ? "text-accent" : "text-muted-foreground/50"
                  }`}
                />

                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="text-[10px] font-black tracking-tight text-accent whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </div>

              {!isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent/0 transition-all duration-300 group-active:bg-accent/20" />
              )}

              {isActive && (
                <motion.div
                  layoutId="active-pill-dot"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.8)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
