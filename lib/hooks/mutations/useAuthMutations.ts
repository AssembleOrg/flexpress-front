import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
  type UpdateUserRequest,
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
      const targetPath =
        response.user.role === "charter"
          ? "/driver/dashboard"
          : "/client/dashboard";

      console.log("🔄 [useLogin] Redirigiendo a:", targetPath);
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

/**
 * Mutation para actualizar perfil de usuario
 * Útil para completar datos después del registro (ej: ubicación de charter)
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      authApi.updateUser(userId, data),

    onSuccess: (updatedUser) => {
      console.log("✅ [useUpdateUserProfile] Perfil actualizado:", updatedUser.name);

      // Actualizar usuario en el store
      updateUser(updatedUser);

      // Invalidar queries relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Perfil actualizado exitosamente");
    },

    onError: (error) => {
      console.error("❌ [useUpdateUserProfile] Error:", error);
      toast.error("Error al actualizar perfil");
    },
  });
}
