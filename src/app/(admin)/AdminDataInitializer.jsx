"use client";

import { useEffect, useState } from "react";
import useAdminStore from "@/lib/store/adminStore";
import { useSettingsSync } from "@/lib/hooks/useSettingsSync";

/**
 * Wrapper component - only renders when authenticated
 * This allows us to use hooks safely without conditional calls
 */
function AuthenticatedDataInitializer({ children, isAuthenticated, mounted }) {
  const { syncAllData, fetchSettings } = useAdminStore();

  // Always call useSettingsSync when component renders
  // We only render this when authenticated, so it's safe
  useSettingsSync();

  // Sync all data on mount and load debug tools
  useEffect(() => {
    // Load debug tools only in development
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      try {
        require("@/lib/settingsDebug");
      } catch (error) {
        console.warn("Debug tools not available");
      }
    }

    const initializeAdminData = async () => {
      try {
        console.log("📍 Initializing admin data...");
        await syncAllData();
        console.log("✅ Admin data synced successfully");
      } catch (error) {
        console.error("❌ Failed to sync admin data:", error);
        // Fallback to settings sync
        try {
          await fetchSettings();
          console.log("✅ Settings fetched (fallback)");
        } catch (fallbackError) {
          console.error("❌ Fallback failed:", fallbackError);
        }
      }
    };

    initializeAdminData();

    // Optional: Refresh data every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing settings...");
      fetchSettings();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [syncAllData, fetchSettings]);

  return <>{children}</>;
}

/**
 * Admin Data Initializer
 * Syncs all admin data on app load (only when authenticated)
 */
export default function AdminDataInitializer({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    const token = typeof window !== "undefined"
      ? localStorage.getItem("admin_token") || localStorage.getItem("token")
      : null;
    setIsAuthenticated(!!token);
    console.log("[AdminDataInitializer] Authentication check:", !!token);
  }, []);

  // Don't render auth-dependent content until we've checked auth status
  if (!mounted) {
    return <>{children}</>;
  }

  // Only wrap with AuthenticatedDataInitializer if user is authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <AuthenticatedDataInitializer isAuthenticated={isAuthenticated} mounted={mounted}>
      {children}
    </AuthenticatedDataInitializer>
  );
}
