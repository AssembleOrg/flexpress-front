import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Vehicle, VehicleDocument, VehicleDocumentType } from "@/lib/types/api";

export interface CreateVehicleRequest {
  plate: string;
  brand?: string;
  model?: string;
  year?: number;
  alias?: string;
}

export interface CreateVehicleDocumentRequest {
  type: VehicleDocumentType;
  fileUrl: string;
  expiresAt?: string;
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateVehicleRequest): Promise<Vehicle> => {
      const response = await api.post<{ success: boolean; data: Vehicle }>(
        "/vehicles",
        dto,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", "me"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al crear vehículo";
      toast.error(message);
    },
  });
}

export function useCreateVehicleDocument(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateVehicleDocumentRequest): Promise<VehicleDocument> => {
      const response = await api.post<{ success: boolean; data: VehicleDocument }>(
        `/vehicles/${vehicleId}/documents`,
        dto,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", vehicleId, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles", "me"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al subir documento del vehículo";
      toast.error(message);
    },
  });
}

export function useToggleVehicleEnabled(vehicleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Vehicle> => {
      const response = await api.patch<{ success: boolean; data: Vehicle }>(
        `/vehicles/${vehicleId}/toggle-enabled`,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", "me"] });
      toast.success("Estado del vehículo actualizado");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Error al cambiar estado del vehículo";
      toast.error(message);
    },
  });
}
