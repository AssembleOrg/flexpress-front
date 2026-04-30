"use client";

import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import SaveIcon from "@mui/icons-material/Save";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import StarIcon from "@mui/icons-material/Star";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { AddressInput } from "@/components/ui/AddressInput";
import { PageTransition } from "@/components/ui/PageTransition";
import { useUpdateUserProfile } from "@/lib/hooks/mutations/useAuthMutations";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMyVehicles } from "@/lib/hooks/queries/useVehicleQueries";
import { VerificationStatus } from "@/lib/types/api";

export function ProfileContent() {
  const _router = useRouter();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const updateProfileMutation = useUpdateUserProfile();
  const { data: vehicles = [] } = useMyVehicles();
  const [isEditing, setIsEditing] = useState(false);
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

  // Sincronizar formData con user tras updates del store
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        number: user.number || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    if (!user?.id) return;

    // Validaciones
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!formData.address.trim() || formData.address.length < 10) {
      toast.error("La dirección debe tener al menos 10 caracteres");
      return;
    }
    if (formData.address.length > 200) {
      toast.error("La dirección no puede exceder 200 caracteres");
      return;
    }

    updateProfileMutation.mutate(
      {
        userId: user.id,
        data: {
          name: formData.name,
          email: formData.email,
          number: formData.number,
          address: formData.address,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false); // Salir del modo edición
        },
      }
    );
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

  const handleSaveOrigin = () => {
    if (!originData || !user?.id) return;

    updateProfileMutation.mutate(
      {
        userId: user.id,
        data: {
          originAddress: originData.address,
          originLatitude: originData.lat.toString(),
          originLongitude: originData.lon.toString(),
        },
      },
      {
        onSuccess: () => {
          setOriginData(null); // Limpiar estado local
        },
      }
    );
  };

  return (
    <>
      <AuthGuard message="Por favor inicia sesión para ver tu perfil">
        <PageTransition>
          <AuthNavbar />
          <Box
            sx={{
              bgcolor: "background.default",
              minHeight: "calc(100vh - 64px)",
              py: 4,
              pb: { xs: 12, md: 4 },
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
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={2}
                >
                  <Box>
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.1 }}
                    >
                      Mi Perfil
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                      Gestiona tu información personal
                    </Typography>
                  </Box>
                  {!isEditing && user?.role === "user" && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditing(true)}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        Editar
                      </Button>
                    </motion.div>
                  )}
                </Box>
              </Box>

              {/* Profile Card */}
              <Paper
                elevation={2}
                sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "center", sm: "flex-start" }}
                  gap={{ xs: 2, sm: 3 }}
                  pb={3}
                  borderBottom={1}
                  borderColor="divider"
                >
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
                    <Avatar
                      src={user?.avatar || undefined}
                      alt={user?.name}
                      sx={{
                        width: { xs: 100, md: 120 },
                        height: { xs: 100, md: 120 },
                        bgcolor: theme.palette.primary.main,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        border: `3px solid ${theme.palette.secondary.main}`,
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                  </Box>
                  <Box textAlign={{ xs: "center", sm: "left" }}>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {user?.email}
                    </Typography>
                    <Box mt={1.5} display="flex" gap={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "secondary.main",
                          color: "white",
                          borderRadius: 1,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                          letterSpacing: "0.03em",
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
                    disabled
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
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
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

              {/* Charter Vehicles Section */}
              {user?.role === "charter" && (
                <Paper
                  elevation={2}
                  sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, mb: 3 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <DirectionsCarIcon /> Mis Vehículos
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        {vehicles.length > 0
                          ? `${vehicles.length} vehículo${vehicles.length > 1 ? "s" : ""} registrado${vehicles.length > 1 ? "s" : ""}`
                          : "Sin vehículos registrados"}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/driver/vehicles")}
                    >
                      Gestionar
                    </Button>
                  </Box>

                  {vehicles.length > 0 && (
                    <Box sx={{ mb: 2, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                      {vehicles.slice(0, 3).map((vehicle, index) => (
                        <Box key={vehicle.id}>
                          {index > 0 && <Divider />}
                          <Box
                            sx={{
                              px: 2,
                              py: 1.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              bgcolor: "background.paper",
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <DirectionsCarIcon sx={{ color: "primary.light", fontSize: "1.2rem" }} />
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                                >
                                  {vehicle.plate}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {vehicle.brand || "Sin marca"}
                                  {vehicle.model && ` · ${vehicle.model}`}
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                bgcolor:
                                  vehicle.verificationStatus === VerificationStatus.VERIFIED
                                    ? "success.light"
                                    : vehicle.verificationStatus === VerificationStatus.PENDING
                                    ? "warning.light"
                                    : "error.light",
                                borderRadius: 1,
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {vehicle.verificationStatus === VerificationStatus.VERIFIED
                                ? "Verificado"
                                : vehicle.verificationStatus === VerificationStatus.PENDING
                                ? "Pendiente"
                                : "Rechazado"}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

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
                        bgcolor: "primary.main",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      <LocationOnIcon sx={{ color: "secondary.main", mt: 0.25, flexShrink: 0 }} />
                      <Box>
                        <Typography
                          sx={{ fontWeight: 700, color: "secondary.main", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
                        >
                          Ubicación Actual
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "white", mt: 0.5, lineHeight: 1.4 }}
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
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Guardando..." : "Confirmar Ubicación"}
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
                      value={user?.originAddress || ""}
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
                gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))"
                gap={3}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                  }}
                >
                  <CardContent sx={{ pb: "16px !important" }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <StarIcon sx={{ color: "secondary.main", fontSize: "1.1rem" }} />
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                        Créditos Disponibles
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{ color: "secondary.main", fontWeight: 700 }}
                    >
                      {user?.credits || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                      créditos
                    </Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent sx={{ pb: "16px !important" }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayIcon sx={{ color: "primary.main", fontSize: "1.1rem" }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Miembro desde
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {new Date(
                        user?.createdAt || new Date(),
                      ).toLocaleDateString("es-AR", { year: "numeric", month: "long" })}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </motion.div>
          </Container>
          </Box>
        </PageTransition>
      </AuthGuard>
      <BottomNavbar />
    </>
  );
}
