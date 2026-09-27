"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ErrorOutline,
  Key,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AuthBadge,
  AuthHeader,
  AuthShell,
  authLinkStyle,
} from "@/components/auth/AuthShell";
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
      <AuthShell>
        <AuthBadge tone="error">
          <ErrorOutline />
        </AuthBadge>
        <AuthHeader
          title="Link incompleto"
          subtitle="Abrí el link completo desde el mail, o pedí uno nuevo."
        />
        <Button
          component={Link}
          href="/recuperar-contrasena"
          variant="contained"
          color="secondary"
          fullWidth
        >
          Pedir un link nuevo
        </Button>
      </AuthShell>
    );
  }

  const onSubmit = (data: ResetPasswordFormData) =>
    reset.mutate({ token, password: data.password });

  return (
    <AuthShell>
      <AuthBadge>
        <Key />
      </AuthBadge>
      <AuthHeader
        title="Nueva contraseña"
        subtitle="Al cambiarla se cierran las sesiones abiertas en todos tus dispositivos."
      />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("password")}
          label="Nueva contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          autoFocus
          fullWidth
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{ mb: 2 }}
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
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={reset.isPending}
        >
          {reset.isPending ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </Box>
      {/* El error (link vencido/usado) ya sale en un toast; esto da la salida. */}
      {reset.isError && (
        <Box sx={{ textAlign: "center", mt: 2.5 }}>
          <Link href="/recuperar-contrasena" style={authLinkStyle}>
            Pedir un link nuevo
          </Link>
        </Box>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
