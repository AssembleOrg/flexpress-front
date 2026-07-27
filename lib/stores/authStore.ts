import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearRoleCookie, setRoleCookie } from "@/lib/authCookie";
import type { AuthState, User } from "@/lib/types/auth";

interface AuthActions {
  login: (user: User, token: string, refreshToken?: string | null) => void;
  /** Reemplaza los tokens tras un refresh, sin tocar el resto de la sesión. */
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setGender: (gender: "male" | "female" | "other") => void;
  setReturnToOrigin: (val: boolean) => void;
}

export const useAuthStore = create<
  AuthState &
    AuthActions & {
      gender: "male" | "female" | "other" | null;
      returnToOrigin: boolean;
    }
>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      gender: null,
      returnToOrigin: false,

      // Acciones
      login: (user: User, token: string, refreshToken: string | null = null) => {
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development"
        ) {
          console.log("✅ [AuthStore] Login - Guardando user + token");
          console.log("   User:", user.name, `(${user.email})`);
          console.log("   Token length:", token.length);
          console.log("   Role:", user.role);
        }
        // Espejo del rol para que el middleware pueda redirigir antes de
        // servir el bundle. No lleva el token: ver lib/authCookie.ts.
        setRoleCookie(user.role);
        return set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setTokens: (token: string, refreshToken: string) =>
        set({ token, refreshToken }),

      // Limpia el estado local. La revocación del refresh en el servidor la
      // dispara useLogout antes de llamar acá.
      clearAuth: () => {
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development"
        ) {
          console.log("✅ [AuthStore] Logout - Limpiando user + token");
        }
        clearRoleCookie();
        return set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          gender: null,
        });
      },

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      setGender: (gender: "male" | "female" | "other") => set({ gender }),

      setReturnToOrigin: (val: boolean) => set({ returnToOrigin: val }),
    }),
    {
      name: "flexpress-auth",
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        gender: state.gender,
      }),
    },
  ),
);
