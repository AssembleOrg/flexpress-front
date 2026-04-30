import api from '@/lib/api';
import type { ApiResponse } from '@/lib/types/api';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  priority: 'HIGH' | 'LOW';
  isRead: boolean;
  readAt: string | null;
  data: { actionUrl?: string; matchId?: string; tripId?: string; conversationId?: string } | null;
  dedupeKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  nextCursor: string | null;
}

export interface FetchNotificationsParams {
  limit?: number;
  cursor?: string;
  onlyUnread?: boolean;
}

export const notificationsApi = {
  fetchUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get<ApiResponse<UnreadCountResponse>>(
      '/notifications/unread-count'
    );
    return response.data.data!;
  },

  fetchMyNotifications: async (
    params?: FetchNotificationsParams
  ): Promise<NotificationsResponse> => {
    const response = await api.get<ApiResponse<NotificationsResponse>>(
      '/notifications/my',
      { params }
    );
    return response.data.data!;
  },

  markNotificationRead: async (id: string): Promise<AppNotification> => {
    const response = await api.patch<ApiResponse<AppNotification>>(
      `/notifications/${id}/read`
    );
    return response.data.data!;
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
