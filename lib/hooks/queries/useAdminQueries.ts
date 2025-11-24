/**
 * Admin Query Hooks
 * Handles all GET requests for admin panel (users, reports, trips, payments)
 */

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "./queryFactory";
import type {
  UserFilters,
  ReportFilters,
  TripFilters,
  PaymentFilters,
  PaginatedResponse,
} from "@/lib/types/admin";
import type {
  User,
  Report,
  Trip,
  Payment,
  SystemConfig,
} from "@/lib/types/api";

// ============================================
// USUARIOS
// ============================================

/**
 * Get ALL users without pagination (for client-side filtering and pagination)
 * Backend endpoint /users/all doesn't support filters, so we cache all users
 * and handle filtering/pagination on the client
 */
export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: queryKeys.admin.users.all(),
    queryFn: () => adminApi.getAllUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes - longer cache since data won't change frequently
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Get a specific user by ID
 */
export function useAdminUserDetail(userId: string | null) {
  return useQuery<User>({
    queryKey: queryKeys.admin.users.detail(userId ?? ""),
    queryFn: () => adminApi.getUserById(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// REPORTES
// ============================================

/**
 * Get all reports with optional filters (status, pagination)
 */
export function useAdminReports(filters: ReportFilters = {}) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: queryKeys.admin.reports.list(filters),
    queryFn: () => adminApi.getReports(filters),
    staleTime: 1000 * 30, // 30 seconds - Reports can change frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get detailed report including conversation messages
 */
export function useAdminReportDetail(reportId: string | null) {
  return useQuery<Report>({
    queryKey: queryKeys.admin.reports.detail(reportId ?? ""),
    queryFn: () => adminApi.getReportById(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// VIAJES (SUPERVISIÓN)
// ============================================

/**
 * Get all trips with optional pagination
 */
export function useAdminTrips(filters: TripFilters = {}) {
  return useQuery<PaginatedResponse<Trip>>({
    queryKey: queryKeys.admin.trips.list(filters),
    queryFn: () => adminApi.getTrips(filters),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ============================================
// PAGOS (SUPERVISIÓN)
// ============================================

/**
 * Get all payments with optional pagination
 */
export function useAdminPayments(filters: PaymentFilters = {}) {
  return useQuery<PaginatedResponse<Payment>>({
    queryKey: queryKeys.admin.payments.list(filters),
    queryFn: () => adminApi.getPayments(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

/**
 * Get all system configurations
 */
export function useSystemConfigs() {
  return useQuery<SystemConfig[]>({
    queryKey: queryKeys.admin.systemConfigs.all(),
    queryFn: () => adminApi.getSystemConfigs(),
    staleTime: 1000 * 60 * 5, // 5 minutes - configs change rarely
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================
// CHARTER VERIFICATION
// ============================================

/**
 * Get all pending charters awaiting verification
 */
export function usePendingCharters() {
  return useQuery<User[]>({
    queryKey: queryKeys.admin.charters.pending(),
    queryFn: () => adminApi.getPendingCharters(),
    staleTime: 1000 * 60, // 1 minute - new charters can register anytime
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
