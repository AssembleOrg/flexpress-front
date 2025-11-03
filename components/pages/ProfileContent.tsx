"use client";

import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
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
import { AddressInput } from "@/components/ui/AddressInput";
import { PageTransition } from "@/components/ui/PageTransition";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

export function ProfileContent() {
  const _router = useRouter();
  const theme = useTheme();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    number: user?.number || "",
    address: user?.address || "",
  });
  const [originData, setOriginData] = useState<{
    address: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [isSavingOrigin, setIsSavingOrigin] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (_error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      number: user?.number || "",
      address: user?.address || "",
    });
    setIsEditing(false);
  };

  const handleSaveOrigin = async () => {
    if (!originData) return;

    setIsSavingOrigin(true);
    try {
      const updatedUser = await authApi.updateUser(user!.id, {
        originAddress: originData.address,
        originLatitude: originData.lat.toString(),
        originLongitude: originData.lon.toString(),
      });
      updateUser(updatedUser);
      toast.success("Ubicación de trabajo actualizada");
      setOriginData(null);
    } catch (error) {
      toast.error("Error al actualizar la ubicación");
      console.error(error);
    } finally {
      setIsSavingOrigin(false);
    }
  };

  return (
    <AuthGuard message="Por favor inicia sesión para ver tu perfil">
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
              <Box
                mb={4}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="h2"
                    pb={3}
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    Mi Perfil
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Gestiona tu información personal
                  </Typography>
                </Box>
                {!isEditing && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                  </motion.div>
                )}
              </Box>

              {/* Profile Card */}
              <Paper
                elevation={2}
                sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  pb={3}
                  borderBottom={1}
                  borderColor="divider"
                >
                  <Avatar
                    src={user?.avatar || undefined}
                    alt={user?.name}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: theme.palette.secondary.main,
                      fontSize: "2rem",
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                    <Box mt={1} display="flex" gap={1}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "primary.light",
                          color: "primary.dark",
                          borderRadius: 1,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {user?.role}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Form Fields */}
                <Box
                  component="form"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: 3,
                    mt: 3,
                  }}
                >
                  <TextField
                    label="Nombre Completo"
                    value={formData.name}
                    name="name"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                    }}
                  />
                  <TextField
                    label="Email"
                    value={formData.email}
                    name="email"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                    }}
                  />
                  <TextField
                    label="Teléfono"
                    value={formData.number}
                    name="number"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1 }} />,
                    }}
                  />
                  <TextField
                    label="Dirección"
                    value={formData.address}
                    name="address"
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                    InputProps={{
                      startAdornment: <LocationOnIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                {isEditing && (
                  <Box display="flex" gap={2} mt={4} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Charter Work Location Section */}
              {user?.role === "charter" && (
                <Paper
                  elevation={2}
                  sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
                >
                  <Box mb={3}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                      }}
                    >
                      Ubicación de Trabajo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Define tu zona principal de operación
                    </Typography>
                  </Box>

                  {originData && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "info.light",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Nueva Ubicación Seleccionada
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {originData.address}
                        </Typography>
                        <Typography variant="caption" color="primary.dark">
                          {originData.lat.toFixed(4)},{" "}
                          {originData.lon.toFixed(4)}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {user?.originAddress && !originData && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "success.light",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{ fontWeight: 600, color: "success.dark" }}
                        >
                          Ubicación Actual
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "success.dark", mt: 0.5 }}
                        >
                          {user?.originAddress}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {originData && (
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSaveOrigin}
                        disabled={isSavingOrigin}
                      >
                        Confirmar Ubicación
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setOriginData(null)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  )}

                  {!originData && (
                    <AddressInput
                      label="Ubicación de Trabajo"
                      placeholder="Ingresa tu ubicación de trabajo..."
                      onAddressSelect={(address, lat, lon) => {
                        setOriginData({ address, lat, lon });
                      }}
                    />
                  )}
                </Paper>
              )}

              {/* Additional Info Cards */}
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                gap={3}
              >
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Créditos Disponibles
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: "secondary.main", fontWeight: 700 }}
                    >
                      {user?.credits || 0} créditos
                    </Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Miembro desde
                    </Typography>
                    <Typography variant="h6">
                      {new Date(user!.createdAt).toLocaleDateString("es-AR")}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          </Container>
        </Box>
      </PageTransition>
    </AuthGuard>
  );
}
