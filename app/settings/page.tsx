"use client";

export const dynamic = "force-dynamic";

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
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { PageTransition } from "@/components/ui/PageTransition";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { getApiErrorMessage } from "@/lib/utils/apiError";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  profilePublic: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const router = useRouter();
  const _theme = useTheme();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(EMPTY_PASSWORD_FORM);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    pushNotifications: true,
    profilePublic: false,
  });

  const handleToggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword) {
      toast.error("Completá la contraseña actual y la nueva");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La contraseña nueva debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        refreshToken,
      });
      toast.success(
        "Contraseña cambiada. Se cerró la sesión en tus otros dispositivos.",
      );
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "No se pudo cambiar la contraseña"),
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Aquí irá la llamada a la API para guardar configuración
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulación

      toast.success("Configuración guardada correctamente");
    } catch (_error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard message="Por favor inicia sesión para acceder a configuración">
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
                        onChange={() =>
                          handleToggleSetting("emailNotifications")
                        }
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
                        onChange={() =>
                          handleToggleSetting("pushNotifications")
                        }
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
                  <PrivacyTipIcon
                    sx={{ fontSize: 28, color: "primary.main" }}
                  />
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
                        Permite que otros usuarios vean tu perfil y
                        calificaciones
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

                <Alert severity="warning" sx={{ mb: 3 }}>
                  Cambia tu contraseña regularmente para mantener tu cuenta
                  segura
                </Alert>

                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField
                    fullWidth
                    label="Contraseña actual"
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    helperText="Mínimo 6 caracteres"
                  />
                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirmá tu nueva contraseña"
                  />
                  <Box>
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword
                        ? "Cambiando..."
                        : "Cambiar contraseña"}
                    </Button>
                  </Box>
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
    </AuthGuard>
  );
}
