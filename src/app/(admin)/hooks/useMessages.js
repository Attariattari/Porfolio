/**
 * Custom React hooks for message management
 * Can be easily migrated to React Query/TanStack Query in future
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

/**
 * Hook to fetch and manage messages list
 */
export const useMessages = (options = {}) => {
  const {
    page = 1,
    limit = 10,
    service = null,
    status = null,
    search = "",
    sortBy = "latest",
  } = options;

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build params - only include non-empty values
      const params = new URLSearchParams();
      
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());
      if (sortBy) params.append("sortBy", sortBy);
      if (service && service !== "") params.append("service", service);
      if (status && status !== "") params.append("status", status);
      if (search && search !== "") params.append("search", search);

      const url = `/api/admin/messages?${params.toString()}`;
      console.log("[useMessages] Fetching from:", url);
      console.log("[useMessages] Params:", Object.fromEntries(params));

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      });

      console.log("[useMessages] Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[useMessages] Error response:", errorData);
        throw new Error(
          errorData.message || 
          `Failed to fetch messages: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("[useMessages] Data received:", data);

      if (data.success) {
        setMessages(data.data || []);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("[useMessages] Error:", err.message);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, service, status, search, sortBy]);

  useEffect(() => {
    const timer = window.setTimeout(fetchMessages, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMessages]);

  return { messages, pagination, loading, error, refetch: fetchMessages };
};

/**
 * Hook to fetch single message details
 */
export const useMessageDetail = (messageId) => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessage = useCallback(async () => {
    if (!messageId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      });

      console.log(`[useMessageDetail] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch message: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMessage(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch message");
      }
    } catch (err) {
      console.error("[useMessageDetail] Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    const timer = window.setTimeout(fetchMessage, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMessage]);

  return { message, loading, error, refetch: fetchMessage };
};

/**
 * Hook to send admin reply
 */
export const useSendReply = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendReply = useCallback(async (messageId, reply) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/messages/reply", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
        body: JSON.stringify({
          messageId,
          reply,
        }),
      });

      console.log("[useSendReply] Response status:", response.status);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send reply"
        );
      }

      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      console.error("[useSendReply] Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendReply, loading, error, success };
};

/**
 * Hook to delete a message
 */
export const useDeleteMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteMessage = useCallback(async (messageId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      });

      console.log("[useDeleteMessage] Response status:", response.status);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete message");
      }

      return { success: true, data };
    } catch (err) {
      console.error("[useDeleteMessage] Error:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteMessage, loading, error };
};

/**
 * Hook to fetch dashboard statistics
 */
export const useMessageStats = (enabled = true) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/messages/stats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      });

      console.log("[useMessageStats] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch stats: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch statistics");
      }
    } catch (err) {
      console.error("[useMessageStats] Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(fetchStats, 0);
    return () => window.clearTimeout(timer);
  }, [fetchStats]);

  return { stats, setStats, loading, error, refetch: fetchStats };
};

/**
 * Hook for form state management
 */
export const useMessageForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValues,
    setErrors,
    handleChange,
    handleBlur,
    setFieldError,
    reset,
  };
};

/**
 * Hook for real-time message updates
 * Automatically refetches messages or stats when socket events are received
 */
export const useRealTimeMessageUpdates = ({ onNewMessage }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      // Consumers use this callback to refetch both the list and counters.
      onNewMessage?.(null);
    }, 15000);

    return () => clearInterval(interval);
  }, [onNewMessage]);
};
