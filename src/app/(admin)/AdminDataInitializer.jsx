"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isPublicAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  // Check authentication on mount
  useEffect(() => {
    let cancelled = false;

    // Login and signup are intentionally public admin routes. Probing the
    // session here only creates an expected 401 in the browser console.
    if (isPublicAuthPage) {
      return () => {
        cancelled = true;
      };
    }

    const checkAuthentication = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!cancelled) {
          setIsAuthenticated(response.ok);
          console.log("[AdminDataInitializer] Authentication check:", response.ok);
        }
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setMounted(true);
      }
    };

    checkAuthentication();
    return () => {
      cancelled = true;
    };
  }, [isPublicAuthPage]);

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
