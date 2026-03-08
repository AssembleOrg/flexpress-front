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
import { useNotificationsStore } from "@/lib/stores/notificationsStore";

/**
 * Mutation para login del usuario
 * Guarda el token en el store y redirige al dashboard
 */
export function useLogin() {
  const { login, updateUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: async (response) => {
      console.log("✅ [useLogin] onSuccess - Guardando auth");
      console.log("   User:", response.user.name);
      console.log("   Token presente:", !!response.token);
      console.log("   Token length:", response.token?.length || 0);

      // Guardar user y token en store (persiste a localStorage)
      login(response.user, response.token);

      // Fetch perfil completo para asegurar campos como pricePerKm
      try {
        console.log("📡 [useLogin] Obteniendo perfil completo...");
        const fullProfile = await authApi.updateUser(response.user.id, {});
        console.log("✅ [useLogin] Perfil completo obtenido:", fullProfile);
        console.log("   pricePerKm en perfil:", fullProfile.pricePerKm);
        updateUser(fullProfile);
      } catch (error) {
        console.warn("⚠️ [useLogin] No crítico: Error al obtener perfil completo", error);
        // No crítico: el login ya funcionó, solo no tenemos pricePerKm
      }

      toast.success(`¡Bienvenido ${response.user.name}!`);

      // Mostrar toast si hay notificaciones de créditos acreditados (últimas 48hs)
      const recentUnread = useNotificationsStore.getState().getRecentUnread();
      if (recentUnread.length > 0) {
        const totalCredits = recentUnread.reduce((sum, n) => sum + n.credits, 0);
        setTimeout(() => {
          toast.success(
            `¡Felicidades! Te han acreditado ${totalCredits} créditos 🎉`,
            { duration: 5000 },
          );
        }, 1000); // Delay para que no se solape con el toast de bienvenida
      }

      // Redirect basado en role
      let targetPath = "/client/dashboard"; // Default

      if (response.user.role === "admin" || response.user.role === "subadmin") {
        targetPath = "/admin";
      } else if (response.user.role === "charter") {
        targetPath = "/driver/dashboard";
      } else if (response.user.role === "user") {
        targetPath = "/client/dashboard";
      }

      console.log(
        "🔄 [useLogin] Redirigiendo a:",
        targetPath,
        `(role: ${response.user.role})`,
      );
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

    onSuccess: (updatedUser, variables) => {
      console.log("✅ [useUpdateUserProfile] Perfil actualizado:", updatedUser.name);
      console.log("✅ [useUpdateUserProfile] updatedUser completo:", updatedUser);
      console.log("✅ [useUpdateUserProfile] pricePerKm en respuesta:", updatedUser.pricePerKm);
      console.log("✅ [useUpdateUserProfile] pricePerKm enviado:", variables.data.pricePerKm);

      // Actualizar usuario en el store
      // Si backend no devuelve pricePerKm, usar el valor enviado
      updateUser({
        ...updatedUser,
        pricePerKm: updatedUser.pricePerKm ?? variables.data.pricePerKm,
      });

      toast.success("Perfil actualizado exitosamente");
    },

    onError: (error) => {
      console.error("❌ [useUpdateUserProfile] Error:", error);
      toast.error("Error al actualizar perfil");
    },
  });
}
