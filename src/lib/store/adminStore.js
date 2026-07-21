import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { portfolioData as initialData } from '@/lib/data';

const ADMIN_BLOG_CACHE_TTL = 5 * 60 * 1000;
let pendingBlogsRequest = null;

const useAdminStore = create(persist((set, get) => ({
  // Core Data (Flat for direct reactivity)
  projects: initialData.projects || [],
  services: initialData.services || [],
  blogs: initialData.blogs || [],
  blogsCacheHydrated: false,
  blogsLastFetchedAt: 0,
  skills: initialData.skills || [],
  resumeData: initialData.resume || {
    experience: [],
    education: [],
    skills: [],
    stats: [],
  },
  messages: initialData.messages || [],
  
  // Backward compatibility object for components like Dashboard
  portfolioData: {
    projects: initialData.projects || [],
    services: initialData.services || [],
    blogs: initialData.blogs || [],
    skills: initialData.skills || [],
  },

  about: null,
  settings: initialData.siteConfig || {},
  users: [],
  notifications: [],
  sidebarOpen: false,
  sidebarCollapsed: false,
  
  // UI Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapse: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Generic Data Setter
  setData: (key, value) => set({ [key]: value }),

  // Actions: Portfolio Modules (DB Synced with data.js fallback)
  fetchProjects: async () => {
    try {
      const res = await fetch("/api/projects");
      const result = await res.json();
      if (result.success && result.data?.length > 0) {
        set({ projects: result.data });
      } else {
        set({ projects: initialData.projects || [] });
      }
    } catch (error) { 
        set({ projects: initialData.projects || [] });
    }
  },

  addProject: async (data) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Project constructed successfully.");
      await get().fetchProjects();
      return { success: true };
    } else {
      toast.error(result.error || "Blueprint rejection: Check permissions.");
      return { success: false, error: result.error };
    }
  },

  updateProject: async (id, data) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Project architecture optimized.");
      await get().fetchProjects();
      return { success: true };
    } else {
      toast.error(result.error || "Deployment failed: Authority denied.");
      return { success: false, error: result.error };
    }
  },

  deleteProject: async (id) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Project deleted successfully.");
      await get().fetchProjects();
      return { success: true };
    } else {
      toast.error(result.error || "Deconstruction failed: Role insufficient.");
      return { success: false };
    }
  },

  // SERVICES
  fetchServices: async () => {
    try {
      const res = await fetch("/api/services");
      const result = await res.json();
      if (result.success && result.data?.length > 0) {
        set({ services: result.data });
      } else {
        set({ services: initialData.services || [] });
      }
    } catch (error) { 
        set({ services: initialData.services || [] });
    }
  },

  addService: async (data) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Service protocol initiated.");
        await get().fetchServices();
        return { success: true };
    } else {
        toast.error(result.error || "Service init failed.");
        return { success: false, error: result.error };
    }
  },

  updateService: async (id, data) => {
    const res = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Service recalibrated.");
        await get().fetchServices();
        return { success: true };
    } else {
        toast.error(result.error || "Recalibration failed.");
        return { success: false, error: result.error };
    }
  },

  deleteService: async (id) => {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
        toast.success("Service terminated.");
        await get().fetchServices();
        return { success: true };
    } else {
        toast.error(result.error || "Termination denied.");
        return { success: false };
    }
  },

  importServices: async (mode = "safe") => {
    const res = await fetch("/api/admin/services/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const result = await res.json();
    if (result.success) {
      const summary = result.summary || {};
      toast.success(
        `Services imported successfully. ${summary.created || 0} created, ${summary.updated || 0} updated.`,
      );
      await get().fetchServices();
      return { success: true, summary };
    }

    toast.error(result.error || "Service import failed.");
    return { success: false, error: result.error };
  },

  // BLOGS
  fetchBlogs: async ({ force = false } = {}) => {
    const state = get();
    const cacheIsFresh =
      state.blogsCacheHydrated &&
      Date.now() - state.blogsLastFetchedAt < ADMIN_BLOG_CACHE_TTL;

    if (!force && cacheIsFresh) return state.blogs;
    if (!force && pendingBlogsRequest) return pendingBlogsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/blogs?includeContent=true", {
          cache: force ? "reload" : "default",
          credentials: "same-origin",
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || `Blog request failed (${res.status})`);
        }

        const blogs = result.data?.length > 0
          ? result.data
          : initialData.blogs || [];
        set({
          blogs,
          blogsCacheHydrated: true,
          blogsLastFetchedAt: Date.now(),
        });
        return blogs;
      } catch (error) {
        console.error("[STORE] Blog fetch failure:", error);
        if (!get().blogsCacheHydrated) {
          set({ blogs: initialData.blogs || [] });
        }
        return get().blogs;
      } finally {
        if (pendingBlogsRequest === request) pendingBlogsRequest = null;
      }
    })();

    pendingBlogsRequest = request;
    return request;
  },

  addBlog: async (data) => {
    const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Article broadcasted to network.");
        await get().fetchBlogs({ force: true });
        return { success: true };
    } else {
        toast.error(result.error || "Broadcast failure.");
        return { success: false, error: result.error };
    }
  },

  updateBlog: async (id, data) => {
    const res = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Post updated and re-indexed.");
        await get().fetchBlogs({ force: true });
        return { success: true };
    } else {
        toast.error(result.error || "Index update rejected.");
        return { success: false, error: result.error };
    }
  },

  deleteBlog: async (id) => {
    if (!id) {
        toast.error("Invalid ID: Deletion aborted.");
        return { success: false };
    }
    
    console.log(`[STORE] Attempting to delete blog ID: ${id}`);
    
    try {
        const res = await fetch(`/api/blogs/${id}`, { 
            method: "DELETE",
            cache: "no-store" 
        });
        
        const result = await res.json();
        
        if (result.success) {
            toast.success("Article deleted from index.");
            await get().fetchBlogs({ force: true });
            return { success: true };
        } else {
            console.error("[STORE] Blog deletion rejection:", result.error);
            toast.error(result.error || "Deletion denied.");
            return { success: false };
        }
    } catch (error) {
        console.error("[STORE] Critical deletion error:", error);
        toast.error("Network error during deletion.");
        return { success: false };
    }
  },

  reorderProjects: async (ids) => {
    // ids is already the full list of IDs in the correct order
    const previousProjects = get().projects;
    const reordered = [...previousProjects].sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      return ids.indexOf(aId) - ids.indexOf(bId);
    });
    set({ projects: reordered });

    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map(p => p._id || p.id) }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Project display sequence updated.");
      return { success: true };
    } catch (error) {
      set({ projects: previousProjects }); // Rollback
      toast.error(error.message || "Reorder synchronization failed.");
      return { success: false };
    }
  },

  reorderServices: async (ids) => {
    const previousServices = get().services;
    const reordered = [...previousServices].sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      return ids.indexOf(aId) - ids.indexOf(bId);
    });
    set({ services: reordered });

    try {
      const res = await fetch("/api/admin/services/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map(s => s._id || s.id) }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Service hierarchy updated.");
      return { success: true };
    } catch (error) {
      set({ services: previousServices }); // Rollback
      toast.error(error.message || "Sequence synchronization failed.");
      return { success: false };
    }
  },

  reorderBlogs: async (ids) => {
    const previousBlogs = get().blogs;
    const reordered = [...previousBlogs].sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      return ids.indexOf(aId) - ids.indexOf(bId);
    });
    set({ blogs: reordered });

    try {
      const res = await fetch("/api/admin/blogs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map(b => b._id || b.id) }),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Editorial sequence re-indexed.");
      return { success: true };
    } catch (error) {
      set({ blogs: previousBlogs }); // Rollback
      toast.error(error.message || "Blog re-indexing failed.");
      return { success: false };
    }
  },

  // SKILLS
  fetchSkills: async () => {
    try {
      const res = await fetch("/api/skills");
      const result = await res.json();
      if (result.success && result.data?.length > 0) {
        set({ skills: result.data });
      } else {
        set({ skills: initialData.skills || [] });
      }
    } catch (error) { 
        set({ skills: initialData.skills || [] });
    }
  },

  addSkill: async (data) => {
    const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        toast.success("Skill set expanded.");
        await get().fetchSkills();
        return { success: true };
    }
    return { success: false };
  },

  updateSkill: async (id, data) => {
    const res = await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        toast.success("Skill recalibrated.");
        await get().fetchSkills();
        return { success: true };
    }
    return { success: false };
  },

  deleteSkill: async (id) => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.ok) {
        toast.success("Toolkit updated.");
        await get().fetchSkills();
        return { success: true };
    }
    return { success: false };
  },

  // ABOUT
  fetchAbout: async () => {
    try {
      const res = await fetch("/api/about");
      const result = await res.json();
      if (result.success && result.data && Object.keys(result.data).length > 0) {
        set({ about: result.data });
      } else {
        set({ about: initialData.about || {} });
      }
    } catch (error) { 
        set({ about: initialData.about || {} });
    }
  },

  updateAbout: async (data) => {
    const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Identity profile re-calibrated.");
        set({ about: result.data });
        return { success: true };
    } else {
        toast.error(result.error || "Shield rejection: Access denied.");
        return { success: false };
    }
  },

  // SOCIAL LINKS
  socialLinks: {},

  fetchSocialLinks: async () => {
    try {
      const res = await fetch("/api/social-links");
      const result = await res.json();
      if (result.success && result.data) {
        set({ socialLinks: result.data });
      } else {
        // Fallback to default social links data
        const { defaultSocialLinksData } = await import('@/lib/data');
        set({ socialLinks: defaultSocialLinksData });
      }
    } catch (error) {
      const { defaultSocialLinksData } = await import('@/lib/data');
      set({ socialLinks: defaultSocialLinksData });
    }
  },

  updateSocialLinks: async (data) => {
    const res = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Social links updated successfully.");
        set({ socialLinks: result.data });
        return { success: true };
    } else {
        toast.error(result.error || "Failed to update social links.");
        return { success: false };
    }
  },

  // RESUME
  fetchResume: async () => {
    try {
      const res = await fetch("/api/resume");
      const result = await res.json();
      if (result.success && result.data && Object.keys(result.data).length > 0) {
        set({ resumeData: result.data });
      } else {
        set({ resumeData: initialData.resume || { experience: [], stats: [] } });
      }
    } catch (error) { 
        set({ resumeData: initialData.resume || { experience: [], stats: [] } });
    }
  },

  updateResume: async (data) => {
    const res = await fetch("/api/resume", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
        toast.success("Professional timeline synchronized.");
        set({ resumeData: result.data });
        return { success: true };
    } else {
        toast.error(result.error || "Data sync rejected.");
        return { success: false };
    }
  },

  // SETTINGS
  fetchSettings: async () => {
    try {
      const cacheKey = "muhyo_settings_cache";
      const res = await fetch("/api/settings", {
        cache: "no-store",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });
      const result = await res.json();
      
      if (result.success && result.data) {
        // Store in cache with timestamp
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: result.data,
              timestamp: Date.now(),
            })
          );
        }
        set({ settings: result.data });
      } else {
        set({ settings: initialData.siteConfig || {} });
      }
    } catch (error) {
      console.error("[Settings] Fetch failed:", error);
      set({ settings: initialData.siteConfig || {} });
    }
  },

  updateSettings: async (data) => {
    try {
      const res = await fetch("/api/settings", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const result = await res.json();
      
      if (result.success) {
          toast.success("Settings updated successfully!");
          set({ settings: result.data });
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "muhyo_settings_cache",
              JSON.stringify({ data: result.data, timestamp: Date.now() }),
            );
          }
          return { success: true, data: result.data };
      } else {
          const errorMsg = result.error || "Failed to update settings";
          toast.error(errorMsg);
          console.error("Settings update failed:", errorMsg);
          return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || "Network error - check console";
      toast.error(errorMsg);
      console.error("Settings API error:", error);
      return { success: false, error: errorMsg };
    }
  },

  // Sync Method (Unified Fetch)
  syncAllData: async () => {
      await Promise.all([
          get().fetchProjects(),
          get().fetchServices(),
          get().fetchBlogs(),
          get().fetchSkills(),
          get().fetchAbout(),
          get().fetchResume(),
          get().fetchSettings(),
          get().fetchUsers(),
          get().fetchNotifications()
      ]);
  },

  // Actions: USERS
  fetchUsers: async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      set({ users: data.users || [] });
    } catch (err) {
      console.error("Authority breach: Failed to synchronize user directory.");
    }
  },

  updateUserStatus: async (email, action) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ email, action }),
      });
      if (res.ok) {
        const labels = { approve: "authorized", restore: "restored", restrict: "restricted", deny: "denied", remove: "removed" };
        toast.success(`User ${email} ${labels[action] || "updated"}.`);
        await get().fetchUsers();
        await get().fetchNotifications();
        return { success: true };
      } else {
        const result = await res.json();
        toast.error(result.message || "Action failed.");
        return { success: false, error: result.message };
      }
    } catch (err) {
      toast.error("Network authority offline.");
      console.error("Authority fail: Status update denied.");
      return { success: false, error: "Network authority offline." };
    }
  },

  updateUserPermissions: async (email, role, permissions) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, permissions }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Permissions updated for ${email}.`);
        await get().fetchUsers(); // Sync with DB
        return { success: true };
      } else {
        toast.error(result.error || "Permission update failed.");
        return { success: false, error: result.error };
      }
    } catch (err) {
      toast.error("Muhyo Tech connection timed out.");
      return { success: false };
    }
  },

  // Actions: NOTIFICATIONS
  fetchNotifications: async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      set({ notifications: data.notifications || [] });
    } catch (err) {
      console.error("Signal lost: Failed to catch administrative alerts.", err);
    }
  },

  updateNotification: async (id, status) => {
    // Optimistic Update
    const currentNotifs = get().notifications;
    set({
      notifications: currentNotifs.map((n) =>
        (n.id || n._id) === id ? { ...n, status } : n
      ),
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "UPDATE_STATUS", id, status }),
      });
    } catch (err) {
      console.error("Update fail:", err);
      set({ notifications: currentNotifs }); // Rollback
    }
  },

  deleteNotification: async (id) => {
    // Optimistic Update
    const currentNotifs = get().notifications;
    set({
      notifications: currentNotifs.filter((n) => (n.id || n._id) !== id),
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "DELETE", id }),
      });
    } catch (err) {
      console.error("Delete fail:", err);
      set({ notifications: currentNotifs }); // Rollback
    }
  },

  addNotification: async (notification) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE", ...notification }),
      });
      if (res.ok) {
        await get().fetchNotifications();
        return { success: true };
      }
    } catch (err) {
      console.error("Notification creation failed:", err);
    }
    return { success: false };
  },

  // PATCH: Token expiration handler
  handleTokenExpiration: async () => {
    console.warn("[STORE] Handling token expiration");
    // Clear all auth data
    await get().clearAuthData();
    // Show error
    toast.error("Session Expired", {
      description: "Your session has expired. Please login again.",
    });
    // Redirect to login
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 1500);
  },

  // PATCH: Clear all authentication data
  clearAuthData: async () => {
    // Clear localStorage
    localStorage.removeItem("admin_token");
    
    // Clear cookies
    document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // Call backend logout
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("[STORE] Logout error:", err);
    }
  },
}), {
  name: "muhyo-admin-ui",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
  version: 1,
}));

export default useAdminStore;
