"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeSocket, SOCKET_EVENTS } from "@/lib/socket";
import { toast } from "sonner";

/**
 * SocketRefresh Component
 * Listens for data changes via WebSockets and refreshes the current page
 * using Next.js router.refresh() for real-time synchronization.
 */
export default function SocketRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Only initialize socket if user is authenticated
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('admin_token') || localStorage.getItem('token')
      : null;
    if (!token) {
      console.log("[SocketRefresh] Not authenticated, skipping socket initialization");
      return;
    }

    const socket = initializeSocket();
    if (!socket) return;

    // Listen for reorder events
    socket.on(SOCKET_EVENTS.BLOGS_REORDERED, () => {
      console.log("[SOCKET] Blogs reordered, refreshing...");
      router.refresh();
      toast.info("Content sequence updated in real-time", {
        icon: "🔄",
        duration: 2000
      });
    });

    socket.on(SOCKET_EVENTS.PROJECTS_REORDERED, () => {
      console.log("[SOCKET] Projects reordered, refreshing...");
      router.refresh();
      toast.info("Project showcase updated", {
        icon: "🔄",
        duration: 2000
      });
    });

    socket.on(SOCKET_EVENTS.SERVICES_REORDERED, () => {
      console.log("[SOCKET] Services reordered, refreshing...");
      router.refresh();
      toast.info("Service hierarchy updated", {
        icon: "🔄",
        duration: 2000
      });
    });

    // Listen for new content additions
    socket.on(SOCKET_EVENTS.NEW_BLOG, () => router.refresh());
    socket.on(SOCKET_EVENTS.NEW_PROJECT, () => router.refresh());
    socket.on(SOCKET_EVENTS.NEW_SERVICE, () => router.refresh());
    socket.on(SOCKET_EVENTS.SETTINGS_UPDATED, () => router.refresh());

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return null;
}
