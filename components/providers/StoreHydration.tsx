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

    // El middleware redirige mirando la cookie `fx_role`, que se escribe en el
    // login. Las sesiones abiertas ANTES de que existiera esa cookie no la
    // tienen, así que se reescribe acá desde el estado ya rehidratado: la
    // primera navegación las manda al login y desde ahí vuelven solas al
    // dashboard, sin obligar a rehacer login.
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
