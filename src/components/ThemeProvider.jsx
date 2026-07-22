"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const VALID_THEMES = ["light", "dark", "black"];
const THEME_CACHE_KEY = "muhyo_global_theme";
const THEME_PREFERENCE_KEY = "muhyo_theme_preference";
const THEME_EVENT = "muhyo:theme-change";
const THEME_CHANNEL = "muhyo-global-theme";
const THEME_COLORS = {
  light: "#f8fafc",
  dark: "#020617",
  black: "#000000",
};

const normalizeTheme = (value) => (VALID_THEMES.includes(value) ? value : "black");

const applyThemeToRoot = (value) => {
  const theme = normalizeTheme(value);
  const root = document.documentElement;
  const themeChanged = root.dataset.theme !== theme;

  if (themeChanged) {
    root.classList.add("theme-switching");
    root.classList.remove("light", "dark", "black");

    if (theme === "black") root.classList.add("dark", "black");
    else root.classList.add(theme);

    root.dataset.theme = theme;
    root.style.colorScheme = theme === "light" ? "light" : "dark";

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove("theme-switching"));
    });
  }

  localStorage.setItem(THEME_CACHE_KEY, theme);
  localStorage.removeItem("theme");
  return theme;
};

const ThemeContext = createContext({
  theme: "black",
  setTheme: () => {},
  refreshTheme: async () => {},
  isDark: true,
  isBlack: true,
});

export const ThemeProvider = ({ children }) => {
  const refreshPromiseRef = useRef(null);
  const [theme, setThemeState] = useState("black");

  const commitTheme = useCallback((value) => {
    const nextTheme = applyThemeToRoot(value);
    setThemeState((current) => (current === nextTheme ? current : nextTheme));
    return nextTheme;
  }, []);

  const setTheme = useCallback((value, options = {}) => {
    const nextTheme = commitTheme(value);
    if (options.persistPreference) {
      localStorage.setItem(THEME_PREFERENCE_KEY, nextTheme);
    } else if (options.clearPreference) {
      localStorage.removeItem(THEME_PREFERENCE_KEY);
    }
    window.dispatchEvent(new CustomEvent(THEME_EVENT, {
      detail: { theme: nextTheme },
    }));
  }, [commitTheme]);

  const refreshTheme = useCallback(async () => {
    const preferredTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (VALID_THEMES.includes(preferredTheme)) {
      commitTheme(preferredTheme);
      return;
    }

    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    refreshPromiseRef.current = (async () => {
      try {
        const response = await fetch("/api/settings?themeOnly=1", {
          credentials: "same-origin",
        });
        if (!response.ok) return;
        const result = await response.json();
        if (String(result?.message || "").toLowerCase().includes("fallback")) return;
        const serverTheme = normalizeTheme(result?.data?.siteTheme);
        commitTheme(serverTheme);
      } catch {
        // Retain the last confirmed global theme while temporarily offline.
      } finally {
        refreshPromiseRef.current = null;
      }
    })();
    return refreshPromiseRef.current;
  }, [commitTheme]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const preferredTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
      const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
      const paintedTheme = document.documentElement.dataset.theme;
      commitTheme(preferredTheme || cachedTheme || paintedTheme || "black");
      refreshTheme();
    });

    const channel = "BroadcastChannel" in window
      ? new BroadcastChannel(THEME_CHANNEL)
      : null;

    const handleThemeEvent = (event) => {
      const nextTheme = event?.detail?.theme;
      if (!VALID_THEMES.includes(nextTheme)) return;
      commitTheme(nextTheme);
      channel?.postMessage({ theme: nextTheme });
    };
    const handleChannelMessage = (event) => {
      if (VALID_THEMES.includes(event?.data?.theme)) commitTheme(event.data.theme);
    };
    const handleStorage = (event) => {
      if (
        [THEME_CACHE_KEY, THEME_PREFERENCE_KEY].includes(event.key)
        && VALID_THEMES.includes(event.newValue)
      ) {
        commitTheme(event.newValue);
      } else if (event.key === THEME_PREFERENCE_KEY && event.newValue === null) {
        refreshTheme();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshTheme();
    };

    window.addEventListener(THEME_EVENT, handleThemeEvent);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshTheme);
    document.addEventListener("visibilitychange", handleVisibility);
    channel?.addEventListener("message", handleChannelMessage);

    const interval = window.setInterval(refreshTheme, 300000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener(THEME_EVENT, handleThemeEvent);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshTheme);
      document.removeEventListener("visibilitychange", handleVisibility);
      channel?.removeEventListener("message", handleChannelMessage);
      channel?.close();
    };
  }, [commitTheme, refreshTheme]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    refreshTheme,
    isDark: theme !== "light",
    isBlack: theme === "black",
  }), [refreshTheme, setTheme, theme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
