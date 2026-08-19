import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
  type UpdateUserRequest,
} from "@/lib/api/auth";
import { dashboardFor } from "@/lib/routes";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";

// Extrae el mensaje de error del backend ({ message }) con fallback en español.
function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

/**
 * Mutation para login del usuario
 * Guarda el token en el store y redirige al dashboard
 */
export function useLogin() {
  const { login, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),

    onSuccess: async (response) => {
      // Guardar user y tokens en store (persiste a localStorage)
      login(response.user, response.token, response.refreshToken);

      // Descarta el caché del usuario anterior: si no, sus queries (keys sin
      // userId como notifications/availabilityInquiries) se reactivan con el
      // nuevo token, pegan a recursos ajenos → 401 → logout en cascada. Mismo
      // patrón que useLogout.
      queryClient.clear();

      // Fetch perfil completo para asegurar campos como pricePerKm
      try {
        const fullProfile = await authApi.updateUser(response.user.id, {});
        updateUser(fullProfile);
      } catch (error) {
        console.warn(
          "⚠️ [useLogin] No crítico: Error al obtener perfil completo",
          error,
        );
        // No crítico: el login ya funcionó, solo no tenemos pricePerKm
      }

      toast.success(`¡Bienvenido ${response.user.name}!`);

      // Mostrar toast si hay notificaciones de créditos acreditados (últimas 48hs)
      const recentUnread = useNotificationsStore.getState().getRecentUnread();
      if (recentUnread.length > 0) {
        const totalCredits = recentUnread.reduce(
          (sum, n) => sum + n.credits,
          0,
        );
        setTimeout(() => {
          toast.success(
            `¡Felicidades! Te han acreditado ${totalCredits} créditos 🎉`,
            { duration: 5000 },
          );
        }, 1000); // Delay para que no se solape con el toast de bienvenida
      }

      // Redirect al dashboard que corresponde al rol (ver lib/routes.ts).
      const targetPath = dashboardFor(response.user.role);

      // `replace` y no `push`: el login no debe quedar en el historial, si no
      // el botón "atrás" vuelve a una pantalla que solo existe para rebotar.
      router.replace(targetPath);
    },

    onError: (error) => {
      console.error("❌ [useLogin] onError:", error);
      toast.error(getApiErrorMessage(error, "Email o contraseña incorrectos"));
    },
  });
}

/**
 * Mutation para registro del usuario
 * Guarda el token en el store y redirige al dashboard
 */
export function useRegister() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),

    onSuccess: (response) => {
      // Guardar user y tokens en store
      login(response.user, response.token, response.refreshToken);

      toast.success("Cuenta creada exitosamente");

      // NOTA: la redirección NO se hace acá. El componente de registro sube el DNI y la
      // selfie DESPUÉS del registro; si redirigiéramos ahora, el componente se desmonta y
      // esas mutaciones (POST /users/me/documents) se cancelan → admin ve 0 documentos.
      // El redirect lo hace onSubmit al final, tras persistir todo.
    },

    onError: (error) => {
      console.error("❌ [useRegister] onError:", error);
      toast.error("Error al registrarse");
    },
  });
}

/**
 * Logout.
 *
 * Revoca el refresh token en el servidor para que la sesión de este
 * dispositivo no se pueda renovar, y después limpia el estado local. El access
 * que quede en vuelo muere solo al vencer, a los 15 minutos.
 *
 * La revocación es best-effort a propósito: si el backend no responde, igual
 * hay que cerrar la sesión localmente. `clearAuth` también borra la cookie de
 * rol que usa el proxy.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const { refreshToken } = useAuthStore.getState();
      try {
        await authApi.logout(refreshToken);
      } catch (error) {
        console.warn("⚠️ [useLogout] No se pudo revocar la sesión", error);
      }
      clearAuth();
      queryClient.clear();
    },
  });
}

/**
 * Mutation para actualizar perfil de usuario
 * Útil para completar datos después del registro (ej: ubicación de charter)
 */
export function useUpdateUserProfile() {
  const _queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserRequest;
    }) => authApi.updateUser(userId, data),

    onSuccess: (updatedUser, variables) => {
      // Actualizar usuario en el store
      // Si backend no devuelve los campos, usar los valores enviados
      updateUser({
        ...updatedUser,
        pricePerKm: updatedUser.pricePerKm ?? variables.data.pricePerKm,
        pricePerWaitBlock:
          updatedUser.pricePerWaitBlock ?? variables.data.pricePerWaitBlock,
        chargesReturnTrip:
          updatedUser.chargesReturnTrip ?? variables.data.chargesReturnTrip,
      });

      toast.success("Perfil actualizado exitosamente");
    },

    onError: (error) => {
      console.error("❌ [useUpdateUserProfile] Error:", error);
      toast.error("Error al actualizar perfil");
    },
  });
}
