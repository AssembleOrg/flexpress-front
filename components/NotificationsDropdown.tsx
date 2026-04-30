"use client";

import { Box, Button, Divider, IconButton, Popover, Typography } from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import {
  useUnreadNotificationCount,
  useNotifications,
} from "@/lib/hooks/queries/useNotificationQueries";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/mutations/useNotificationMutations";
import {
  EmptyState,
  NotificationItem,
  NotificationSkeleton,
} from "@/components/notifications/NotificationItem";

interface NotificationsDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

function NotificationsContent({ onClose }: { onClose: () => void }) {
  const { data: countData } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications(true);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const unreadCount = countData?.count ?? 0;
  const notifications = data?.notifications ?? [];

  const handleRead = (id: string, actionUrl?: string) => {
    markRead({ id, actionUrl });
    if (actionUrl) onClose();
  };

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-lato), sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.75,
                borderRadius: 10,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAll()}
              disabled={isMarkingAll}
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "primary.main",
                textTransform: "none",
                px: 1,
                minHeight: "auto",
                py: 0.5,
                "&:hover": { bgcolor: "rgba(56,1,22,0.06)" },
              }}
            >
              Marcar todas
            </Button>
          )}
          <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {isLoading ? (
          <>
            <NotificationSkeleton />
            <Divider />
            <NotificationSkeleton />
            <Divider />
            <NotificationSkeleton />
          </>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((notif, index) => (
            <Box key={notif.id}>
              <NotificationItem notification={notif} onRead={handleRead} />
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Box>
    </>
  );
}

export function NotificationsDropdown({ open, onClose, anchorEl }: NotificationsDropdownProps) {
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 2,
            boxShadow: "0px 8px 32px rgba(0,0,0,0.12)",
            mt: 0.5,
          },
        },
      }}
    >
      <NotificationsContent onClose={onClose} />
    </Popover>
  );
}
