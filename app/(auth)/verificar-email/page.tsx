"use client";

import { ErrorOutline, MarkEmailRead } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AuthBadge, AuthHeader, AuthShell } from "@/components/auth/AuthShell";
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

  const nextButton = (
    <Button
      component={Link}
      href={next}
      variant="contained"
      color="secondary"
      fullWidth
    >
      {nextLabel}
    </Button>
  );

  if (state.status === "loading") {
    return (
      <AuthShell>
        <AuthBadge>
          <CircularProgress size={30} thickness={4.5} color="inherit" />
        </AuthBadge>
        <AuthHeader title="Confirmando tu email…" />
      </AuthShell>
    );
  }

  if (state.status === "ok") {
    return (
      <AuthShell>
        <AuthBadge key="ok">
          <MarkEmailRead />
        </AuthBadge>
        <AuthHeader
          title="¡Email confirmado!"
          subtitle="Gracias. Ya podés seguir usando Flexpress."
        />
        {nextButton}
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthBadge key="error" tone="error">
        <ErrorOutline />
      </AuthBadge>
      <AuthHeader
        title="No pudimos confirmar tu email"
        subtitle={`${state.message}${
          user
            ? " Podés pedir un link nuevo desde tu panel."
            : " Iniciá sesión y pedí un link nuevo desde tu panel."
        }`}
      />
      {nextButton}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
