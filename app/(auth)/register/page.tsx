"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DriveEta, Home, Login, Person } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { PageTransition } from "@/components/ui/PageTransition";
import { useRegister } from "@/lib/hooks/mutations/useAuthMutations";

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

function RegisterFormContent() {
  const [userRole, setUserRole] = useState<"client" | "driver">("client");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const searchParams = useSearchParams();
  const registerMutation = useRegister();

  // Determine transition direction based on redirect parameter
  const getTransitionDirection = (): "left" | "right" | "default" => {
    const redirectPath = searchParams.get("redirect");
    if (!redirectPath) return "default";
    if (redirectPath.includes("/client")) return "left";
    if (redirectPath.includes("/driver")) return "right";
    return "default";
  };

  const transitionDirection = getTransitionDirection();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    const registerData = {
      email: data.email,
      password: data.password,
      name: data.name,
      number: data.number,
      address: data.address,
      role: userRole === "driver" ? ("charter" as const) : ("user" as const),
    };

    console.log("📝 [RegisterForm] Triggering mutation...");
    console.log("   Email:", data.email);
    console.log("   Role:", registerData.role);

    registerMutation.mutate(registerData);
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

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {userRole === "client"
                      ? "Necesito transportar objetos"
                      : "Tengo vehículo y quiero generar ingresos"}
                  </Typography>

                  {userRole === "driver" && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <AlertTitle>
                        Tus datos serán validados por un administrador antes de
                        activar tu cuenta.
                      </AlertTitle>
                    </Alert>
                  )}
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

                  {/* Terms and Conditions Checkbox */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Acepto los{" "}
                        <Link
                          href="/terminos-y-condiciones"
                          target="_blank"
                          style={{ color: "#DCA621", textDecoration: "none" }}
                        >
                          <span
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            términos y condiciones
                          </span>
                        </Link>
                      </Typography>
                    }
                    sx={{ mt: 2, mb: 2 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    disabled={registerMutation.isPending || !acceptedTerms}
                    sx={{
                      py: 1.5,
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      mt: 2,
                      mb: 3,
                    }}
                  >
                    {registerMutation.isPending
                      ? "Creando cuenta..."
                      : "Registrarse"}
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
                  {/* Login Link */}
                  <Link href="/login" style={{ textDecoration: "none" }}>
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
                      <Login sx={{ fontSize: 18, color: "secondary.main" }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "secondary.main",
                          transition: "all 0.3s ease",
                        }}
                      >
                        ¿Ya tienes cuenta? Inicia Sesión
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
