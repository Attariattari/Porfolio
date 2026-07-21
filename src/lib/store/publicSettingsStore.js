import { create } from "zustand";

const usePublicSettingsStore = create((set) => ({
  settings: {},
  fetchSettings: async () => {
    try {
      const response = await fetch("/api/settings", { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) return;
      const result = await response.json();
      if (result.success && result.data) set({ settings: result.data });
    } catch {
      // Server-rendered brand data remains the stable fallback while offline.
    }
  },
}));

export default usePublicSettingsStore;
