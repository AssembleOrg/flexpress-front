"use client";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";

interface NotificationsDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export function NotificationsDropdown({
  open,
  onClose,
  anchorEl,
}: NotificationsDropdownProps) {
  const { creditNotifications, markAsRead, markAllAsRead } =
    useNotificationsStore();
  const unreadNotifications = creditNotifications.filter((n) => !n.read);

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ width: 320, maxHeight: 400, overflow: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">Notificaciones</Typography>
          {unreadNotifications.length > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Marcar leídas
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <List sx={{ p: 0 }}>
          {unreadNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    No hay notificaciones nuevas
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            unreadNotifications.map((notif) => (
              <ListItem
                key={notif.id}
                onClick={() => {
                  markAsRead(notif.id);
                }}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ¡{notif.credits} créditos acreditados!
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Monto: ${notif.amount.toLocaleString("es-AR")}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Popover>
  );
}
