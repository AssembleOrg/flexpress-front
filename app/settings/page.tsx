"use client";

import NotificationsIcon from "@mui/icons-material/Notifications";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import SaveIcon from "@mui/icons-material/Save";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { useAuthStore } from "@/lib/stores/authStore";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  profilePublic: boolean;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const _theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    pushNotifications: true,
    profilePublic: false,
    newPassword: "",
    confirmPassword: "",
  });

  if (!isAuthenticated || !user) {
    return (
      <PageTransition>
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <Container maxWidth="md">
            <Box textAlign="center">
              <Typography variant="h4" color="text.secondary" gutterBottom>
                Por favor inicia sesión para acceder a configuración
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push("/auth/login")}
                sx={{ mt: 2 }}
              >
                Ir a Login
              </Button>
            </Box>
          </Container>
        </Box>
      </PageTransition>
    );
  }

  const handleToggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSettings = async () => {
    if (
      settings.newPassword &&
      settings.newPassword !== settings.confirmPassword
    ) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Aquí irá la llamada a la API para guardar configuración
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulación

      toast.success("Configuración guardada correctamente");
      setSettings((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (_error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <AuthNavbar />
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "calc(100vh - 64px)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <Box mb={4}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  fontWeight: 700,
                  color: "primary.main",
                  mb: 1,
                }}
              >
                Configuración
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Administra tu cuenta y preferencias
              </Typography>
            </Box>

            {/* Notifications Settings */}
            <Paper
              elevation={2}
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <NotificationsIcon
                  sx={{ fontSize: 28, color: "primary.main" }}
                />
                <Typography variant="h6" fontWeight={700}>
                  Notificaciones
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={() => handleToggleSetting("emailNotifications")}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Notificaciones por Email
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recibe actualizaciones importantes sobre tus viajes y
                        mensajes
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={() => handleToggleSetting("pushNotifications")}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Notificaciones Push
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recibe alertas en tiempo real en tu dispositivo
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Paper>

            {/* Privacy Settings */}
            <Paper
              elevation={2}
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <PrivacyTipIcon sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  Privacidad
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.profilePublic}
                    onChange={() => handleToggleSetting("profilePublic")}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Perfil Público
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Permite que otros usuarios vean tu perfil y calificaciones
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            {/* Security Settings */}
            <Paper
              elevation={2}
              sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <SecurityIcon sx={{ fontSize: 28, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  Seguridad
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                Cambia tu contraseña regularmente para mantener tu cuenta segura
              </Alert>

              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type="password"
                  name="newPassword"
                  value={settings.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Dejá en blanco para no cambiar"
                />
                <TextField
                  fullWidth
                  label="Confirmar Contraseña"
                  type="password"
                  name="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmá tu nueva contraseña"
                />
              </Box>
            </Paper>

            {/* Save Button */}
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={isLoading}
                sx={{ flex: { xs: 1, md: "auto" } }}
              >
                Guardar Cambios
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.back()}
                sx={{ flex: { xs: 1, md: "auto" } }}
              >
                Volver Atrás
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </PageTransition>
  );
}
