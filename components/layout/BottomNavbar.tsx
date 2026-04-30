"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Home,
  History,
  Chat,
  Logout,
  NotificationsNoneRounded,
  Receipt,
  DirectionsCar,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserMatches, useCharterMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { useUnreadNotificationCount } from "@/lib/hooks/queries/useNotificationQueries";
import { isActiveTrip } from "@/lib/utils/matchHelpers";
import { MOBILE_BOTTOM_NAV_HEIGHT, Z_INDEX } from "@/lib/constants/mobileDesign";

export function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const [value, setValue] = useState<string>("dashboard");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { data: userMatches = [] } = useUserMatches();
  const { data: charterMatches = [] } = useCharterMatches();
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.count ?? 0;

  const isCharter = user?.role === "charter";
  const matches = isCharter ? charterMatches : userMatches;

  const activeMatch = matches.find((match) => {
    if (!isCharter) return isActiveTrip(match);
    if (!match.tripId) return false;
    if (match.trip?.status === "completed") return false;
    return (
      (match.status === "accepted" || match.status === "completed") &&
      match.conversationId
    );
  });

  useEffect(() => {
    if (pathname.includes("/dashboard")) setValue("dashboard");
    else if (pathname.includes("/notifications")) setValue("notifications");
    else if (pathname.includes("/history")) setValue("history");
    else if (pathname.includes("/payments")) setValue("payments");
    else if (pathname.includes("/matching")) setValue("chat");
    else if (pathname.includes("/vehicles")) setValue("vehicles");
  }, [pathname]);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    const baseRoute = isCharter ? "/driver" : "/client";

    switch (newValue) {
      case "dashboard":
        router.push(`${baseRoute}/dashboard`);
        break;
      case "notifications":
        router.push(`${baseRoute}/notifications`);
        break;
      case "chat":
        if (activeMatch) {
          router.push(`${baseRoute}/trips/matching/${activeMatch.id}`);
        }
        break;
      case "history":
        router.push(`${baseRoute}/trips/history`);
        break;
      case "vehicles":
        router.push("/driver/vehicles");
        break;
      case "payments":
        router.push("/client/payments");
        break;
      case "logout":
        setLogoutDialogOpen(true);
        break;
    }
  };

  const handleLogout = () => {
    clearAuth();
    setLogoutDialogOpen(false);
    router.push("/login");
  };

  if (!user) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: Z_INDEX.bottomNav,
        display: { xs: "block", md: "none" },
      }}
    >
      <BottomNavigation
        value={value}
        onChange={handleNavigation}
        showLabels
        sx={{ height: MOBILE_BOTTOM_NAV_HEIGHT }}
      >
        {/* Inicio */}
        <BottomNavigationAction label="Inicio" value="dashboard" icon={<Home />} />

        {/* Notificaciones — siempre visible, badge con no leídas */}
        <BottomNavigationAction
          label="Avisos"
          value="notifications"
          icon={
            <Badge
              badgeContent={unreadCount}
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  padding: "0 3px",
                },
              }}
            >
              <NotificationsNoneRounded />
            </Badge>
          }
        />

        {/* Chat (condicional) */}
        {activeMatch && (
          <BottomNavigationAction
            label="Chat"
            value="chat"
            icon={
              <Badge color="secondary" variant="dot" invisible={!activeMatch.conversationId}>
                <Chat />
              </Badge>
            }
          />
        )}

        {/* Vehículos (solo charters) */}
        {isCharter && (
          <BottomNavigationAction label="Vehículos" value="vehicles" icon={<DirectionsCar />} />
        )}

        {/* Pagos (solo clientes) */}
        {!isCharter && (
          <BottomNavigationAction label="Pagos" value="payments" icon={<Receipt />} />
        )}

        {/* Historial */}
        <BottomNavigationAction label="Historial" value="history" icon={<History />} />

        {/* Salir */}
        <BottomNavigationAction label="Salir" value="logout" icon={<Logout />} />
      </BottomNavigation>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro que querés cerrar sesión?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">Cancelar</Button>
          <Button onClick={handleLogout} color="error" variant="contained">Salir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
