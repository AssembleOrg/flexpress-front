"use client";

import { Box, Skeleton, Typography } from "@mui/material";
import {
  CancelOutlined,
  ChatBubbleOutlineRounded,
  CheckCircleOutlineRounded,
  CreditCardOffOutlined,
  CreditScoreOutlined,
  DirectionsCarOutlined,
  FlagOutlined,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { AppNotification } from "@/lib/api/notifications";

export const NOTIFICATION_META: Record<
  string,
  { Icon: React.ElementType; color: string }
> = {
  match_accepted: { Icon: CheckCircleOutlineRounded, color: "#2ECC71" },
  match_rejected: { Icon: CancelOutlined, color: "#E74C3C" },
  match_selected: { Icon: DirectionsCarOutlined, color: "#380116" },
  new_message: { Icon: ChatBubbleOutlineRounded, color: "#3498DB" },
  trip_charter_completed: { Icon: FlagOutlined, color: "#B7850D" },
  payment_approved: { Icon: CreditScoreOutlined, color: "#2ECC71" },
  payment_rejected: { Icon: CreditCardOffOutlined, color: "#E74C3C" },
};

export function getNotificationMeta(type: string) {
  return (
    NOTIFICATION_META[type] ?? { Icon: NotificationsNoneRounded, color: "#503933" }
  );
}

export function RelativeTime({ date }: { date: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        whiteSpace: "nowrap",
        flexShrink: 0,
        ml: 1,
        fontSize: "0.7rem",
      }}
    >
      {formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })}
    </Typography>
  );
}

interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string, actionUrl?: string) => void;
  /** Si true, muestra borde izquierdo de color en lugar del fondo tintado (para la página full) */
  fullPage?: boolean;
}

export function NotificationItem({ notification, onRead, fullPage = false }: NotificationItemProps) {
  const { Icon, color } = getNotificationMeta(notification.type);
  const isUnread = !notification.isRead;

  return (
    <Box
      component="button"
      onClick={() => onRead(notification.id, notification.data?.actionUrl ?? undefined)}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        px: fullPage ? 2.5 : 2,
        py: fullPage ? 2 : 1.5,
        border: "none",
        borderLeft: fullPage && isUnread ? `3px solid ${color}` : "3px solid transparent",
        background: isUnread ? "rgba(56,1,22,0.04)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s ease",
        "&:hover": { background: "rgba(56,1,22,0.08)" },
      }}
    >
      {/* Icon container */}
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          width: fullPage ? 40 : 36,
          height: fullPage ? 40 : 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          bgcolor: `${color}1A`,
          mt: 0.25,
        }}
      >
        <Icon sx={{ fontSize: fullPage ? 20 : 18, color }} />
        {isUnread && (
          <Box
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: color,
              border: "1.5px solid #fff",
            }}
          />
        )}
      </Box>

      {/* Text content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: isUnread ? 700 : 500,
              color: "text.primary",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: fullPage ? "0.9rem" : undefined,
            }}
          >
            {notification.title}
          </Typography>
          <RelativeTime date={notification.createdAt} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            mt: 0.25,
            fontSize: fullPage ? "0.8rem" : undefined,
          }}
        >
          {notification.body}
        </Typography>
      </Box>
    </Box>
  );
}

export function NotificationSkeleton({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, px: fullPage ? 2.5 : 2, py: fullPage ? 2 : 1.5 }}>
      <Skeleton
        variant="circular"
        width={fullPage ? 40 : 36}
        height={fullPage ? 40 : 36}
        sx={{ flexShrink: 0 }}
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="55%" height={16} />
        <Skeleton variant="text" width="85%" height={13} sx={{ mt: 0.5 }} />
      </Box>
    </Box>
  );
}

export function EmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
        px: 3,
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "rgba(56,1,22,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 0.5,
        }}
      >
        <NotificationsNoneRounded sx={{ fontSize: 32, color: "primary.main" }} />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
        Sin notificaciones
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", textAlign: "center", maxWidth: 260 }}
      >
        Te avisaremos cuando haya novedades sobre tus viajes
      </Typography>
    </Box>
  );
}
