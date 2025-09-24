"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Link as MuiLink,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LocalShipping, Person, DriveEta } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/stores/authStore";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un email válido"),
    phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
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
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const formData = { ...data, role: userRole };
    console.log("Formulario de registro enviado:", formData);
    
    // Simular registro (sin API real por ahora)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock de usuario registrado
    const newUser = {
      id: `user-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: userRole,
      status: 'active' as const,
      rating: 5.0,
    };
    
    login(newUser, 'mock-token-123');
    toast.success(`¡Bienvenido ${newUser.firstName}! Cuenta creada exitosamente`);
    
    // Redirigir al dashboard según el rol
    const targetPath = userRole === 'driver' ? '/driver/dashboard' : '/client/dashboard';
    router.push(targetPath);
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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo y título */}
          <Box textAlign="center" mb={4}>
            <LocalShipping
              sx={{
                fontSize: 48,
                color: "primary.main",
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Flexpress
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={3}>
              Crea tu Cuenta
            </Typography>

            {/* Selector de rol */}
            <ToggleButtonGroup
              value={userRole}
              exclusive
              onChange={handleRoleChange}
              aria-label="tipo de usuario"
              sx={{ mb: 3 }}
            >
              <ToggleButton value="client" aria-label="cliente" sx={{ px: 3 }}>
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
            <Box display="flex" gap={2} mb={2}>
              <TextField
                {...register("firstName")}
                label="Nombre"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                {...register("lastName")}
                label="Apellido"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Box>

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
              {...register("phone")}
              label="Teléfono"
              type="tel"
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              placeholder="Ej: +54 9 11 1234-5678"
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
            <Link href="/login" style={{ textDecoration: 'none' }}>
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
            <Link href="/" style={{ textDecoration: 'none' }}>
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
  );
}
