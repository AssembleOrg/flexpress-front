"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Home,
  PersonAdd,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { PageTransition } from "@/components/ui/PageTransition";
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
  const [showPassword, setShowPassword] = useState(false);

  // transition direction based on redirect parameter
  const getTransitionDirection = (): "left" | "right" | "default" => {
    if (!redirectPath) return "default";
    if (redirectPath.includes("/client")) return "left";
    if (redirectPath.includes("/driver")) return "right";
    return "default";
  };

  const transitionDirection = getTransitionDirection();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { authApi } = await import("@/lib/api/auth");

      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      login(response.user, response.token);
      toast.success(`¡Bienvenido ${response.user.name}!`);

      const targetPath =
        redirectPath ||
        (response.user.role === "charter"
          ? "/driver/dashboard"
          : "/client/dashboard");
      router.push(targetPath);
    } catch (error) {
      toast.error("Email o contraseña incorrectos");
      console.error("Login error:", error);
    }
  };

  return (
    <PageTransition direction={transitionDirection}>
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
          <Logo size={100} variant="white" />
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
            px: { xs: 1, md: 2 },
          }}
        >
          <Container maxWidth="sm" sx={{ py: { xs: 2, md: 3 } }}>
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
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message || ""}
                    sx={{ mb: 3 }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{
                                color: "primary.main",
                                "&:hover": {
                                  bgcolor: "rgba(106, 27, 59, 0.05)",
                                },
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
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

                {/* Enhanced Footer */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid rgba(56, 1, 22, 0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Register Link */}
                  <Link href="/register" style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: "8px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          transform: "scale(1.05)",
                          bgcolor: "rgba(220, 166, 33, 0.1)",
                        },
                      }}
                    >
                      <PersonAdd
                        sx={{ fontSize: 18, color: "secondary.main" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "secondary.main",
                          transition: "all 0.3s ease",
                        }}
                      >
                        ¿No tienes cuenta? Regístrate
                      </Typography>
                    </Box>
                  </Link>

                  <Divider orientation="vertical" flexItem sx={{ my: 1 }} />

                  {/* Back to Home */}
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: "8px 12px",
                        borderRadius: 1,
                        "&:hover": {
                          transform: "scale(1.05)",
                          bgcolor: "rgba(220, 166, 33, 0.1)",
                        },
                      }}
                    >
                      <Home sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        Inicio
                      </Typography>
                    </Box>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    </PageTransition>
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
