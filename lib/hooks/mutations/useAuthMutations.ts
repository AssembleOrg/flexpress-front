import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
} from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Mutation para login del usuario
 * Guarda el token en el store y redirige al dashboard
 */
export function useLogin() {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: (response) => {
      console.log("✅ [useLogin] onSuccess - Guardando auth");
      console.log("   User:", response.user.name);
      console.log("   Token presente:", !!response.token);
      console.log("   Token length:", response.token?.length || 0);

      // Guardar user y token en store (persiste a localStorage)
      login(response.user, response.token);

      toast.success(`¡Bienvenido ${response.user.name}!`);

      // Redirect basado en role
      let targetPath = "/client/dashboard"; // Default

      if (response.user.role === "admin" || response.user.role === "subadmin") {
        targetPath = "/admin";
      } else if (response.user.role === "charter") {
        targetPath = "/driver/dashboard";
      } else if (response.user.role === "user") {
        targetPath = "/client/dashboard";
      }

      console.log("🔄 [useLogin] Redirigiendo a:", targetPath, `(role: ${response.user.role})`);
      router.push(targetPath);
    },

    onError: (error) => {
      console.error("❌ [useLogin] onError:", error);
      toast.error("Email o contraseña incorrectos");
    },
  });
}

/**
 * Mutation para registro del usuario
 * Guarda el token en el store y redirige al dashboard
 */
export function useRegister() {
  const { login } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),

    onSuccess: (response) => {
      console.log("✅ [useRegister] onSuccess - Guardando auth");
      console.log("   User:", response.user.name);
      console.log("   Token presente:", !!response.token);
      console.log("   Token length:", response.token?.length || 0);
      console.log("   Role:", response.user.role);

      // Guardar user y token en store
      login(response.user, response.token);

      toast.success("Cuenta creada exitosamente");

      // Redirect basado en role
      const targetPath =
        response.user.role === "charter"
          ? "/driver/dashboard"
          : "/client/dashboard";

      console.log("🔄 [useRegister] Redirigiendo a:", targetPath);
      router.push(targetPath);
    },

    onError: (error) => {
      console.error("❌ [useRegister] onError:", error);
      toast.error("Error al registrarse");
    },
  });
}

/**
 * Mutation para logout del usuario
 * Limpia la cookie httpOnly en el backend y el estado local
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // React Query maneja la llamada API
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      // Limpiar todo el cache de React Query
      queryClient.clear();
      // Limpiar estado local de Zustand
      clearAuth();
    },
    onError: (_error) => {
      // Incluso si hay error, limpiar estado local
      // (la cookie puede estar ya expirada)
      clearAuth();
    },
  });
}
