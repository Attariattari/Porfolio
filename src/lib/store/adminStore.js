import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { portfolioData as initialData } from '@/lib/data';

const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 Minutes Cache Freshness Window

const getInitialSidebarCollapsed = () => {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("muhyo-admin-ui");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.sidebarCollapsed !== undefined) {
        return Boolean(parsed.state.sidebarCollapsed);
      }
    }
  } catch (e) {}
  return false;
};

// In-Flight Promise Cache for Deduplication
let pendingProjectsRequest = null;
let pendingServicesRequest = null;
let pendingBlogsRequest = null;
let pendingSkillsRequest = null;
let pendingResumeRequest = null;
let pendingAboutRequest = null;
let pendingSocialLinksRequest = null;
let pendingSettingsRequest = null;
let pendingUsersRequest = null;
let pendingNotificationsRequest = null;

const isFresh = (lastFetchedAt, isHydrated) => {
  return Boolean(isHydrated && lastFetchedAt && (Date.now() - lastFetchedAt < ADMIN_CACHE_TTL));
};

const useAdminStore = create(persist((set, get) => ({
  // ==========================================
  // 1. CORE DATA STORE & CACHE TIMESTAMPS
  // ==========================================
  projects: initialData.projects || [],
  projectsCacheHydrated: false,
  projectsLastFetchedAt: 0,

  services: initialData.services || [],
  servicesCacheHydrated: false,
  servicesLastFetchedAt: 0,

  blogs: initialData.blogs || [],
  blogsCacheHydrated: false,
  blogsLastFetchedAt: 0,

  skills: initialData.skills || [],
  skillsCacheHydrated: false,
  skillsLastFetchedAt: 0,

  resumeData: initialData.resume || {
    experience: [],
    education: [],
    skills: [],
    stats: [],
  },
  resumeCacheHydrated: false,
  resumeLastFetchedAt: 0,

  about: null,
  aboutCacheHydrated: false,
  aboutLastFetchedAt: 0,

  socialLinks: {},
  socialLinksCacheHydrated: false,
  socialLinksLastFetchedAt: 0,

  settings: initialData.siteConfig || {},
  settingsCacheHydrated: false,
  settingsLastFetchedAt: 0,

  users: [],
  usersCacheHydrated: false,
  usersLastFetchedAt: 0,

  notifications: [],
  notificationsCacheHydrated: false,
  notificationsLastFetchedAt: 0,

  messages: initialData.messages || [],
  
  // Backward compatibility object for legacy dashboard widgets
  portfolioData: {
    projects: initialData.projects || [],
    services: initialData.services || [],
    blogs: initialData.blogs || [],
    skills: initialData.skills || [],
  },

  sidebarOpen: false,
  sidebarCollapsed: getInitialSidebarCollapsed(),
  
  // UI Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapse: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Generic Data Setter
  setData: (key, value) => set({ [key]: value }),

  // ==========================================
  // 2. PROJECTS (Smart Cached + Deduplicated)
  // ==========================================
  fetchProjects: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.projectsLastFetchedAt, state.projectsCacheHydrated)) {
      return state.projects;
    }
    if (!force && pendingProjectsRequest) return pendingProjectsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/projects", { cache: force ? "reload" : "default" });
        const result = await res.json();
        const projects = (result.success && result.data?.length > 0) ? result.data : (initialData.projects || []);
        set({
          projects,
          projectsCacheHydrated: true,
          projectsLastFetchedAt: Date.now(),
        });
        return projects;
      } catch (error) {
        if (!get().projectsCacheHydrated) set({ projects: initialData.projects || [] });
        return get().projects;
      } finally {
        if (pendingProjectsRequest === request) pendingProjectsRequest = null;
      }
    })();

    pendingProjectsRequest = request;
    return request;
  },

  addProject: async (data) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data) {
      toast.success("Project constructed successfully.");
      // In-place optimistic cache update
      set((state) => ({
        projects: [result.data, ...state.projects],
        projectsLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
    } else if (result.success) {
      await get().fetchProjects({ force: true });
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
      const updatedItem = result.data;
      // In-place cache update
      set((state) => ({
        projects: state.projects.map((p) => ((p._id === id || p.id === id) ? { ...p, ...(updatedItem || data) } : p)),
        projectsLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
    } else {
      toast.error(result.error || "Deployment failed: Authority denied.");
      return { success: false, error: result.error };
    }
  },

  deleteProject: async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      toast.success("Project deleted successfully.");
      // In-place removal from cache
      set((state) => ({
        projects: state.projects.filter((p) => (p._id !== id && p.id !== id)),
        projectsLastFetchedAt: Date.now(),
      }));
      return { success: true };
    } else {
      toast.error(result.error || "Deconstruction failed: Role insufficient.");
      return { success: false };
    }
  },

  reorderProjects: async (ids) => {
    const previousProjects = get().projects;
    const reordered = [...previousProjects].sort((a, b) => {
      const aId = a._id || a.id;
      const bId = b._id || b.id;
      return ids.indexOf(aId) - ids.indexOf(bId);
    });
    set({ projects: reordered, projectsLastFetchedAt: Date.now() });

    try {
      const res = await fetch("/api/admin/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((p) => p._id || p.id) }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success("Project display sequence updated.");
      return { success: true };
    } catch (error) {
      set({ projects: previousProjects }); // Rollback on failure
      toast.error(error.message || "Reorder synchronization failed.");
      return { success: false };
    }
  },

  // ==========================================
  // 3. SERVICES (Smart Cached + Deduplicated)
  // ==========================================
  fetchServices: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.servicesLastFetchedAt, state.servicesCacheHydrated)) {
      return state.services;
    }
    if (!force && pendingServicesRequest) return pendingServicesRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/services", { cache: force ? "reload" : "default" });
        const result = await res.json();
        const services = (result.success && result.data?.length > 0) ? result.data : (initialData.services || []);
        set({
          services,
          servicesCacheHydrated: true,
          servicesLastFetchedAt: Date.now(),
        });
        return services;
      } catch (error) {
        if (!get().servicesCacheHydrated) set({ services: initialData.services || [] });
        return get().services;
      } finally {
        if (pendingServicesRequest === request) pendingServicesRequest = null;
      }
    })();

    pendingServicesRequest = request;
    return request;
  },

  addService: async (data) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success && result.data) {
      toast.success("Service protocol initiated.");
      set((state) => ({
        services: [result.data, ...state.services],
        servicesLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
    } else if (result.success) {
      await get().fetchServices({ force: true });
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
      const updatedItem = result.data;
      set((state) => ({
        services: state.services.map((s) => ((s._id === id || s.id === id) ? { ...s, ...(updatedItem || data) } : s)),
        servicesLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
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
      set((state) => ({
        services: state.services.filter((s) => (s._id !== id && s.id !== id)),
        servicesLastFetchedAt: Date.now(),
      }));
      return { success: true };
    } else {
      toast.error(result.error || "Termination denied.");
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
    set({ services: reordered, servicesLastFetchedAt: Date.now() });

    try {
      const res = await fetch("/api/admin/services/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((s) => s._id || s.id) }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success("Service hierarchy updated.");
      return { success: true };
    } catch (error) {
      set({ services: previousServices }); // Rollback
      toast.error(error.message || "Sequence synchronization failed.");
      return { success: false };
    }
  },

  // ==========================================
  // 4. BLOGS (Smart Cached + Deduplicated)
  // ==========================================
  fetchBlogs: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.blogsLastFetchedAt, state.blogsCacheHydrated)) {
      return state.blogs;
    }
    if (!force && pendingBlogsRequest) return pendingBlogsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/blogs?includeContent=true", {
          cache: force ? "reload" : "default",
          credentials: "same-origin",
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || `Blog fetch failed (${res.status})`);

        const blogs = result.data?.length > 0 ? result.data : (initialData.blogs || []);
        set({
          blogs,
          blogsCacheHydrated: true,
          blogsLastFetchedAt: Date.now(),
        });
        return blogs;
      } catch (error) {
        console.error("[STORE] Blog fetch error:", error);
        if (!get().blogsCacheHydrated) set({ blogs: initialData.blogs || [] });
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
    if (result.success && result.data) {
      toast.success("Article broadcasted to network.");
      set((state) => ({
        blogs: [result.data, ...state.blogs],
        blogsLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
    } else if (result.success) {
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
      const updatedItem = result.data;
      set((state) => ({
        blogs: state.blogs.map((b) => ((b._id === id || b.id === id) ? { ...b, ...(updatedItem || data) } : b)),
        blogsLastFetchedAt: Date.now(),
      }));
      return { success: true, data: result.data };
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

    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE", cache: "no-store" });
      const result = await res.json();
      if (result.success) {
        toast.success("Article deleted from index.");
        set((state) => ({
          blogs: state.blogs.filter((b) => (b._id !== id && b.id !== id)),
          blogsLastFetchedAt: Date.now(),
        }));
        return { success: true };
      } else {
        toast.error(result.error || "Deletion denied.");
        return { success: false };
      }
    } catch (error) {
      toast.error("Network error during deletion.");
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
    set({ blogs: reordered, blogsLastFetchedAt: Date.now() });

    try {
      const res = await fetch("/api/admin/blogs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((b) => b._id || b.id) }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success("Editorial sequence re-indexed.");
      return { success: true };
    } catch (error) {
      set({ blogs: previousBlogs });
      toast.error(error.message || "Blog re-indexing failed.");
      return { success: false };
    }
  },

  // ==========================================
  // 5. SKILLS, ABOUT, RESUME, SETTINGS, SOCIAL
  // ==========================================
  fetchSkills: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.skillsLastFetchedAt, state.skillsCacheHydrated)) {
      return state.skills;
    }
    if (!force && pendingSkillsRequest) return pendingSkillsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/skills");
        const result = await res.json();
        const skills = (result.success && result.data?.length > 0) ? result.data : (initialData.skills || []);
        set({ skills, skillsCacheHydrated: true, skillsLastFetchedAt: Date.now() });
        return skills;
      } catch (error) {
        if (!get().skillsCacheHydrated) set({ skills: initialData.skills || [] });
        return get().skills;
      } finally {
        if (pendingSkillsRequest === request) pendingSkillsRequest = null;
      }
    })();

    pendingSkillsRequest = request;
    return request;
  },

  addSkill: async (data) => {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      toast.success("Skill set expanded.");
      set((state) => ({
        skills: result.data ? [result.data, ...state.skills] : state.skills,
        skillsLastFetchedAt: Date.now(),
      }));
      if (!result.data) await get().fetchSkills({ force: true });
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
    const result = await res.json();
    if (res.ok) {
      toast.success("Skill recalibrated.");
      set((state) => ({
        skills: state.skills.map((s) => ((s._id === id || s.id === id) ? { ...s, ...(result.data || data) } : s)),
        skillsLastFetchedAt: Date.now(),
      }));
      return { success: true };
    }
    return { success: false };
  },

  deleteSkill: async (id) => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Toolkit updated.");
      set((state) => ({
        skills: state.skills.filter((s) => (s._id !== id && s.id !== id)),
        skillsLastFetchedAt: Date.now(),
      }));
      return { success: true };
    }
    return { success: false };
  },

  fetchAbout: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.aboutLastFetchedAt, state.aboutCacheHydrated)) {
      return state.about;
    }
    if (!force && pendingAboutRequest) return pendingAboutRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/about");
        const result = await res.json();
        const about = (result.success && result.data && Object.keys(result.data).length > 0) ? result.data : (initialData.about || {});
        set({ about, aboutCacheHydrated: true, aboutLastFetchedAt: Date.now() });
        return about;
      } catch (error) {
        if (!get().aboutCacheHydrated) set({ about: initialData.about || {} });
        return get().about;
      } finally {
        if (pendingAboutRequest === request) pendingAboutRequest = null;
      }
    })();

    pendingAboutRequest = request;
    return request;
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
      set({ about: result.data, aboutLastFetchedAt: Date.now() });
      return { success: true };
    } else {
      toast.error(result.error || "Shield rejection: Access denied.");
      return { success: false };
    }
  },

  fetchSocialLinks: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.socialLinksLastFetchedAt, state.socialLinksCacheHydrated)) {
      return state.socialLinks;
    }
    if (!force && pendingSocialLinksRequest) return pendingSocialLinksRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/social-links");
        const result = await res.json();
        if (result.success && result.data) {
          set({ socialLinks: result.data, socialLinksCacheHydrated: true, socialLinksLastFetchedAt: Date.now() });
          return result.data;
        } else {
          const { defaultSocialLinksData } = await import('@/lib/data');
          set({ socialLinks: defaultSocialLinksData, socialLinksCacheHydrated: true, socialLinksLastFetchedAt: Date.now() });
          return defaultSocialLinksData;
        }
      } catch (error) {
        const { defaultSocialLinksData } = await import('@/lib/data');
        set({ socialLinks: defaultSocialLinksData });
        return defaultSocialLinksData;
      } finally {
        if (pendingSocialLinksRequest === request) pendingSocialLinksRequest = null;
      }
    })();

    pendingSocialLinksRequest = request;
    return request;
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
      set({ socialLinks: result.data, socialLinksLastFetchedAt: Date.now() });
      return { success: true };
    } else {
      toast.error(result.error || "Failed to update social links.");
      return { success: false };
    }
  },

  fetchResume: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.resumeLastFetchedAt, state.resumeCacheHydrated)) {
      return state.resumeData;
    }
    if (!force && pendingResumeRequest) return pendingResumeRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/resume");
        const result = await res.json();
        const resumeData = (result.success && result.data && Object.keys(result.data).length > 0) ? result.data : (initialData.resume || { experience: [], stats: [] });
        set({ resumeData, resumeCacheHydrated: true, resumeLastFetchedAt: Date.now() });
        return resumeData;
      } catch (error) {
        if (!get().resumeCacheHydrated) set({ resumeData: initialData.resume || { experience: [], stats: [] } });
        return get().resumeData;
      } finally {
        if (pendingResumeRequest === request) pendingResumeRequest = null;
      }
    })();

    pendingResumeRequest = request;
    return request;
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
      set({ resumeData: result.data, resumeLastFetchedAt: Date.now() });
      return { success: true };
    } else {
      toast.error(result.error || "Data sync rejected.");
      return { success: false };
    }
  },

  fetchSettings: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.settingsLastFetchedAt, state.settingsCacheHydrated)) {
      return state.settings;
    }
    if (!force && pendingSettingsRequest) return pendingSettingsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/settings", {
          cache: force ? "reload" : "default",
          credentials: "include",
        });
        const result = await res.json();
        const settings = (result.success && result.data) ? result.data : (initialData.siteConfig || {});
        set({ settings, settingsCacheHydrated: true, settingsLastFetchedAt: Date.now() });
        return settings;
      } catch (error) {
        if (!get().settingsCacheHydrated) set({ settings: initialData.siteConfig || {} });
        return get().settings;
      } finally {
        if (pendingSettingsRequest === request) pendingSettingsRequest = null;
      }
    })();

    pendingSettingsRequest = request;
    return request;
  },

  updateSettings: async (data) => {
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const result = await res.json();
      if (result.success) {
        toast.success("Settings updated successfully!");
        set({ settings: result.data, settingsLastFetchedAt: Date.now() });
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.error || "Failed to update settings";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error.message || "Network error";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  },

  // ==========================================
  // 6. USERS & NOTIFICATIONS (Cached)
  // ==========================================
  fetchUsers: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.usersLastFetchedAt, state.usersCacheHydrated)) {
      return state.users;
    }
    if (!force && pendingUsersRequest) return pendingUsersRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        const users = data.users || [];
        set({ users, usersCacheHydrated: true, usersLastFetchedAt: Date.now() });
        return users;
      } catch (err) {
        console.error("Failed to synchronize users:", err);
        return get().users;
      } finally {
        if (pendingUsersRequest === request) pendingUsersRequest = null;
      }
    })();

    pendingUsersRequest = request;
    return request;
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
        await get().fetchUsers({ force: true });
        await get().fetchNotifications({ force: true });
        return { success: true };
      } else {
        const result = await res.json();
        toast.error(result.message || "Action failed.");
        return { success: false, error: result.message };
      }
    } catch (err) {
      toast.error("Network authority offline.");
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
        set((state) => ({
          users: state.users.map((u) => (u.email === email ? { ...u, role, permissions } : u)),
          usersLastFetchedAt: Date.now(),
        }));
        return { success: true };
      } else {
        toast.error(result.error || "Permission update failed.");
        return { success: false, error: result.error };
      }
    } catch (err) {
      toast.error("Connection timed out.");
      return { success: false };
    }
  },

  fetchNotifications: async ({ force = false } = {}) => {
    const state = get();
    if (!force && isFresh(state.notificationsLastFetchedAt, state.notificationsCacheHydrated)) {
      return state.notifications;
    }
    if (!force && pendingNotificationsRequest) return pendingNotificationsRequest;

    const request = (async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        const notifications = data.notifications || [];
        set({ notifications, notificationsCacheHydrated: true, notificationsLastFetchedAt: Date.now() });
        return notifications;
      } catch (err) {
        return get().notifications;
      } finally {
        if (pendingNotificationsRequest === request) pendingNotificationsRequest = null;
      }
    })();

    pendingNotificationsRequest = request;
    return request;
  },

  updateNotification: async (id, status) => {
    const currentNotifs = get().notifications;
    set({
      notifications: currentNotifs.map((n) => ((n.id || n._id) === id ? { ...n, status } : n)),
      notificationsLastFetchedAt: Date.now(),
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "UPDATE_STATUS", id, status }),
      });
    } catch (err) {
      set({ notifications: currentNotifs }); // Rollback
    }
  },

  deleteNotification: async (id) => {
    const currentNotifs = get().notifications;
    set({
      notifications: currentNotifs.filter((n) => (n.id || n._id) !== id),
      notificationsLastFetchedAt: Date.now(),
    });

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ action: "DELETE", id }),
      });
    } catch (err) {
      set({ notifications: currentNotifs });
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
        await get().fetchNotifications({ force: true });
        return { success: true };
      }
    } catch (err) {
      console.error("Notification creation failed:", err);
    }
    return { success: false };
  },

  // ==========================================
  // 7. UNIFIED SYNC (One-Time Initial Load)
  // ==========================================
  isInitialSyncing: true,
  syncAllData: async ({ force = false } = {}) => {
    try {
      await Promise.allSettled([
        get().fetchProjects({ force }),
        get().fetchServices({ force }),
        get().fetchBlogs({ force }),
        get().fetchSkills({ force }),
        get().fetchAbout({ force }),
        get().fetchResume({ force }),
        get().fetchSettings({ force }),
        get().fetchUsers({ force }),
        get().fetchNotifications({ force }),
      ]);
    } finally {
      set({ isInitialSyncing: false });
    }
  },

  // ==========================================
  // 8. REAL-TIME SOCKET HELPERS (Targeted Cache Update)
  // ==========================================
  handleSocketRealtimeUpdate: (event, payload) => {
    switch (event) {
      case "NEW_BLOG":
        if (payload && payload._id) {
          set((state) => ({
            blogs: [payload, ...state.blogs.filter((b) => (b._id !== payload._id && b.id !== payload._id))],
            blogsLastFetchedAt: Date.now(),
          }));
        } else {
          get().fetchBlogs({ force: true });
        }
        break;
      case "NEW_PROJECT":
        if (payload && payload._id) {
          set((state) => ({
            projects: [payload, ...state.projects.filter((p) => (p._id !== payload._id && p.id !== payload._id))],
            projectsLastFetchedAt: Date.now(),
          }));
        } else {
          get().fetchProjects({ force: true });
        }
        break;
      case "NEW_SERVICE":
        if (payload && payload._id) {
          set((state) => ({
            services: [payload, ...state.services.filter((s) => (s._id !== payload._id && s.id !== payload._id))],
            servicesLastFetchedAt: Date.now(),
          }));
        } else {
          get().fetchServices({ force: true });
        }
        break;
      case "SETTINGS_UPDATED":
        if (payload) {
          set({ settings: payload, settingsLastFetchedAt: Date.now() });
        } else {
          get().fetchSettings({ force: true });
        }
        break;
      default:
        break;
    }
  },

  // Token expiration handler
  handleTokenExpiration: async () => {
    await get().clearAuthData();
    toast.error("Session Expired", {
      description: "Your session has expired. Please login again.",
    });
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 1500);
  },

  // Clear all authentication data
  clearAuthData: async () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    document.cookie = "admin_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {}
  },
}), {
  name: "muhyo-admin-ui",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
  version: 1,
}));

export default useAdminStore;
