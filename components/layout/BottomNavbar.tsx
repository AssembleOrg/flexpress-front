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
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserMatches, useCharterMatches } from "@/lib/hooks/queries/useTravelMatchQueries";
import { isMatchExpired } from "@/lib/utils/matchHelpers";
import { MOBILE_BOTTOM_NAV_HEIGHT, Z_INDEX } from "@/lib/constants/mobileDesign";

/**
 * BottomNavbar Component
 *
 * Navegación inferior móvil tipo Uber/native app.
 *
 * Tabs:
 * - Dashboard (siempre visible)
 * - Chat (condicional - solo si hay match activo con conversación)
 * - Historial (siempre visible)
 * - Perfil (siempre visible - config + soporte + perfil)
 *
 * Auto-detecta role (client vs driver) para rutas correctas.
 * Solo visible en mobile (xs/sm breakpoints).
 */
export function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const [value, setValue] = useState<string>("dashboard");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Obtener matches según el role
  const { data: userMatches = [] } = useUserMatches();
  const { data: charterMatches = [] } = useCharterMatches();

  const isCharter = user?.role === "charter";
  const matches = isCharter ? charterMatches : userMatches;

  // Determinar match activo con conversación
  const activeMatch = matches.find((match) => {
    // Client: accepted with conversation (pending is pre-conversation)
    if (!isCharter) {
      if (
        match.status === "rejected" ||
        match.status === "cancelled" ||
        match.status === "expired"
      ) {
        return false;
      }
      if (match.status === "pending" && isMatchExpired(match)) {
        return false;
      }
      if (
        match.tripId &&
        match.trip?.status === "completed" &&
        match.canGiveFeedback === false
      ) {
        return false;
      }
      // 🔧 FIX: Align with dashboard - only accepted matches with conversationId
      return match.status === "accepted" && match.conversationId;
    }

    // Driver: accepted/completed con tripId
    if (!match.tripId) return false;
    if (match.trip?.status === "completed") return false;
    return (
      (match.status === "accepted" || match.status === "completed") &&
      match.conversationId
    );
  });

  // Sincronizar value con pathname actual
  useEffect(() => {
    if (pathname.includes("/dashboard")) setValue("dashboard");
    else if (pathname.includes("/history")) setValue("history");
    else if (pathname.includes("/matching")) setValue("chat");
    // No set value for logout (it's an action, not a page)
  }, [pathname]);

  const handleNavigation = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);

    const baseRoute = isCharter ? "/driver" : "/client";

    switch (newValue) {
      case "dashboard":
        router.push(`${baseRoute}/dashboard`);
        break;
      case "chat":
        if (activeMatch) {
          router.push(`${baseRoute}/trips/matching/${activeMatch.id}`);
        }
        break;
      case "history":
        router.push(`${baseRoute}/trips/history`);
        break;
      case "logout":
        // Open confirmation dialog
        setLogoutDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    clearAuth();
    setLogoutDialogOpen(false);
    router.push("/login");
  };

  // Ocultar navbar si no está autenticado
  if (!user) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: Z_INDEX.bottomNav,
        display: { xs: "block", md: "none" }, // Solo visible en mobile
      }}
    >
      <BottomNavigation
        value={value}
        onChange={handleNavigation}
        showLabels
        sx={{
          height: MOBILE_BOTTOM_NAV_HEIGHT,
        }}
      >
        {/* Dashboard */}
        <BottomNavigationAction
          label="Inicio"
          value="dashboard"
          icon={<Home />}
        />

        {/* Chat (condicional) */}
        {activeMatch && (
          <BottomNavigationAction
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
          />
        )}

        {/* Historial */}
        <BottomNavigationAction
          label="Historial"
          value="history"
          icon={<History />}
        />

        {/* Logout */}
        <BottomNavigationAction
          label="Salir"
          value="logout"
          icon={<Logout />}
        />
      </BottomNavigation>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que quieres cerrar sesión?
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
