"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

const normalizeTheme = (value) => (VALID_THEMES.includes(value) ? value : "dark");

const getClientTheme = (fallback = "dark") => {
  if (typeof window === "undefined") return fallback;
  try {
    const preferredTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (VALID_THEMES.includes(preferredTheme)) return preferredTheme;
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
    if (VALID_THEMES.includes(cachedTheme)) return cachedTheme;
    const paintedTheme = document.documentElement?.dataset?.theme;
    if (VALID_THEMES.includes(paintedTheme)) return paintedTheme;
  } catch {}
  return fallback;
};

const applyThemeToRoot = (value, isInitial = false) => {
  const theme = normalizeTheme(value);
  if (typeof document === "undefined") return theme;
  const root = document.documentElement;
  const themeChanged = root.dataset.theme !== theme;

  if (themeChanged) {
    if (!isInitial && !root.classList.contains("preload-no-transition")) {
      root.classList.add("theme-switching");
    }
    root.classList.remove("light", "dark", "black");

    if (theme === "black") root.classList.add("dark", "black");
    else root.classList.add(theme);

    root.dataset.theme = theme;
    root.style.colorScheme = theme === "light" ? "light" : "dark";

    if (!isInitial && !root.classList.contains("preload-no-transition")) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => root.classList.remove("theme-switching"));
      });
    }
  } else {
    // Ensure classes match even if dataset was already set
    if (theme === "black" && !root.classList.contains("black")) {
      root.classList.add("dark", "black");
    } else if (theme !== "black" && !root.classList.contains(theme)) {
      root.classList.add(theme);
    }
    root.style.colorScheme = theme === "light" ? "light" : "dark";
  }

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
  }

  try {
    localStorage.setItem(THEME_CACHE_KEY, theme);
    localStorage.removeItem("theme");
  } catch {}
  return theme;
};

const ThemeContext = createContext({
  theme: "dark",
  themeReady: false,
  setTheme: () => {},
  refreshTheme: async () => {},
  isDark: true,
  isBlack: false,
});

export const ThemeProvider = ({ children, initialTheme = "dark" }) => {
  const refreshPromiseRef = useRef(null);
  const [theme, setThemeState] = useState(() => {
    return getClientTheme(initialTheme);
  });
  const [themeReady, setThemeReady] = useState(typeof window !== "undefined");

  const commitTheme = useCallback((value, isInitial = false) => {
    const nextTheme = applyThemeToRoot(value, isInitial);
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
        // Only apply server theme if user has no explicit preference saved
        if (!localStorage.getItem(THEME_PREFERENCE_KEY)) {
          commitTheme(serverTheme);
        }
      } catch {
        // Retain the last confirmed global theme while temporarily offline.
      } finally {
        refreshPromiseRef.current = null;
      }
    })();
    return refreshPromiseRef.current;
  }, [commitTheme]);

  // The inline head script paints the saved theme before CSS is rendered.
  // Synchronize React with that exact value before the browser paints the
  // hydrated app, so context-driven backgrounds never flash the default theme.
  useLayoutEffect(() => {
    const currentTheme = getClientTheme();
    commitTheme(currentTheme, true);
    setThemeReady(true);
  }, [commitTheme]);

  useEffect(() => {
    let idleId;
    const refreshTimer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(refreshTheme, { timeout: 5000 });
      } else {
        refreshTheme();
      }
    }, 2500);

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
      window.clearTimeout(refreshTimer);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
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
    themeReady,
    setTheme,
    refreshTheme,
    isDark: theme !== "light",
    isBlack: theme === "black",
  }), [refreshTheme, setTheme, theme, themeReady]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
