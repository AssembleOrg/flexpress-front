import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, User } from "@/lib/types/auth";

interface AuthActions {
  login: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setGender: (gender: "male" | "female" | "other") => void;
}

export const useAuthStore = create<AuthState & AuthActions & { gender: "male" | "female" | "other" | null }>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      gender: null,

      // Acciones
      login: (user: User, token: string) => {
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development"
        ) {
          console.log("✅ [AuthStore] Login - Guardando user + token");
          console.log("   User:", user.name, `(${user.email})`);
          console.log("   Token length:", token.length);
          console.log("   Role:", user.role);
        }
        return set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Limpia estado local (client state)
      // API call al backend lo maneja React Query en useLogout mutation
      clearAuth: () => {
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development"
        ) {
          console.log("✅ [AuthStore] Logout - Limpiando user + token");
        }
        return set({
          user: null,
          token: null,
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

      setGender: (gender: "male" | "female" | "other") =>
        set({ gender }),
    }),
    {
      name: "flexpress-auth",
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        gender: state.gender,
      }),
    },
  ),
);
