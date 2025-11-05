"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { useLogout } from "@/lib/hooks/mutations/useAuthMutations";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";

export function Navbar() {
  const router = useRouter();
  const theme = useTheme();
  const hydrated = useHydrated();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        handleMenuClose();
        router.push("/");
      },
    });
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push("/settings");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(106, 27, 59, 0.08)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
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

          {/* Spacer */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />

          {/* User Section - Solo renderiza después de hidratar para evitar mismatch */}
          {hydrated && isAuthenticated && user ? (
            <Box display="flex" alignItems="center" gap={2}>
              {/* Credits Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Chip
                  icon={<AccountBalanceWalletIcon />}
                  label={`${user.credits || 0} créditos`}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    fontWeight: 600,
                    "& .MuiChip-icon": {
                      color: theme.palette.secondary.contrastText,
                    },
                  }}
                />
              </motion.div>

              {/* User Menu */}
              <Box>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    src={user.avatar || undefined}
                    alt={user.name}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                    },
                  }}
                >
                  {/* User Info */}
                  <Box px={2} py={1} borderBottom={1} borderColor="divider">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>

                  {/* Menu Items */}
                  <MenuItem onClick={handleProfile}>
                    <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Mi Perfil
                  </MenuItem>
                  <MenuItem onClick={handleSettings}>
                    <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Configuración
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          ) : hydrated ? (
            // Guest buttons - también esperamos hidratación
            <Box display="flex" gap={1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label="Iniciar Sesión"
                  onClick={() => router.push("/auth/login")}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 600,
                    bgcolor: "transparent",
                    border: "2px solid",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "rgba(106, 27, 59, 0.04)",
                    },
                  }}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label="Registrarse"
                  onClick={() => router.push("/auth/register")}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: theme.palette.secondary.dark,
                    },
                  }}
                />
              </motion.div>
            </Box>
          ) : (
            // Placeholder mientras se hidrata - minimal para evitar layout shift
            <Box sx={{ width: 150 }} />
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
