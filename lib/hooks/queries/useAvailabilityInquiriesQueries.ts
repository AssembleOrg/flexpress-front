"use client";

import { useQuery } from "@tanstack/react-query";
import { availabilityInquiriesApi } from "@/lib/api/availabilityInquiries";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

/**
 * Consultas enviadas por el cliente.
 * Refresca al volver al dashboard. WebSocket invalida cuando llega notif.
 */
export function useSentInquiries() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.availabilityInquiries.sent(),
    queryFn: () => availabilityInquiriesApi.listSent(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: user?.role === "user",
  });
}

/**
 * Consultas pendientes recibidas por el charter.
 * Polling corto + invalidación por WebSocket (notification:new).
 */
export function useReceivedInquiries() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.availabilityInquiries.received(),
    queryFn: () => availabilityInquiriesApi.listReceived(),
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: user?.role === "charter",
  });
}
