/**
 * Notifications Store (Zustand)
 * Maneja las notificaciones de créditos acreditados
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CreditNotification {
  id: string;
  paymentId: string;
  credits: number;
  amount: number;
  approvedAt: string;
  read: boolean;
}

interface NotificationsState {
  creditNotifications: CreditNotification[];
  addCreditNotification: (
    notification: Omit<CreditNotification, "id" | "read">,
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getRecentUnread: () => CreditNotification[];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      creditNotifications: [],

      addCreditNotification: (notification) => {
        set((state) => ({
          creditNotifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              read: false,
            },
            ...state.creditNotifications,
          ],
        }));
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          creditNotifications: state.creditNotifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          creditNotifications: state.creditNotifications.map((notif) => ({
            ...notif,
            read: true,
          })),
        }));
      },

      getUnreadCount: () => {
        return get().creditNotifications.filter((n) => !n.read).length;
      },

      getRecentUnread: () => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        return get().creditNotifications.filter(
          (notif) => !notif.read && new Date(notif.approvedAt) > twoDaysAgo,
        );
      },
    }),
    {
      name: "flexpress-notifications",
    },
  ),
);
