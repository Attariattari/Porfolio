import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { initializeSocket, SOCKET_EVENTS, disposeSocket } from "@/lib/socket";

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
    const socket = initializeSocket();
    if (!socket) return;

    const refreshBookings = () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-stats"] });
    };

    socket.on(SOCKET_EVENTS.NEW_BOOKING, refreshBookings);
    socket.on(SOCKET_EVENTS.BOOKING_UPDATED, refreshBookings);
    socket.on(SOCKET_EVENTS.BOOKING_DELETED, refreshBookings);
    socket.on(SOCKET_EVENTS.BOOKING_STATS_UPDATED, refreshBookings);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_BOOKING, refreshBookings);
      socket.off(SOCKET_EVENTS.BOOKING_UPDATED, refreshBookings);
      socket.off(SOCKET_EVENTS.BOOKING_DELETED, refreshBookings);
      socket.off(SOCKET_EVENTS.BOOKING_STATS_UPDATED, refreshBookings);
      disposeSocket(socket);
    };
  }, [queryClient]);
};
