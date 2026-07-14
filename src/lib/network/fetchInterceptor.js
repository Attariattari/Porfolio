/**
 * Advanced Network-Aware Fetch Interceptor
 * Implements auto-retry logic and global error tracking
 */

import { useNetworkStore } from "@/lib/store/networkStore";
import { toast } from "sonner";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const setupFetchInterceptor = () => {
  if (typeof window === "undefined" || window._fetchIntercepted) return;
  window._fetchIntercepted = true;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const [url, options] = args;
    const store = useNetworkStore.getState();

    // 1. Block unnecessary calls if offline (unless it's a critical local check)
    if (store.status === "offline" && !url.includes("localhost") && !url.includes("127.0.0.1")) {
      console.warn(`[Network] Blocking fetch to ${url} while offline`);
      return new Promise((resolve, reject) => {
        const error = new Error("No Internet Connection");
        error.name = "OfflineError";
        
        // Add to failed requests for manual/auto retry later
        store.addFailedRequest({ args, timestamp: Date.now(), id: Math.random().toString(36).substr(2, 9) });
        
        reject(error);
      });
    }

    const executeWithRetry = async (attempt = 1) => {
      try {
        const response = await originalFetch(...args);
        
        // Only the dedicated session endpoint may decide that authentication
        // expired. Route-specific 401s must not cause a login redirect loop.
        const requestUrl = url?.toString() || "";
        const isSessionCheck = requestUrl.includes("/api/admin/me");
        if (response.status === 401 &&
            isSessionCheck &&
            typeof window !== "undefined" && 
            window.location.pathname !== "/admin/login" &&
            !window.location.pathname.includes("/admin/security/change-passkey")) {
          console.warn(`[Auth] Session expired or unauthorized. Redirecting to login...`);
          // Optional: Clear tokens here if needed
          window.location.href = "/admin/login";
          return response;
        }

        // If server returns error, we might still want to retry depending on status
        if (!response.ok && [502, 503, 504].includes(response.status)) {
          throw new Error(`Server Error: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        // If it's a network error or specific server error
        const isNetworkError = error.name === "TypeError" || error.name === "OfflineError" || error.message.includes("fetch");
        const isRetryable = isNetworkError || error.message.includes("Server Error");

        if (isRetryable && attempt <= MAX_RETRIES) {
          const delay = attempt === 1 ? 0 : RETRY_DELAY * (attempt - 1);
          
          console.log(`[Network] Retrying ${url} (Attempt ${attempt}/${MAX_RETRIES}) after ${delay}ms`);
          
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          return executeWithRetry(attempt + 1);
        }

        // Final failure
        if (attempt > MAX_RETRIES) {
          store.addFailedRequest({ 
            args, 
            timestamp: Date.now(), 
            id: Math.random().toString(36).substr(2, 9),
            error: error.message 
          });
          
          const isServerDown = error.message.includes("Server Error") || error.message.includes("fetch");
          
          // Show manual retry option
          toast.error(isServerDown ? "Server Unreachable" : "Request Failed", {
            description: isServerDown ? "The server is currently unavailable. Please try again later." : "Could not complete your request.",
            action: {
              label: "Retry",
              onClick: () => window.fetch(...args)
            },
          });
        }

        throw error;
      }
    };

    return executeWithRetry();
  };
};
