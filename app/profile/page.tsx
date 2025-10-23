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
import { PageTransition } from "@/components/ui/PageTransition";
import { useAuthStore } from "@/lib/stores/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    number: user?.number || "",
    address: user?.address || "",
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
                Por favor inicia sesión para ver tu perfil
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Aquí irá la llamada a la API para actualizar el perfil
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulación

      updateUser(formData);
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");
    } catch (_error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      number: user.number,
      address: user.address,
    });
    setIsEditing(false);
  };

  return (
    <PageTransition>
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
                  sx={{
                    fontSize: { xs: "1.75rem", md: "2.25rem" },
                    fontWeight: 700,
                    color: "primary.main",
                    mb: 1,
                  }}
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
              {/* Avatar Section */}
              <Box
                display="flex"
                alignItems="center"
                gap={3}
                mb={4}
                pb={3}
                borderBottom={1}
                borderColor="divider"
              >
                <Avatar
                  src={user.avatar || undefined}
                  alt={user.name}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: theme.palette.secondary.main,
                    fontSize: "2rem",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
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
                      {user.role}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Form Fields */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                  gap={3}
                >
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                {isEditing && (
                  <Box display="flex" gap={2} mt={4}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      disabled={isLoading}
                      sx={{ flex: 1 }}
                    >
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={isLoading}
                      sx={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>

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
                    {user.credits || 0} créditos
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Miembro desde
                  </Typography>
                  <Typography variant="h6">
                    {new Date(user.createdAt).toLocaleDateString("es-AR")}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </PageTransition>
  );
}
