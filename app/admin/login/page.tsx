"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { PageTransition } from "@/components/ui/PageTransition";
import { useLogin } from "@/lib/hooks/mutations/useAuthMutations";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    console.log("📝 [AdminLoginForm] Triggering mutation...");
    loginMutation.mutate(data);
  };

  return (
    <PageTransition direction="default">
      <Box
        sx={{
          background: "#b7850d",
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
              "radial-gradient(circle, rgba(56, 1, 22, 0.12) 0%, transparent 70%)",
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
              "radial-gradient(circle, rgba(75, 1, 29, 0.08) 0%, transparent 70%)",
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
          <Logo size={100} variant="default" />
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
                border: "1px solid rgba(56, 1, 22, 0.1)",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(56, 1, 22, 0.15)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {/* Admin Icon Badge */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
                      boxShadow: "0 4px 12px rgba(56, 1, 22, 0.6)",
                    }}
                  >
                    <AdminIcon sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                </Box>

                {/* Título */}
                <Box textAlign="center" mb={4}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, mb: 1, color: "#380116" }}
                  >
                    Panel de Administración
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresa tus credenciales para acceder al panel
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
                    placeholder="admin@flexpress.com"
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
                    placeholder="••••••••"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{
                                color: "#380116",
                                "&:hover": {
                                  bgcolor: "rgba(56, 1, 22, 0.1)",
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
                    fullWidth
                    size="large"
                    disabled={loginMutation.isPending}
                    sx={{
                      py: 1.5,
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      mb: 3,
                      background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
                      color: "white",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(56, 1, 22, 0.5)",
                      },
                      "&:disabled": {
                        background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
                        opacity: 0.7,
                      },
                    }}
                  >
                    {loginMutation.isPending ? "Ingresando..." : "Iniciar Sesión"}
                  </Button>
                </Box>

                {/* Footer Info */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    ¿Olvidaste tu contraseña?{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        color: "#380116",
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Contacta al administrador principal
                    </Typography>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>

        {/* Version Info */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(56, 1, 22, 0.7)",
              fontSize: "0.75rem",
            }}
          >
            FlexPress Admin v1.0
          </Typography>
        </Box>
      </Box>
    </PageTransition>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
