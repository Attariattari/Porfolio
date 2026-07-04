"use client";

import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/admin/Topbar";
import SocketRefresh from "@/components/SocketRefresh";
import useAdminStore from "@/lib/store/adminStore";

export default function ProtectedAdminLayout({ children }) {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground overflow-x-hidden">
      <SocketRefresh />
      <AdminSidebar />
      <div 
        className={`flex-grow flex flex-col transition-[padding] duration-300 min-w-0
          pl-0 
          md:pl-20 
          ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        <Topbar />
        <main className="p-4 md:p-10 flex-grow overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
