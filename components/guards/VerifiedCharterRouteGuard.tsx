"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";
import { VerificationStatus } from "@/lib/types/api";

// Rutas donde un charter no verificado SÍ puede estar: la pantalla de estado
// (dashboard), la carga de vehículo (onboarding) y el reenvío de docs.
const ALLOWED_PREFIXES = [
  "/driver/dashboard",
  "/driver/onboarding",
  "/driver/verification",
];

/**
 * Bloquea el acceso por URL directa a rutas /driver/* que un charter
 * pendiente/rechazado no debería usar (Pagos, Vehículos, Reportes, etc.),
 * redirigiéndolo al dashboard (que muestra su estado). Complementa el ocultado
 * de links en AuthNavbar/BottomNavbar. No afecta a charters verificados ni a
 * clientes. Mismo patrón de hidratación + redirect que RoleGuard.
 */
export function VerifiedCharterRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { user } = useAuthStore();

  const isUnverifiedCharter =
    user?.role === "charter" &&
    user?.verificationStatus !== VerificationStatus.VERIFIED;
  const isAllowed = ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
  const blocked = isUnverifiedCharter && !isAllowed;

  useEffect(() => {
    if (hydrated && blocked) {
      router.replace("/driver/dashboard");
    }
  }, [hydrated, blocked, router]);

  // Evitar parpadeo de la página bloqueada mientras redirige (o pre-hidratación).
  if (!hydrated || blocked) {
    return null;
  }

  return <>{children}</>;
}
