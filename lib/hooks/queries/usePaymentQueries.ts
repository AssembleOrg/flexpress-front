"use client";

/**
 * Payment Query Hooks
 * Handles GET operations for payment data
 */

import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { getSocketConnected } from "@/lib/hooks/useWebSocket";
import { queryKeys } from "./queryFactory";

/**
 * GET PENDING PAYMENTS COUNT (Admin)
 * Muestra badge en el sidebar con número de pagos pendientes
 */
export function usePendingPaymentsCount() {
  return useQuery({
    queryKey: queryKeys.admin.payments.pendingCount(),
    queryFn: () => paymentsApi.getPendingPaymentsCount(),
    staleTime: 1000 * 30, // 30 segundos
    // notification:new tipo payment_pending (useWebSocket) lo invalida al
    // instante. Aprobaciones/rechazos de otro admin no emiten evento → red de
    // seguridad de 2 min con socket activo; socket caído → 30s.
    refetchInterval: () => (getSocketConnected() ? 1000 * 60 * 2 : 1000 * 30),
  });
}

/**
 * GET MY PAYMENTS (Client)
 * Returns all payments for the authenticated user
 */
export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.my(),
    queryFn: () => paymentsApi.getMyPayments(),
    staleTime: 1000 * 30, // 30 segundos - datos que pueden cambiar
  });
}
