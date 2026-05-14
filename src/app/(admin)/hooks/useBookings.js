import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { initializeSocket, SOCKET_EVENTS } from "@/lib/socket";

const fetchBookings = async (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const res = await fetch(`/api/admin/bookings?${params.toString()}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch bookings" }));
    throw new Error(error.message || "Failed to fetch bookings");
  }
  const data = await res.json();
  return data.data || [];
};

const fetchStats = async () => {
  const res = await fetch("/api/admin/bookings/stats");
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch stats" }));
    throw new Error(error.message || "Failed to fetch stats");
  }
  const data = await res.json();
  return data.data;
};

const updateBookingStatus = async ({ id, ...data }) => {
  const res = await fetch(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json().catch(() => ({ message: "Invalid server response" }));
  if (!res.ok) throw new Error(result.message || "Failed to update booking");
  return result;
};

const deleteBooking = async (id) => {
  const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to delete booking" }));
    throw new Error(error.message || "Failed to delete booking");
  }
  const data = await res.json();
  return data.data;
};

export const useBookings = (filters) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => fetchBookings(filters),
  });
};

export const useBookingDetail = (id) => {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/bookings/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to fetch booking detail" }));
        throw new Error(error.message || "Failed to fetch booking detail");
      }
      const data = await res.json();
      return data.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: ["booking-stats"],
    queryFn: fetchStats,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: (response) => {
      const updatedData = response.data;
      if (updatedData?._id) {
        queryClient.setQueryData(["booking", updatedData._id], updatedData);
        queryClient.invalidateQueries({ queryKey: ["booking", updatedData._id] });
      }
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      toast.success("Booking successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
    },
    onError: (err) => {
        toast.error(err.message);
    }
  });
};

export const useRealTimeBookingUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Socket.io Integration (Legacy / Alternative)
    const socket = initializeSocket();
    if (socket) {
      socket.on(SOCKET_EVENTS.BOOKING_STATS_UPDATED, () => {
        queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
      });

      socket.on(SOCKET_EVENTS.NEW_BOOKING, () => {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
      });

      socket.on(SOCKET_EVENTS.BOOKING_UPDATED, (data) => {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
        if (data?._id || data?.id) {
          queryClient.invalidateQueries({ queryKey: ["booking", data._id || data.id] });
        }
      });

      socket.on(SOCKET_EVENTS.BOOKING_DELETED, () => {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
      });
    }

    // 2. High-Performance SSE Integration (Preferred for Admin Muhyo Tech)
    const eventSource = new EventSource("/api/admin/events");

    eventSource.addEventListener("booking", (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("[SSE] Booking Event Received:", data);
        
        // Show toast for new bookings if we are not the ones who created it (though usually it's from client side)
        if (data.status === 'new' && !data.isRead) {
          toast.info(`New Appointment: ${data.name} for ${data.service}`, {
            description: `Scheduled for ${data.preferredDate} at ${data.preferredTime}`
          });
        }

        // Invalidate queries to trigger real-time UI refresh
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
        
        if (data._id || data.id) {
          queryClient.invalidateQueries({ queryKey: ["booking", data._id || data.id] });
        }
      } catch (err) {
        console.error("[SSE] Failed to process booking event:", err);
      }
    });

    eventSource.addEventListener("stats", () => {
      console.log("[SSE] Universal Stats Refresh Triggered");
      queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
    });

    eventSource.onerror = (err) => {
      console.error("[SSE] Connection Interrupted for Booking Stream:", err);
      eventSource.close();
    };

    return () => {
      socket?.off(SOCKET_EVENTS.NEW_BOOKING);
      socket?.off(SOCKET_EVENTS.BOOKING_UPDATED);
      socket?.off(SOCKET_EVENTS.BOOKING_DELETED);
      socket?.off(SOCKET_EVENTS.BOOKING_STATS_UPDATED);
      eventSource.close();
    };
  }, [queryClient]);
};
