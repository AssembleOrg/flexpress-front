"use client";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { useLogout } from "@/lib/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/lib/stores/authStore";

export function AdminNavbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutMutation.mutateAsync();
    router.push("/login");
  };

  const getRoleLabel = () => {
    if (user?.role === "admin") return "Administrador";
    if (user?.role === "subadmin") return "Sub-Administrador";
    return user?.role;
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "#b7850d",
        boxShadow: "0 4px 12px 0 rgba(56, 1, 22, 0.2)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo y Título */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Logo />
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#212121",
                fontSize: { xs: "0.9rem", md: "1.25rem" },
              }}
            >
              FlexPress Gestión
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#380116", display: { xs: "none", md: "block" } }}
            >
              {getRoleLabel()}
            </Typography>
          </Box>
        </Box>

        {/* User Info y Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <Box sx={{ textAlign: "right", display: { xs: "none", md: "flex" }, flexDirection: "column" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#212121" }}
            >
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#380116" }}>
              {user?.email}
            </Typography>
          </Box>

          <Tooltip title="Opciones">
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                color: "#380116",
                "&:hover": {
                  backgroundColor: "rgba(56, 1, 22, 0.15)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "rgba(56, 1, 22, 0.3)",
                  fontSize: "1rem",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => router.push("/admin")}>
              <DashboardIcon sx={{ mr: 1 }} />
              Panel de Control
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              {logoutMutation.isPending ? "Cerrando..." : "Cerrar Sesión"}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
