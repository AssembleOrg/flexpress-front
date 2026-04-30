"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import {
  useUnreadNotificationCount,
} from "@/lib/hooks/queries/useNotificationQueries";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/mutations/useNotificationMutations";
import {
  EmptyState,
  NotificationItem,
  NotificationSkeleton,
} from "./NotificationItem";
import type { AppNotification } from "@/lib/api/notifications";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";

function useNotificationsPaged() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsApi.fetchMyNotifications({ limit: 20 }),
    enabled: !!token,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: countData } = useUnreadNotificationCount();
  const { data, isLoading } = useNotificationsPaged();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const [extraNotifications, setExtraNotifications] = useState<AppNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const unreadCount = countData?.count ?? 0;
  const baseNotifications = data?.notifications ?? [];
  const initialCursor = nextCursor === undefined ? data?.nextCursor : nextCursor;
  const allNotifications = [...baseNotifications, ...extraNotifications];

  const handleRead = (id: string, actionUrl?: string) => {
    markRead({ id, actionUrl });
    // Invalidar para mantener badge sincronizado
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  };

  const handleLoadMore = async () => {
    if (!initialCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await notificationsApi.fetchMyNotifications({
        limit: 20,
        cursor: initialCursor,
      });
      setExtraNotifications((prev) => [...prev, ...result.notifications]);
      setNextCursor(result.nextCursor);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const currentCursor = nextCursor === undefined ? initialCursor : nextCursor;
  const hasMore = !!currentCursor;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "primary.main",
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(56,1,22,0.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontFamily: "var(--font-lato), sans-serif",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Notificaciones
          {unreadCount > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 22,
                height: 22,
                px: 0.75,
                borderRadius: 10,
                bgcolor: "secondary.main",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "secondary.contrastText",
                verticalAlign: "middle",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </Typography>

        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={() => markAll()}
            disabled={isMarkingAll}
            sx={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "none",
              px: 1.5,
              py: 0.5,
              minHeight: "auto",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              "&:disabled": { color: "rgba(255,255,255,0.4)" },
            }}
          >
            Marcar todas
          </Button>
        )}
      </Box>

      {/* List */}
      <Box sx={{ bgcolor: "background.paper", mx: { sm: 2, md: 4 }, mt: { sm: 2 }, borderRadius: { sm: 2 }, overflow: "hidden", boxShadow: { sm: "0 2px 8px rgba(0,0,0,0.06)" } }}>
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Box key={i}>
                <NotificationSkeleton fullPage />
                {i < 4 && <Divider />}
              </Box>
            ))}
          </>
        ) : allNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {allNotifications.map((notif, index) => (
              <Box key={notif.id}>
                <NotificationItem
                  notification={notif}
                  onRead={handleRead}
                  fullPage
                />
                {index < allNotifications.length - 1 && <Divider />}
              </Box>
            ))}

            {/* Load more */}
            {hasMore && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  startIcon={isLoadingMore ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    px: 3,
                    "&:hover": { bgcolor: "rgba(56,1,22,0.04)" },
                  }}
                >
                  {isLoadingMore ? "Cargando..." : "Cargar más"}
                </Button>
              </Box>
            )}

            {!hasMore && allNotifications.length > 0 && (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  No hay más notificaciones
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
