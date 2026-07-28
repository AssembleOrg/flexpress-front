"use client";

import { useEffect } from "react";
import { setRoleCookie } from "@/lib/authCookie";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * StoreHydration Provider
 *
 * Handles manual rehydration of Zustand stores with persist middleware.
 * This component ensures that localStorage state is properly restored on the client
 * while preventing SSR/hydration mismatches.
 *
 * Why this is needed:
 * - Zustand persist middleware tries to access localStorage during initialization
 * - localStorage doesn't exist on the server, causing SSR mismatch
 * - This provider manually triggers rehydration AFTER client mount
 * - Allows server render with default state, then restores persisted state on client
 */
export function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manually rehydrate the auth store from localStorage
    // This is safe because we're inside useEffect (client-only)
    useAuthStore.persist.rehydrate();

    // El proxy usa la cookie `fx_role` para no servir el bundle de un área que
    // no corresponde al rol. Se reescribe acá desde el estado ya rehidratado
    // porque las sesiones abiertas antes de que la cookie existiera no la
    // tienen, y porque puede expirar antes que la sesión.
    const { user } = useAuthStore.getState();
    if (user?.role) {
      setRoleCookie(user.role);
    }

    // During hydration (first render on client), stores use default state
    // This matches the server render, preventing hydration mismatch
    // After this effect runs, stores update with persisted state
    // Components can now safely access the full auth state (user, token, etc)
  }, []);

  return <>{children}</>;
}
