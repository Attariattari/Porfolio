"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/admin/Topbar";
import SocketRefresh from "@/components/SocketRefresh";
import AdminPwaAccessGuard from "@/components/admin/AdminPwaAccessGuard";
import useAdminStore from "@/lib/store/adminStore";

export default function ProtectedAdminLayout({ children }) {
  const { sidebarCollapsed } = useAdminStore();
  const [allowTransitions, setAllowTransitions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowTransitions(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminPwaAccessGuard>
      <div className="admin-theme-scope admin-app-shell flex min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
        <SocketRefresh />
        <div className="admin-app-grid" aria-hidden="true" />
        <div className="admin-app-glow" aria-hidden="true" />
        <AdminSidebar />
        <div
          className={`admin-content-shell flex-grow flex flex-col min-w-0 pl-0
            ${allowTransitions ? "transition-[padding] duration-300" : ""}
            ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}
          `}
        >
          <Topbar />
          <main className="relative flex-grow overflow-y-auto scroll-smooth px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </AdminPwaAccessGuard>
  );
}
