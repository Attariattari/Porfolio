import { create } from "zustand";

export const useNetworkStore = create((set) => ({
  status: "online", // Default to online for SSR stability
  lastStatus: null,
  lastChangeTime: Date.now(),
  isRetrying: false,
  failedRequests: [],

  setStatus: (newStatus) => 
    set((state) => ({
      lastStatus: state.status,
      status: newStatus,
      lastChangeTime: Date.now(),
    })),

  addFailedRequest: (request) =>
    set((state) => ({
      failedRequests: [...state.failedRequests, request],
    })),

  clearFailedRequests: () => set({ failedRequests: [] }),
  
  setRetrying: (isRetrying) => set({ isRetrying }),
}));
