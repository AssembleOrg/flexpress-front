"use client";

/**
 * Payment Query Hooks
 * Handles GET operations for payment data
 */

import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
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
    refetchInterval: 1000 * 30, // Auto-refetch cada 30s (polling simple)
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
