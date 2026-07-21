"use client";

import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as DirectionsCarIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  NotificationsNoneRounded as NotificationsIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  FlagOutlined as ReportsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { useLogout } from "@/lib/hooks/mutations/useAuthMutations";
import { useUnreadNotificationCount } from "@/lib/hooks/queries/useNotificationQueries";
import {
  useCharterMatches,
  useUserMatches,
} from "@/lib/hooks/queries/useTravelMatchQueries";
import { useAuthStore } from "@/lib/stores/authStore";
import { VerificationStatus } from "@/lib/types/api";
import { isActiveTrip } from "@/lib/utils/matchHelpers";

export function AuthNavbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync logic with BottomNavbar
  const { data: userMatches = [] } = useUserMatches();
  const { data: charterMatches = [] } = useCharterMatches();

  const isCharter = user?.role === "charter";
  // Charter pendiente/rechazado: solo Inicio + Salir (igual que BottomNavbar).
  const isUnverifiedCharter =
    isCharter && user?.verificationStatus !== VerificationStatus.VERIFIED;
  const matches = isCharter ? charterMatches : userMatches;

  // Determinar match activo con conversación (Lógica idéntica a BottomNavbar)
  const activeMatch = matches.find((match) => {
    // Client: Use centralized logic
    if (!isCharter) {
      return isActiveTrip(match);
    }

    // Driver: accepted/completed con tripId
    if (!match.tripId) return false;
    if (match.trip?.status === "completed") return false;
    return (
      (match.status === "accepted" || match.status === "completed") &&
      match.conversationId
    );
  });

  const hasActiveChat = !!activeMatch;

  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.count ?? 0;
  const baseRoute = isCharter ? "/driver" : "/client";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDashboard = () => {
    const dashboardPath =
      user?.role === "charter" ? "/driver/dashboard" : "/client/dashboard";
    router.push(dashboardPath);
    setMobileOpen(false);
  };

  const handleHistory = () => {
    const historyPath =
      user?.role === "charter"
        ? "/driver/trips/history"
        : "/client/trips/history";
    router.push(historyPath);
    setMobileOpen(false);
  };

  const handlePayments = () => {
    router.push(`${baseRoute}/payments`);
    setMobileOpen(false);
  };

  const handleChat = () => {
    if (activeMatch) {
      const chatPath =
        user?.role === "charter"
          ? `/driver/trips/matching/${activeMatch.id}`
          : `/client/trips/matching/${activeMatch.id}`;
      router.push(chatPath);
    }
    setMobileOpen(false);
  };

  const handleProfile = () => {
    router.push("/profile");
    setMobileOpen(false);
  };

  const handleSettings = () => {
    router.push("/settings");
    setMobileOpen(false);
  };

  const handleNotifications = () => {
    router.push(`${baseRoute}/notifications`);
    setMobileOpen(false);
  };

  const handleReports = () => {
    router.push(`${baseRoute}/reports`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
        setMobileOpen(false);
      },
    });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "primary.main",
          boxShadow: "0 2px 12px rgba(56, 1, 22, 0.15)",
          display: { xs: "none", md: "flex" }, // Ocultar en mobile (usamos BottomNavbar)
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ cursor: "pointer", flexGrow: { xs: 1, md: 0 } }}
            onClick={() => router.push("/")}
          >
            <Logo size={50} variant="white" />
          </Box>

          {/* Desktop Navigation - Links visibles */}
          <Box
            display="flex"
            gap={1}
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, ml: 4 }}
          >
            {/* Inicio / Dashboard */}
            <Box
              component="button"
              onClick={handleDashboard}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <HomeIcon sx={{ fontSize: 18 }} />
              Inicio
            </Box>

            {!isUnverifiedCharter && (
              <>
            {/* Chat (Condicional) */}
            {hasActiveChat && (
              <Box
                component="button"
                onClick={handleChat}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  p: 1,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ChatIcon sx={{ fontSize: 18 }} />
                Chat
              </Box>
            )}

            {/* Pagos (clientes y charters) */}
            {(user?.role === "user" || user?.role === "charter") && (
              <Box
                component="button"
                onClick={handlePayments}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  p: 1,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <PaymentIcon sx={{ fontSize: 18 }} />
                Pagos
              </Box>
            )}

            {/* Historial */}
            <Box
              component="button"
              onClick={handleHistory}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <HistoryIcon sx={{ fontSize: 18 }} />
              Historial
            </Box>

            {/* Vehículos (Solo Charters) */}
            {isCharter && (
              <Box
                component="button"
                onClick={() => router.push("/driver/vehicles")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  p: 1,
                  borderRadius: 1,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <DirectionsCarIcon sx={{ fontSize: 18 }} />
                Vehículos
              </Box>
            )}

            {/* Avisos */}
            <Box
              component="button"
              onClick={handleNotifications}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                max={99}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#DCA621",
                    color: "#380116",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    minWidth: 15,
                    height: 15,
                    padding: "0 3px",
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: 18 }} />
              </Badge>
              Avisos
            </Box>

            {/* Reportes */}
            <Box
              component="button"
              onClick={handleReports}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                p: 1,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
              }}
            >
              <ReportsIcon sx={{ fontSize: 18 }} />
              Reportes
            </Box>
              </>
            )}
          </Box>

          {/* Desktop - Profile & Logout */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Profile Avatar */}
            <Tooltip title="Mi perfil" arrow>
              <SignedAvatar
                onClick={handleProfile}
                value={user?.avatar}
                sx={{
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  bgcolor: "#DCA621",
                  color: "#380116",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    border: "2px solid rgba(255, 255, 255, 0.9)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                {user?.avatar
                  ? null
                  : (user?.name?.[0]?.toUpperCase() ?? <PersonIcon />)}
              </SignedAvatar>
            </Tooltip>

            {/* Logout Button */}
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              title="Cerrar sesión"
            >
              <LogoutIcon />
            </IconButton>
          </Box>

          {/* Mobile - Burger Menu */}
          <IconButton
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "white",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 280,
            background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header Section */}
          <Box
            sx={{
              p: 2.5,
              borderBottom: "2px solid #DCA621",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Logo size={40} variant="white" />
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Info */}
          {user && (
            <Box
              sx={{
                px: 2.5,
                py: 2.5,
                borderBottom: "1px solid rgba(220, 166, 33, 0.3)",
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar
                  sx={{
                    bgcolor: "#DCA621",
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    color: "#380116",
                  }}
                >
                  {user.name?.[0]}
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "white",
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(220, 166, 33, 0.8)",
                      fontWeight: 500,
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Navigation List */}
          <List sx={{ p: 0, flex: 1, overflowY: "auto" }}>
            {/* Dashboard */}
            <ListItem
              component="button"
              onClick={handleDashboard}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>

            {!isUnverifiedCharter && (
              <>
            {/* Avisos */}
            <ListItem
              component="button"
              onClick={handleNotifications}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <NotificationsIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Avisos"
                secondary={
                  unreadCount > 0 ? `${unreadCount} sin leer` : undefined
                }
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
                secondaryTypographyProps={{
                  sx: { color: "rgba(220,166,33,0.7)", fontSize: "0.75rem" },
                }}
              />
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  sx={{
                    bgcolor: "#DCA621",
                    color: "#380116",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              )}
            </ListItem>

            {/* Chat (condicional) */}
            {hasActiveChat && (
              <ListItem
                component="button"
                onClick={handleChat}
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(220, 166, 33, 0.2)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <ListItemIcon>
                  <ChatIcon sx={{ color: "#DCA621", fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Chat Activo"
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: 600,
                      color: "#DCA621",
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </ListItem>
            )}

            {/* Pagos (clientes y charters) */}
            {(user?.role === "user" || user?.role === "charter") && (
              <ListItem
                component="button"
                onClick={handlePayments}
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(220, 166, 33, 0.2)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <ListItemIcon>
                  <PaymentIcon sx={{ color: "#DCA621", fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Pagos"
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: 600,
                      color: "#DCA621",
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </ListItem>
            )}

            {/* Historial */}
            <ListItem
              component="button"
              onClick={handleHistory}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <HistoryIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Historial"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>

            {/* Vehículos (solo charters) */}
            {isCharter && (
              <ListItem
                component="button"
                onClick={() => {
                  router.push("/driver/vehicles");
                  setMobileOpen(false);
                }}
                sx={{
                  display: "flex",
                  cursor: "pointer",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(220, 166, 33, 0.2)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <ListItemIcon>
                  <DirectionsCarIcon sx={{ color: "#DCA621", fontSize: 22 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Vehículos"
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: 600,
                      color: "#DCA621",
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </ListItem>
            )}

            {/* Reportes */}
            <ListItem
              component="button"
              onClick={handleReports}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <ReportsIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Reportes"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>

            {/* Mi Perfil */}
            <ListItem
              component="button"
              onClick={handleProfile}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Mi Perfil"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>

            {/* Configuración */}
            <ListItem
              component="button"
              onClick={handleSettings}
              sx={{
                display: "flex",
                cursor: "pointer",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Configuración"
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 600,
                    color: "#DCA621",
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>
              </>
            )}

            {/* Cerrar Sesión */}
            <ListItem
              component="button"
              onClick={handleLogout}
              sx={{
                display: "flex",
                cursor: "pointer",
                borderTop: "2px solid rgba(220, 166, 33, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(220, 166, 33, 0.2)",
                  transform: "translateX(8px)",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "#DCA621", fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  sx: { fontWeight: 800, color: "#DCA621", fontSize: "1rem" },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
