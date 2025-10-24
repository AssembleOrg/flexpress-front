"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "Ingresa cualquier contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: redirectPath?.includes("driver")
        ? "conductor@flexpress.com"
        : "cliente@flexpress.com",
      password: "123456",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log("Formulario de login enviado:", data);

    // Simular login (sin API real por ahora)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock de usuario logueado
    const mockUser = {
      id: "user-001",
      firstName: "Usuario",
      lastName: "Demo",
      email: data.email,
      phone: "+54 9 11 1234-5678",
      role: redirectPath?.includes("driver")
        ? ("driver" as const)
        : ("client" as const),
      status: "active" as const,
      rating: 4.8,
    };

    login(mockUser, "mock-token-123");
    toast.success(`¡Bienvenido ${mockUser.firstName}!`);

    // Redirigir según el parámetro o rol
    const targetPath =
      redirectPath ||
      (mockUser.role === "driver" ? "/driver/dashboard" : "/client/dashboard");
    router.push(targetPath);
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
          pt: { xs: 6, md: 8 },
          pb: 3,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Logo size={80} withCircle={true} />
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
          px: { xs: 3, md: 2 },
        }}
      >
        <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
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
                  Iniciar Sesión
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Bienvenido a Flexpress
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
                  helperText={
                    errors.password?.message ||
                    "Para testing, ingresa cualquier valor"
                  }
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
                <Link href="/register" style={{ textDecoration: "none" }}>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
