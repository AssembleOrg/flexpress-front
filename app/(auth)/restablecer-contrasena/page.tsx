"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorOutline, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import Logo from "@/components/ui/Logo";
import { useResetPassword } from "@/lib/hooks/mutations/useAuthMutations";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "@/lib/validations/auth";

function ResetPassword() {
  const token = useSearchParams().get("token");
  const [showPassword, setShowPassword] = useState(false);
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <ErrorOutline color="error" sx={{ fontSize: 56, mb: 1 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Link incompleto
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Abrí el link completo desde el mail, o pedí uno nuevo.
        </Typography>
        <Button
          component={Link}
          href="/recuperar-contrasena"
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
        >
          Pedir un link nuevo
        </Button>
      </Box>
    );
  }

  const onSubmit = (data: ResetPasswordFormData) =>
    reset.mutate({ token, password: data.password });

  return (
    <>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Elegí una nueva contraseña
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Al cambiarla se cierran las sesiones abiertas en todos tus dispositivos.
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("password")}
          label="Nueva contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          autoFocus
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          {...register("confirmPassword")}
          label="Repetí la contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          fullWidth
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          disabled={reset.isPending}
          sx={{ mb: 2 }}
        >
          {reset.isPending ? "Guardando..." : "Cambiar contraseña"}
        </Button>
      </Box>
      {/* El error (link vencido/usado) ya sale en un toast; esto da la salida. */}
      {reset.isError && (
        <Box sx={{ textAlign: "center" }}>
          <Link
            href="/recuperar-contrasena"
            style={{ color: "#380116", fontWeight: 600 }}
          >
            Pedir un link nuevo
          </Link>
        </Box>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #380116 0%, #4b011d 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        px: 2,
        py: 4,
      }}
    >
      <Logo size={90} variant="white" />
      <Container maxWidth="xs" disableGutters>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Suspense fallback={null}>
              <ResetPassword />
            </Suspense>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
