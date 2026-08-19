"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useAuthStore } from "@/lib/stores/authStore";
import { type UserRole, VerificationStatus } from "@/lib/types/api";

/**
 * Bloquea el acceso por URL directa a rutas que un usuario del rol dado, no
 * verificado (pendiente/rechazado), no debería usar, redirigiéndolo a la ruta
 * de estado (`redirectTo`). Complementa el ocultado de links en los navbars.
 * No afecta a usuarios verificados ni a otros roles. Mismo patrón de hidratación
 * + redirect que RoleGuard.
 */
export function VerifiedRouteGuard({
  children,
  role,
  allowedPrefixes,
  redirectTo,
}: {
  children: ReactNode;
  role: UserRole;
  allowedPrefixes: string[];
  redirectTo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { user } = useAuthStore();

  const isUnverified =
    user?.role === role &&
    user?.verificationStatus !== VerificationStatus.VERIFIED;
  const isAllowed = allowedPrefixes.some((p) => pathname.startsWith(p));
  const blocked = isUnverified && !isAllowed;

  useEffect(() => {
    if (hydrated && blocked) {
      router.replace(redirectTo);
    }
  }, [hydrated, blocked, router, redirectTo]);

  // Evitar parpadeo de la página bloqueada mientras redirige (o pre-hidratación).
  if (!hydrated || blocked) {
    return null;
  }

  return <>{children}</>;
}
