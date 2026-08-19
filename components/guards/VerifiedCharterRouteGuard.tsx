"use client";

import type { ReactNode } from "react";
import { UserRole } from "@/lib/types/api";
import { VerifiedRouteGuard } from "./VerifiedRouteGuard";

// Rutas donde un charter no verificado SÍ puede estar: la pantalla de estado
// (dashboard), la carga de vehículo (onboarding) y el reenvío de docs.
const ALLOWED_PREFIXES = [
  "/driver/dashboard",
  "/driver/onboarding",
  "/driver/verification",
];

/**
 * Wrapper de compatibilidad sobre VerifiedRouteGuard para el charter. Mantiene
 * la API previa usada por app/driver/layout.tsx.
 */
export function VerifiedCharterRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VerifiedRouteGuard
      role={UserRole.CHARTER}
      allowedPrefixes={ALLOWED_PREFIXES}
      redirectTo="/driver/dashboard"
    >
      {children}
    </VerifiedRouteGuard>
  );
}
