"use client";

/**
 * Payment Mutation Hooks
 * Handles CREATE payment request, APPROVE, and REJECT operations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/api/payments";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import type { CreatePaymentRequest } from "@/lib/api/payments";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";

/**
 * CREATE PAYMENT REQUEST (Cliente)
 * Crea una solicitud de pago pendiente con el comprobante
 */
export function useCreatePaymentRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: Omit<CreatePaymentRequest, "userId">) => {
      // Validar que el usuario esté logueado
      if (!user?.id) {
        throw new Error("Usuario no autenticado");
      }

      // Inyectar userId automáticamente
      const requestData: CreatePaymentRequest = {
        ...data,
        userId: user.id,
      };

      return paymentsApi.createPaymentRequest(requestData);
    },

    onSuccess: () => {
      // Invalidar lista de pagos del admin
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.payments.all(),
      });

      // Invalidar lista de pagos del usuario
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.my(),
      });

      toast.success("Solicitud enviada. Espera aprobación del admin.");
    },

    onError: (error) => {
      console.error("Error creating payment request:", error);
      toast.error("Error al enviar la solicitud de pago");
    },
  });
}

/**
 * APPROVE PAYMENT (Admin)
 * Aprueba el pago, incrementa créditos del usuario
 */
export function useApprovePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.approvePayment(paymentId),

    onSuccess: (updatedPayment) => {
      // 1. Invalidar lista de pagos
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.payments.all(),
      });

      // 2. Invalidar detalles del usuario afectado
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.users.detail(updatedPayment.userId),
      });

      // 3. Invalidar contador de pendientes
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.payments.pendingCount(),
      });

      // 4. Si el usuario logueado es el afectado, actualizar su store Y agregar notificación
      const { user, updateUser } = useAuthStore.getState();
      if (user && user.id === updatedPayment.userId) {
        updateUser({
          credits: user.credits + updatedPayment.credits,
        });

        // Agregar notificación de créditos acreditados
        useNotificationsStore.getState().addCreditNotification({
          paymentId: updatedPayment.id,
          credits: updatedPayment.credits,
          amount: updatedPayment.amount,
          approvedAt: new Date().toISOString(),
        });
      }

      toast.success("Pago aprobado y créditos acreditados");
    },

    onError: (error) => {
      console.error("Error approving payment:", error);
      toast.error("Error al aprobar el pago");
    },
  });
}

/**
 * REJECT PAYMENT (Admin)
 * Rechaza el pago, NO modifica créditos
 */
export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      paymentsApi.rejectPayment(paymentId, reason),

    onSuccess: () => {
      // Invalidar lista de pagos
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.payments.all(),
      });

      // Invalidar contador de pendientes
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.payments.pendingCount(),
      });

      toast.success("Pago rechazado");
    },

    onError: (error) => {
      console.error("Error rejecting payment:", error);
      toast.error("Error al rechazar el pago");
    },
  });
}
