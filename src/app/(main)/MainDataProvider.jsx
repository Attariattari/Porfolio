"use client";

import { useEffect } from "react";
import usePublicSettingsStore from "@/lib/store/publicSettingsStore";
import { useSettingsSync } from "@/lib/hooks/useSettingsSync";

/**
 * Main Layout Data Provider
 * Syncs settings for main website
 */
export default function MainDataProvider({ children }) {
  const fetchSettings = usePublicSettingsStore((state) => state.fetchSettings);

  // Initialize socket sync for real-time updates
  useSettingsSync();

  // Sync settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
}
