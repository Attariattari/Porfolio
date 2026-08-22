"use client";

import { useEffect } from "react";
import { disposeSocket, initializeSocket, SOCKET_EVENTS } from "@/lib/socket";
import useAdminStore from "@/lib/store/adminStore";
import { toast } from "sonner";

/**
 * SocketRefresh Component
 * Listens for real-time WebSocket events and updates the Zustand client store in-place,
 * guaranteeing zero full-page lag and keeping the UI instantly in sync.
 */
export default function SocketRefresh() {
  const {
    fetchBlogs,
    fetchProjects,
    fetchServices,
    fetchSettings,
    fetchNotifications,
    handleSocketRealtimeUpdate,
  } = useAdminStore();

  useEffect(() => {
    // Only initialize socket if user is authenticated in browser
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token") || localStorage.getItem("token")
        : null;

    if (!token) return;

    const socket = initializeSocket();
    if (!socket) return;

    // 1. Reorder Events (Targeted slice refresh)
    const onBlogsReordered = () => {
      fetchBlogs({ force: true });
      toast.info("Blog display sequence updated in real-time", { icon: "🔄", duration: 2000 });
    };

    const onProjectsReordered = () => {
      fetchProjects({ force: true });
      toast.info("Project showcase sequence updated", { icon: "🔄", duration: 2000 });
    };

    const onServicesReordered = () => {
      fetchServices({ force: true });
      toast.info("Service hierarchy updated", { icon: "🔄", duration: 2000 });
    };

    // 2. New Content Additions & Mutations
    const onNewBlog = (payload) => {
      handleSocketRealtimeUpdate("NEW_BLOG", payload);
      toast.success("New blog synced in real time.", { icon: "📝", duration: 2500 });
    };

    const onBlogImageUploaded = () => {
      fetchBlogs({ force: true });
      toast.success("Blog image updated in real time.", { duration: 2500 });
    };

    const onNewProject = (payload) => {
      handleSocketRealtimeUpdate("NEW_PROJECT", payload);
      toast.success("New project synced in real time.", { icon: "🚀", duration: 2500 });
    };

    const onNewService = (payload) => {
      handleSocketRealtimeUpdate("NEW_SERVICE", payload);
      toast.success("New service synced in real time.", { icon: "⚡", duration: 2500 });
    };

    const onSettingsUpdated = (payload) => {
      handleSocketRealtimeUpdate("SETTINGS_UPDATED", payload);
      toast.info("System settings updated in real time.", { icon: "⚙️", duration: 2000 });
    };

    const onNewNotification = () => {
      fetchNotifications({ force: true });
    };

    // Bind event listeners
    socket.on(SOCKET_EVENTS.BLOGS_REORDERED, onBlogsReordered);
    socket.on(SOCKET_EVENTS.PROJECTS_REORDERED, onProjectsReordered);
    socket.on(SOCKET_EVENTS.SERVICES_REORDERED, onServicesReordered);
    socket.on(SOCKET_EVENTS.NEW_BLOG, onNewBlog);
    socket.on(SOCKET_EVENTS.BLOG_IMAGE_UPLOADED, onBlogImageUploaded);
    socket.on(SOCKET_EVENTS.NEW_PROJECT, onNewProject);
    socket.on(SOCKET_EVENTS.NEW_SERVICE, onNewService);
    socket.on(SOCKET_EVENTS.SETTINGS_UPDATED, onSettingsUpdated);
    socket.on("NEW_NOTIFICATION", onNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.BLOGS_REORDERED, onBlogsReordered);
      socket.off(SOCKET_EVENTS.PROJECTS_REORDERED, onProjectsReordered);
      socket.off(SOCKET_EVENTS.SERVICES_REORDERED, onServicesReordered);
      socket.off(SOCKET_EVENTS.NEW_BLOG, onNewBlog);
      socket.off(SOCKET_EVENTS.BLOG_IMAGE_UPLOADED, onBlogImageUploaded);
      socket.off(SOCKET_EVENTS.NEW_PROJECT, onNewProject);
      socket.off(SOCKET_EVENTS.NEW_SERVICE, onNewService);
      socket.off(SOCKET_EVENTS.SETTINGS_UPDATED, onSettingsUpdated);
      socket.off("NEW_NOTIFICATION", onNewNotification);
      disposeSocket(socket);
    };
  }, [
    fetchBlogs,
    fetchProjects,
    fetchServices,
    fetchSettings,
    fetchNotifications,
    handleSocketRealtimeUpdate,
  ]);

  return null;
}
