"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { getSocketConnected } from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

export function useUnreadNotificationCount() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsApi.fetchUnreadCount,
    enabled: !!token,
    staleTime: 0,
    // notification:new (useWebSocket) invalida el badge al instante. Con socket
    // activo solo queda una red de seguridad de 5 min; si cae → fallback 20s.
    refetchInterval: () => (getSocketConnected() ? 5 * 60_000 : 20_000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useNotifications(enabled: boolean) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsApi.fetchMyNotifications({ limit: 20 }),
    enabled: !!token && enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
