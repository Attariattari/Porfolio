"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";

export const ThemeToggle = ({ isCollapsed }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "system", icon: Monitor, label: "System" },
    { id: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className={`flex items-center gap-1 relative ${isCollapsed ? "flex-col" : "flex-row"}`}>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`relative z-10 p-2 rounded-lg transition-colors duration-300 ${
            theme === t.id ? "text-accent" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={t.label}
          title={t.label}
        >
          <t.icon className="w-4 h-4" />
          {theme === t.id && (
            <motion.div
              layoutId="theme-active-pill"
              className="absolute inset-0 bg-accent/10 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

