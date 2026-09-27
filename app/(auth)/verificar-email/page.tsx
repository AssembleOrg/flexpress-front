"use client";

import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import { authApi } from "@/lib/api/auth";
import { dashboardFor } from "@/lib/routes";
import { useAuthStore } from "@/lib/stores/authStore";
import { getApiErrorMessage } from "@/lib/utils/apiError";

type State =
  | { status: "loading" }
  | { status: "ok" }
  | { status: "error"; message: string };

function VerifyEmail() {
  const token = useSearchParams().get("token");
  const { user, updateUser } = useAuthStore();
  const [state, setState] = useState<State>({ status: "loading" });
  // En desarrollo React monta dos veces: sin esto el segundo intento usaría un
  // token ya consumido y mostraría error sobre un email recién confirmado.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    if (!token) {
      setState({
        status: "error",
        message:
          "Falta el código del link. Abrí el link completo desde el mail.",
      });
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setState({ status: "ok" });
        if (useAuthStore.getState().user) {
          updateUser({ emailVerifiedAt: new Date().toISOString() });
        }
      })
      .catch((error) =>
        setState({
          status: "error",
          message: getApiErrorMessage(
            error,
            "No pudimos confirmar tu email. Probá de nuevo en unos minutos.",
          ),
        }),
      );
  }, [token, updateUser]);

  const next = user ? dashboardFor(user.role) : "/login";
  const nextLabel = user ? "Ir a mi panel" : "Iniciar sesión";

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
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            {state.status === "loading" && (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" fontWeight={700}>
                  Confirmando tu email…
                </Typography>
              </>
            )}

            {state.status === "ok" && (
              <>
                <CheckCircle color="success" sx={{ fontSize: 56, mb: 1 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ¡Email confirmado!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Gracias. Ya podés seguir usando Flexpress.
                </Typography>
                <Button
                  component={Link}
                  href={next}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                >
                  {nextLabel}
                </Button>
              </>
            )}

            {state.status === "error" && (
              <>
                <ErrorOutline color="error" sx={{ fontSize: 56, mb: 1 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No pudimos confirmar tu email
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {state.message}
                  {user
                    ? " Podés pedir un link nuevo desde tu panel."
                    : " Iniciá sesión y pedí un link nuevo desde tu panel."}
                </Typography>
                <Button
                  component={Link}
                  href={next}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  size="large"
                >
                  {nextLabel}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
