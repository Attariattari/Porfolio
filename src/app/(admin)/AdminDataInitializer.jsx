"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAdminStore from "@/lib/store/adminStore";
import { useSettingsSync } from "@/lib/hooks/useSettingsSync";
import AdminPageLoader from "@/components/admin/AdminPageLoader";

/**
 * Wrapper component - only renders when authenticated and initial core telemetry is hydrated.
 */
function AuthenticatedDataInitializer({ children }) {
  const { syncAllData, isInitialSyncing } = useAdminStore();
  const [dataReady, setDataReady] = useState(false);

  // Always keep settings synced
  useSettingsSync();

  // Sync data on mount once with cache intelligence
  useEffect(() => {
    let active = true;

    const initializeAdminData = async () => {
      try {
        await syncAllData();
      } catch (error) {
        console.error("❌ Failed to sync admin data:", error);
      } finally {
        if (active) setDataReady(true);
      }
    };

    initializeAdminData();

    // Fallback safety: never hang indefinitely on slow networks (max 3.2s)
    const timer = setTimeout(() => {
      if (active) setDataReady(true);
    }, 3200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [syncAllData]);

  if (!dataReady && isInitialSyncing) {
    return (
      <AdminPageLoader
        fullScreen
        title="Loading Workspace Telemetry"
        message="Hydrating encrypted database records & control metrics..."
      />
    );
  }

  return <>{children}</>;
}

/**
 * Admin Data Initializer & Loading Gate.
 * Enforces zero-flash protection: renders a professional loader until the user's
 * session and cache are verified, preventing unauthenticated content exposure.
 */
export default function AdminDataInitializer({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isPublicAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/signup" ||
    pathname.startsWith("/admin/security/change-passkey");

  useEffect(() => {
    let cancelled = false;

    // Public auth pages (login, signup, change-passkey) do not require blocking
    if (isPublicAuthPage) {
      setIsChecking(false);
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

        if (cancelled) return;

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          // Redirect unauthenticated user to login immediately
          router.replace("/admin/login");
        }
      } catch (err) {
        if (!cancelled) {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [isPublicAuthPage, pathname, router]);

  // 1. If viewing public auth route (/admin/login or /admin/signup), render directly
  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  // 2. While verifying session on protected routes, show luxury loader
  if (isChecking) {
    return (
      <AdminPageLoader
        fullScreen
        title="Securing Workspace Telemetry"
        message="Verifying encrypted session & workspace data..."
      />
    );
  }

  // 3. If unauthenticated after check, keep loader shown while router redirects
  if (!isAuthenticated) {
    return (
      <AdminPageLoader
        fullScreen
        title="Access Verification"
        message="Session required. Redirecting to security login..."
      />
    );
  }

  // 4. Authenticated & verified -> render protected dashboard content
  return (
    <AuthenticatedDataInitializer>
      {children}
    </AuthenticatedDataInitializer>
  );
}
