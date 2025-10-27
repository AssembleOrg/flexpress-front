"use client";

import {
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/stores/authStore";

export function AuthNavbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDashboard = () => {
    const dashboardPath =
      user?.role === "charter" ? "/driver/dashboard" : "/client/dashboard";
    router.push(dashboardPath);
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

  const handleLogout = () => {
    logout();
    router.push("/");
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "primary.main",
          boxShadow: "0 2px 12px rgba(56, 1, 22, 0.15)",
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
            <Logo size={40} withCircle={true} />
          </Box>

          {/* Desktop Navigation - Links visibles */}
          <Box
            display="flex"
            gap={1}
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, ml: 4 }}
          >
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
              <DashboardIcon sx={{ fontSize: 18 }} />
              Dashboard
            </Box>
            <Box
              component="button"
              onClick={handleProfile}
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
              <PersonIcon sx={{ fontSize: 18 }} />
              Perfil
            </Box>
            <Box
              component="button"
              onClick={handleSettings}
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
              <SettingsIcon sx={{ fontSize: 18 }} />
              Configuración
            </Box>
          </Box>

          {/* Desktop - Logout */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
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
          },
        }}
      >
        <Box sx={{ height: "100%" }}>
          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Info */}
          {user && (
            <Box sx={{ px: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                  }}
                >
                  {user.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Navigation List */}
          <List sx={{ p: 0 }}>
            <ListItem
              component="button"
              onClick={handleDashboard}
              sx={{
                display: "flex",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  sx: { fontWeight: 600 },
                }}
              />
            </ListItem>
            <ListItem
              component="button"
              onClick={handleProfile}
              sx={{
                display: "flex",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon>
                <PersonIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Mi Perfil"
                primaryTypographyProps={{
                  sx: { fontWeight: 600 },
                }}
              />
            </ListItem>
            <ListItem
              component="button"
              onClick={handleSettings}
              sx={{
                display: "flex",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon sx={{ color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Configuración"
                primaryTypographyProps={{
                  sx: { fontWeight: 600 },
                }}
              />
            </ListItem>
            <ListItem
              component="button"
              onClick={handleLogout}
              sx={{
                display: "flex",
                cursor: "pointer",
                borderTop: 1,
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "error.lighter",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  sx: { fontWeight: 600, color: "error.main" },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
