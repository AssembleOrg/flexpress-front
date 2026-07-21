"use client";

import {
  Chat,
  DirectionsCar,
  FlagOutlined,
  History,
  Home,
  Logout,
  NotificationsNoneRounded,
  PersonOutline,
  Receipt,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  Z_INDEX,
} from "@/lib/constants/mobileDesign";
import { useUnreadNotificationCount } from "@/lib/hooks/queries/useNotificationQueries";
import {
  useCharterMatches,
  useUserMatches,
} from "@/lib/hooks/queries/useTravelMatchQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { VerificationStatus } from "@/lib/types/api";
import { isActiveTrip } from "@/lib/utils/matchHelpers";

interface NavItemProps {
  label: string;
  value: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavItem({
  label,
  value: _value,
  icon,
  active,
  onClick,
}: NavItemProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        minWidth: 64,
        height: "100%",
        px: 1,
        gap: "2px",
        color: active ? "primary.main" : "text.secondary",
        opacity: active ? 1 : 0.65,
        transition: "color 0.15s, opacity 0.15s",
        borderRadius: 1,
        "&:hover": {
          opacity: 1,
          bgcolor: "action.hover",
        },
      }}
    >
      <Box sx={{ fontSize: 22, display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: "0.62rem",
          fontWeight: active ? 600 : 400,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

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
  // Charter pendiente/rechazado: solo puede cargar vehículos y ver su estado.
  // Reducimos el nav a Inicio + Salir hasta que un admin lo verifique.
  const isUnverifiedCharter =
    isCharter && user?.verificationStatus !== VerificationStatus.VERIFIED;
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
    else if (pathname.includes("/profile")) setValue("profile");
    else if (pathname.includes("/reports")) setValue("reports");
  }, [pathname]);

  const navigate = (newValue: string) => {
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
        router.push(`${baseRoute}/payments`);
        break;
      case "profile":
        router.push("/profile");
        break;
      case "reports":
        router.push(`${baseRoute}/reports`);
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
        display: { xs: "flex", md: "none" },
        height: MOBILE_BOTTOM_NAV_HEIGHT,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Dashboard fijo a la izquierda */}
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <NavItem
          label="Inicio"
          value="dashboard"
          icon={<Home />}
          active={value === "dashboard"}
          onClick={() => navigate("dashboard")}
        />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Ítems scrolleables */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          px: 0.5,
        }}
      >
        {!isUnverifiedCharter && (
          <>
            <NavItem
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
              active={value === "notifications"}
              onClick={() => navigate("notifications")}
            />

            {activeMatch && (
              <NavItem
                label="Chat"
                value="chat"
                icon={
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={!activeMatch.conversationId}
                  >
                    <Chat />
                  </Badge>
                }
                active={value === "chat"}
                onClick={() => navigate("chat")}
              />
            )}

            {isCharter && (
              <NavItem
                label="Vehículos"
                value="vehicles"
                icon={<DirectionsCar />}
                active={value === "vehicles"}
                onClick={() => navigate("vehicles")}
              />
            )}

            <NavItem
              label="Pagos"
              value="payments"
              icon={<Receipt />}
              active={value === "payments"}
              onClick={() => navigate("payments")}
            />

            <NavItem
              label="Historial"
              value="history"
              icon={<History />}
              active={value === "history"}
              onClick={() => navigate("history")}
            />

            <NavItem
              label="Reportes"
              value="reports"
              icon={<FlagOutlined />}
              active={value === "reports"}
              onClick={() => navigate("reports")}
            />

            <NavItem
              label="Perfil"
              value="profile"
              icon={<PersonOutline />}
              active={value === "profile"}
              onClick={() => navigate("profile")}
            />
          </>
        )}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

      {/* Salir fijo a la derecha */}
      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <NavItem
          label="Salir"
          value="logout"
          icon={<Logout />}
          active={false}
          onClick={() => navigate("logout")}
        />
      </Box>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Salir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
