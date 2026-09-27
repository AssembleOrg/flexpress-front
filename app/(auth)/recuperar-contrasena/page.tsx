"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockReset, MarkEmailRead } from "@mui/icons-material";
import { Box, Button, TextField } from "@mui/material";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  AuthBadge,
  AuthHeader,
  AuthShell,
  authLinkStyle,
} from "@/components/auth/AuthShell";
import { useForgotPassword } from "@/lib/hooks/mutations/useAuthMutations";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => forgot.mutate(data.email);

  if (forgot.isSuccess) {
    return (
      <AuthShell>
        <AuthBadge key="sent">
          <MarkEmailRead />
        </AuthBadge>
        {/* Mismo mensaje exista o no la cuenta: no revela qué emails están registrados. */}
        <AuthHeader
          title="Revisá tu email"
          subtitle={`Si ${getValues("email")} tiene una cuenta en Flexpress, te mandamos un link para elegir una nueva contraseña. Vence en 1 hora; mirá también en spam.`}
        />
        <Button
          component={Link}
          href="/login"
          variant="contained"
          color="secondary"
          fullWidth
        >
          Volver a iniciar sesión
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthBadge>
        <LockReset />
      </AuthBadge>
      <AuthHeader
        title="¿Olvidaste tu contraseña?"
        subtitle="Ingresá el email de tu cuenta y te mandamos un link para elegir una nueva."
      />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={forgot.isPending}
        >
          {forgot.isPending ? "Enviando…" : "Enviar link"}
        </Button>
      </Box>
      <Box sx={{ textAlign: "center", mt: 2.5 }}>
        <Link href="/login" style={authLinkStyle}>
          Volver a iniciar sesión
        </Link>
      </Box>
    </AuthShell>
  );
}
