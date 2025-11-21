"use client";

import { Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: "user" | "charter";
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user } = useAuthStore();

  // ⚠️ TODOS LOS HOOKS DEBEN IR ANTES DE CUALQUIER RETURN (Rules of Hooks)
  // Redirect if user has wrong role
  useEffect(() => {
    if (hydrated && user && user.role !== requiredRole) {
      const correctDashboard = user.role === "charter" ? "/driver/dashboard" : "/client/dashboard";
      router.replace(correctDashboard);
    }
  }, [hydrated, user, requiredRole, router]);

  // Wait for hydration to complete
  if (!hydrated) {
    return null;
  }

  // Show access denied if wrong role (before redirect completes)
  if (user && user.role !== requiredRole) {
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
                Acceso no autorizado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                No tienes permiso para acceder a esta sección.
                Redirigiendo a tu dashboard...
              </Typography>
            </Box>
          </Container>
        </Box>
      </PageTransition>
    );
  }

  // User has correct role
  return <>{children}</>;
}
