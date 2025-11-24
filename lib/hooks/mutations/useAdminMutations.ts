"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import type { User, Report, SystemConfig } from "@/lib/types/api";
import type {
  UpdateReportRequest,
  UpdateSystemConfigRequest,
} from "@/lib/types/admin";

/**
 * Admin Mutation Hooks
 *
 * Handles all POST/PUT/DELETE requests for admin panel.
 * Uses React Query invalidation to keep data fresh.
 */

// ============================================
// USUARIOS
// ============================================

/**
 * Update a user's information
 * PATCH /users/:id
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      adminApi.updateUser(id, data),

    onSuccess: (updatedUser, { id }) => {
      // Update the specific user in cache
      queryClient.setQueryData(queryKeys.admin.users.detail(id), updatedUser);

      // Invalidate users list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.all(),
      });

      toast.success("Usuario actualizado correctamente");
    },

    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar el usuario");
    },
  });
}

/**
 * Delete a user account
 * DELETE /users/:id
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),

    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.all(),
      });

      toast.success("Usuario eliminado correctamente");
    },

    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar el usuario");
    },
  });
}

// ============================================
// REPORTES
// ============================================

/**
 * Update report status and admin notes
 * PUT /reports/:id
 */
export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportRequest }) =>
      adminApi.updateReport(id, data),

    onSuccess: (updatedReport, { id }) => {
      // Update the specific report in cache
      queryClient.setQueryData(
        queryKeys.admin.reports.detail(id),
        updatedReport,
      );

      // Invalidate reports list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.reports.all(),
      });

      toast.success("Reporte actualizado correctamente");
    },

    onError: (error) => {
      console.error("Error updating report:", error);
      toast.error("Error al actualizar el reporte");
    },
  });
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

/**
 * Update a system configuration
 * PATCH /system-config/:id
 */
export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSystemConfigRequest;
    }) => adminApi.updateSystemConfig(id, data),

    onSuccess: () => {
      // Invalidate system configs to refetch all
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.systemConfigs.all(),
      });

      toast.success("Configuración actualizada correctamente");
    },

    onError: (error) => {
      console.error("Error updating system config:", error);
      toast.error("Error al actualizar la configuración");
    },
  });
}
