"use client";

import { Suspense } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Link as MuiLink,
  Divider,
  CircularProgress,
} from "@mui/material";
import { LocalShipping } from "@mui/icons-material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/stores/authStore";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "Ingresa cualquier contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { login } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: redirectPath?.includes('driver') ? 'conductor@flexpress.com' : 'cliente@flexpress.com',
      password: '123456',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log("Formulario de login enviado:", data);
    
    // Simular login (sin API real por ahora)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock de usuario logueado
    const mockUser = {
      id: "user-001",
      firstName: "Usuario",
      lastName: "Demo",
      email: data.email,
      phone: "+54 9 11 1234-5678",
      role: redirectPath?.includes('driver') ? 'driver' as const : 'client' as const,
      status: 'active' as const,
      rating: 4.8,
    };
    
    login(mockUser, 'mock-token-123');
    toast.success(`¡Bienvenido ${mockUser.firstName}!`);
    
    // Redirigir según el parámetro o rol
    const targetPath = redirectPath || (mockUser.role === 'driver' ? '/driver/dashboard' : '/client/dashboard');
    router.push(targetPath);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
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
            <Typography variant="h6" color="text.secondary">
              Iniciar Sesión
            </Typography>
          </Box>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("email")}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              {...register("password")}
              label="Contraseña (cualquier valor)"
              type="text"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message || "Para testing, ingresa cualquier valor"}
              sx={{ mb: 3 }}
            />

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
                mb: 3,
              }}
            >
              {isSubmitting ? "Ingresando..." : "Entrar"}
            </Button>
          </Box>

          {/* Enlaces adicionales */}
          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" mb={1}>
              ¿No tienes cuenta?
            </Typography>
            <Link href="/register" style={{ textDecoration: 'none' }}>
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
                Regístrate
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <LoginForm />
    </Suspense>
  );
}
