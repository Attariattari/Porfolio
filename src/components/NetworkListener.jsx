"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useNetworkStore } from "@/lib/store/networkStore";
import { setupFetchInterceptor } from "@/lib/network/fetchInterceptor";

export default function NetworkListener() {
  const setStatus = useNetworkStore((state) => state.setStatus);

  useEffect(() => {
    setupFetchInterceptor();

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const getDetailedStatus = () => {
      if (!navigator.onLine) return "offline";

      const effectiveType = connection?.effectiveType;
      const hasSlowConnectionSignal =
        effectiveType === "slow-2g" ||
        effectiveType === "2g" ||
        connection?.saveData === true ||
        (Number.isFinite(connection?.downlink) && connection.downlink <= 0.75) ||
        (Number.isFinite(connection?.rtt) && connection.rtt >= 1000);

      if (hasSlowConnectionSignal) {
        return "slow";
      }

      return "online";
    };

    const applyStatus = ({ initial = false } = {}) => {
      const newStatus = getDetailedStatus();
      const previousStatus = useNetworkStore.getState().status;

      if (newStatus === previousStatus && !initial) return;

      if (newStatus !== previousStatus) {
        setStatus(newStatus);
      }

      if (newStatus === "offline") {
        toast.dismiss("network-slow");
        toast.error("No Internet Connection", {
          description: "Please check your connection. Some features may be unavailable.",
          duration: Infinity,
          id: "network-offline",
        });
        return;
      }

      if (newStatus === "slow") {
        toast.dismiss("network-offline");
        toast.warning("Slow network detected", {
          description: "Some content might take longer to load.",
          duration: 5000,
          id: "network-slow",
        });
        return;
      }

      toast.dismiss("network-offline");
      toast.dismiss("network-slow");

      if (!initial && previousStatus !== "online") {
        toast.success("You're back online", {
          description: "Refreshing data and processing pending tasks...",
          duration: 3000,
          id: "network-online",
        });

        const { failedRequests, clearFailedRequests } =
          useNetworkStore.getState();
        if (failedRequests.length > 0) {
          console.log(
            `[Network] Retrying ${failedRequests.length} failed requests...`,
          );
          failedRequests.forEach((request) => {
            window
              .fetch(...request.args)
              .catch((error) =>
                console.error("[Network] Retry failed:", error),
              );
          });
          clearFailedRequests();
        }
      }
    };

    const handleStatusChange = () => applyStatus();

    // Synchronize the store and show offline/slow feedback on the first load.
    applyStatus({ initial: true });

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    
    if (connection) {
      connection.addEventListener("change", handleStatusChange);
    }

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
      if (connection) {
        connection.removeEventListener("change", handleStatusChange);
      }
    };
  }, [setStatus]);

  return null;
}
