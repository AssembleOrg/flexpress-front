'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { queryKeys } from './queryFactory';
import { useAuthStore } from '@/lib/stores/authStore';

export function useUnreadNotificationCount() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsApi.fetchUnreadCount,
    enabled: !!token,
    staleTime: 0,
    refetchInterval: 20_000,
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
