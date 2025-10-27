"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DriveEta, Person } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/stores/authStore";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un email válido"),
    number: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
    address: z.string().min(5, "Dirección debe tener al menos 5 caracteres"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [userRole, setUserRole] = useState<"client" | "driver">("client");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { authApi } = await import("@/lib/api/auth");
      const { login } = useAuthStore.getState();

      const registerData = {
        email: data.email,
        password: data.password,
        name: data.name,
        number: data.number,
        address: data.address,
        role: userRole === "driver" ? ("charter" as const) : ("user" as const),
      };

      const response = await authApi.register(registerData);

      login(response.user, response.token);
      toast.success("Cuenta creada exitosamente");

      const targetPath =
        userRole === "driver" ? "/driver/dashboard" : "/client/dashboard";
      router.push(targetPath);
    } catch (error) {
      toast.error("Error al registrarse");
      console.error("Register error:", error);
    }
  };

  const handleRoleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRole: "client" | "driver" | null,
  ) => {
    if (newRole !== null) {
      setUserRole(newRole);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,166,33,0.08) 0%, transparent 70%)",
          top: -100,
          left: -100,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(220,166,33,0.05) 0%, transparent 70%)",
          bottom: -50,
          right: -50,
          zIndex: 0,
        }}
      />

      {/* Header with Logo */}
      <Box
        sx={{
          pt: 4,
          pb: 2,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Logo size={80} />
      </Box>

      {/* Content Container */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          px: 2,
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Card
            elevation={0}
            sx={{
              backdropFilter: "blur(20px)",
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {/* Título */}
              <Box textAlign="center" mb={4}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  Crear Cuenta
                </Typography>
                <Typography variant="h6" color="text.secondary" mb={3}>
                  Únete a Flexpress
                </Typography>

                {/* Selector de rol */}
                <ToggleButtonGroup
                  value={userRole}
                  exclusive
                  onChange={handleRoleChange}
                  aria-label="tipo de usuario"
                  sx={{ mb: 3 }}
                >
                  <ToggleButton
                    value="client"
                    aria-label="cliente"
                    sx={{ px: 3 }}
                  >
                    <Person sx={{ mr: 1 }} />
                    Soy Cliente
                  </ToggleButton>
                  <ToggleButton
                    value="driver"
                    aria-label="conductor"
                    sx={{ px: 3 }}
                  >
                    <DriveEta sx={{ mr: 1 }} />
                    Soy Conductor
                  </ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="body2" color="text.secondary">
                  {userRole === "client"
                    ? "Necesito transportar objetos"
                    : "Tengo vehículo y quiero generar ingresos"}
                </Typography>
              </Box>

              {/* Formulario */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  {...register("name")}
                  label="Nombre Completo"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  placeholder="Ej: María García"
                />

                <TextField
                  {...register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <TextField
                  {...register("number")}
                  label="Teléfono"
                  type="tel"
                  fullWidth
                  margin="normal"
                  error={!!errors.number}
                  helperText={errors.number?.message}
                  placeholder="Ej: +54 9 11 1234-5678"
                />

                <TextField
                  {...register("address")}
                  label="Dirección"
                  fullWidth
                  margin="normal"
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  placeholder="Ej: Av. San Martín 123, Buenos Aires"
                />

                <Box display="flex" gap={2} sx={{ mt: 2 }}>
                  <TextField
                    {...register("password")}
                    label="Contraseña"
                    type="password"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                  <TextField
                    {...register("confirmPassword")}
                    label="Confirmar Contraseña"
                    type="password"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    mt: 3,
                    mb: 3,
                  }}
                >
                  {isSubmitting ? "Creando cuenta..." : "Registrarse"}
                </Button>
              </Box>

              {/* Enlaces adicionales */}
              <Divider sx={{ my: 3 }} />

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={1}>
                  ¿Ya tienes cuenta?
                </Typography>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{
                      fontWeight: 600,
                      color: "secondary.main",
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Iniciar Sesión
                  </Typography>
                </Link>
              </Box>

              <Box textAlign="center" mt={2}>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    component="span"
                    color="text.secondary"
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    ← Volver al inicio
                  </Typography>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
