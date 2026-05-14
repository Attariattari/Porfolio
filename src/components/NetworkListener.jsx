"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useNetworkStore } from "@/lib/store/networkStore";
import { onlineManager, useQueryClient } from "@tanstack/react-query";
import { setupFetchInterceptor } from "@/lib/network/fetchInterceptor";

export default function NetworkListener() {
  const { status, setStatus, lastStatus } = useNetworkStore();
  let queryClient = null;
  try {
    queryClient = useQueryClient();
  } catch (e) {
    // React Query not available in this context
  }

  useEffect(() => {
    setupFetchInterceptor();
    
    // Initial detection
    const initialStatus = navigator.onLine ? "online" : "offline";
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const getDetailedStatus = () => {
      if (!navigator.onLine) return "offline";
      if (connection && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")) {
        return "slow";
      }
      return "online";
    };

    const handleStatusChange = () => {
      const newStatus = getDetailedStatus();
      
      if (newStatus !== status) {
        setStatus(newStatus);
        
        // Handle Notifications
        if (newStatus === "offline") {
          toast.error("No Internet Connection", {
            description: "Please check your connection. Some features may be unavailable.",
            duration: Infinity,
            id: "network-offline",
          });
        } else if (newStatus === "online") {
          toast.dismiss("network-offline");
          toast.success("You're back online", {
            description: "Refreshing data and processing pending tasks...",
            duration: 3000,
          });
          
          // React Query Online Sync
          onlineManager.setOnline(true);
          
          // Global Auto Refresh (React Query)
          if (queryClient) {
            queryClient.resumePausedMutations();
            queryClient.invalidateQueries();
          }

          // Global Auto Retry (Non-React Query)
          const { failedRequests, clearFailedRequests } = useNetworkStore.getState();
          if (failedRequests.length > 0) {
            console.log(`[Network] Retrying ${failedRequests.length} failed requests...`);
            failedRequests.forEach(req => {
              window.fetch(...req.args).catch(err => console.error("[Network] Retry failed:", err));
            });
            clearFailedRequests();
          }
        } else if (newStatus === "slow") {
          toast.warning("Slow network detected", {
            description: "Some content might take longer to load.",
            duration: 5000,
          });
        }
      }
    };

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    
    if (connection) {
      connection.addEventListener("change", handleStatusChange);
    }

    // Set initial onlineManager state
    onlineManager.setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
      if (connection) {
        connection.removeEventListener("change", handleStatusChange);
      }
    };
  }, [status, setStatus, queryClient]);

  return null;
}
