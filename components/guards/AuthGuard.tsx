"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";

interface AuthGuardProps {
  children: ReactNode;
  message?: string;
}

export function AuthGuard({ children, message }: AuthGuardProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated, user } = useAuthStore();

  // Wait for hydration to complete
  if (!hydrated) {
    return null;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <PageTransition>
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            px: 2,
          }}
        >
          <Container maxWidth="sm">
            <Box textAlign="center">
              <Typography variant="h4" color="text.secondary" gutterBottom>
                {message || "Por favor inicia sesión para continuar"}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push("/login")}
                sx={{ mt: 3 }}
              >
                Ir a Login
              </Button>
            </Box>
          </Container>
        </Box>
      </PageTransition>
    );
  }

  // User is authenticated, show content
  return <>{children}</>;
}
