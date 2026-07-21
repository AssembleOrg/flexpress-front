import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";

/**
 * Reenvío de verificación para un charter rechazado: reabre su caso
 * (vuelve a 'pending') en el backend. Decisión de diseño: NO actualizamos
 * el authStore local para evitar race conditions; la UI le pide al usuario
 * volver a entrar más tarde para ver el estado actualizado.
 */
export function useResubmitVerification() {
  return useMutation({
    mutationFn: () => authApi.resubmitVerification(),
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "No se pudo reenviar la verificación. Intentá de nuevo.";
      toast.error(message);
    },
  });
}
