'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/hooks/queries/queryFactory';
import type { AppNotification, NotificationsResponse, UnreadCountResponse } from '@/lib/api/notifications';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id }: { id: string; actionUrl?: string }) =>
      notificationsApi.markNotificationRead(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      const prevCount = queryClient.getQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount()
      );
      const prevList = queryClient.getQueryData<NotificationsResponse>(
        queryKeys.notifications.list()
      );

      queryClient.setQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount(),
        (old) => ({ count: Math.max((old?.count ?? 1) - 1, 0) })
      );

      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n: AppNotification) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
          };
        }
      );

      return { prevCount, prevList };
    },

    onError: (_err, _vars, context) => {
      if (context?.prevCount) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.prevCount);
      }
      if (context?.prevList) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.prevList);
      }
    },

    onSuccess: (_data, { actionUrl }) => {
      if (actionUrl) {
        router.push(actionUrl);
      }
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllNotificationsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });

      const prevCount = queryClient.getQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount()
      );
      const prevList = queryClient.getQueryData<NotificationsResponse>(
        queryKeys.notifications.list()
      );

      queryClient.setQueryData<UnreadCountResponse>(
        queryKeys.notifications.unreadCount(),
        { count: 0 }
      );

      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n: AppNotification) => ({
              ...n,
              isRead: true,
              readAt: new Date().toISOString(),
            })),
          };
        }
      );

      return { prevCount, prevList };
    },

    onError: (_err, _vars, context) => {
      if (context?.prevCount) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.prevCount);
      }
      if (context?.prevList) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.prevList);
      }
    },
  });
}
