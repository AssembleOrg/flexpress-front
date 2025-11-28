import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { User } from "@/lib/types/api";
import { queryKeys } from "../queries/queryFactory";

export interface UpdateDniUrlsRequest {
  userId: string;
  documentationFrontUrl: string;
  documentationBackUrl: string;
}

export function useUpdateDniUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, documentationFrontUrl, documentationBackUrl }: UpdateDniUrlsRequest) => {
      const response = await api.patch<{ success: boolean; data: User }>(
        `/users/${userId}/update-dni-urls`,
        { documentationFrontUrl, documentationBackUrl }
      );

      return response.data.data;
    },

    onSuccess: () => {
      toast.success("DNI registrado exitosamente");

      // Invalidar cache de charters pendientes para que el admin vea las imágenes actualizadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.charters.pending(),
      });

      // También invalidar la lista de todos los usuarios
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.all(),
      });
    },

    onError: (error: any) => {
      console.error("Error updating DNI URLs:", error);
      const message = error.response?.data?.message || "Error al registrar DNI";
      toast.error(message);
    },
  });
}
