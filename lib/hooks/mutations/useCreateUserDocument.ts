import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { UserDocument, UserDocumentType, DocumentSide } from "@/lib/types/api";
import { queryKeys } from "../queries/queryFactory";

export interface CreateUserDocumentRequest {
  type: UserDocumentType;
  side?: DocumentSide;
  fileUrl: string;
}

export function useCreateUserDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateUserDocumentRequest): Promise<UserDocument> => {
      const response = await api.post<{ success: boolean; data: UserDocument }>(
        "/users/me/documents",
        dto,
      );
      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.charters.pending(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.all(),
      });
    },

    onError: (error: any) => {
      console.error("Error creating user document:", error);
      const message = error.response?.data?.message || "Error al subir documento";
      toast.error(message);
    },
  });
}
