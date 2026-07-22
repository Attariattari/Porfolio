"use client";

import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/admin/Topbar";
import SocketRefresh from "@/components/SocketRefresh";
import useAdminStore from "@/lib/store/adminStore";

export default function ProtectedAdminLayout({ children }) {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <div className="admin-theme-scope admin-app-shell flex min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <SocketRefresh />
      <div className="admin-app-grid" aria-hidden="true" />
      <div className="admin-app-glow" aria-hidden="true" />
      <AdminSidebar />
      <div
        className={`flex-grow flex flex-col transition-[padding] duration-300 min-w-0
          pl-0
          md:pl-20
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        <Topbar />
        <main className="relative z-10 flex-grow overflow-y-auto scroll-smooth px-4 py-6 sm:px-6 md:px-8 md:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
