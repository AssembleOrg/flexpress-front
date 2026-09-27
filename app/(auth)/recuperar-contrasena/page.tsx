"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MarkEmailRead } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Logo from "@/components/ui/Logo";
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
            {forgot.isSuccess ? (
              <Box sx={{ textAlign: "center" }}>
                <MarkEmailRead color="success" sx={{ fontSize: 56, mb: 1 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Revisá tu email
                </Typography>
                {/* Mismo mensaje exista o no la cuenta: no revela qué emails están registrados. */}
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Si {getValues("email")} tiene una cuenta en Flexpress, te
                  mandamos un link para elegir una nueva contraseña. Vence en 1
                  hora. Mirá también la carpeta de spam.
                </Typography>
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                >
                  Volver a iniciar sesión
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ¿Olvidaste tu contraseña?
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Ingresá el email de tu cuenta y te mandamos un link para
                  elegir una nueva.
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    {...register("email")}
                    label="Email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 3 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    disabled={forgot.isPending}
                    sx={{ mb: 2 }}
                  >
                    {forgot.isPending ? "Enviando..." : "Enviar link"}
                  </Button>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Link
                    href="/login"
                    style={{ color: "#380116", fontWeight: 600 }}
                  >
                    Volver a iniciar sesión
                  </Link>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
