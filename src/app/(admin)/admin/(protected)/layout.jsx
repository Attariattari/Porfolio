"use client";

import AdminSidebar from "@/components/AdminSidebar";
import Topbar from "@/components/admin/Topbar";
import useAdminStore from "@/lib/store/adminStore";

export default function ProtectedAdminLayout({ children }) {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <div className="flex min-h-screen bg-[#0a0f1c] selection:bg-accent selection:text-white overflow-x-hidden">
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
