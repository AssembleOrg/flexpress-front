/**
 * Admin API Service
 * Handles all Admin operations for users, reports, trips, and payments
 */

import api from "@/lib/api";
import type {
  ApiResponse,
  User,
  Report,
  Trip,
  Payment,
  SystemConfig,
  VerificationStatus,
} from "@/lib/types/api";
import type {
  UserFilters,
  ReportFilters,
  TripFilters,
  PaymentFilters,
  PaginatedResponse,
  UpdateReportRequest,
  UpdateSystemConfigRequest,
} from "@/lib/types/admin";

export const adminApi = {
  // ============================================
  // USUARIOS
  // ============================================

  /**
   * Get all users with filters
   */
  getUsers: async (
    filters: UserFilters = {},
  ): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();

    if (filters.role) params.append("role", filters.role);
    if (filters.name) params.append("name", filters.name);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get<
      ApiResponse<User[] | PaginatedResponse<User>>
    >(`/users?${params.toString()}`);

    // Extraer response.data.data
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si ya es PaginatedResponse (con meta), retornarla
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      "meta" in responseData
    ) {
      return responseData as PaginatedResponse<User>;
    }

    // Si es array directo, wrappear en PaginatedResponse
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        meta: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          total: responseData.length,
          totalPages: 1,
        },
      };
    }

    // Fallback: retornar vacío
    return {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Get ALL users without pagination (for client-side filtering/pagination)
   * This endpoint doesn't support filters, so we load everything at once
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>("/users/all");

    // Extraer response.data.data
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si es array directo, retornarlo
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Fallback: retornar vacío
    return [];
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // ============================================
  // REPORTES
  // ============================================

  /**
   * Get all reports with filters
   */
  getReports: async (
    filters: ReportFilters = {},
  ): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get<
      ApiResponse<Report[] | PaginatedResponse<Report>>
    >(`/reports?${params.toString()}`);

    // Extraer response.data.data
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si ya es PaginatedResponse (con meta), retornarla
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      "meta" in responseData
    ) {
      return responseData as PaginatedResponse<Report>;
    }

    // Si es array directo, wrappear en PaginatedResponse
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        meta: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          total: responseData.length,
          totalPages: 1,
        },
      };
    }

    // Fallback: retornar vacío
    return {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Get report details by ID (includes conversation messages)
   */
  getReportById: async (id: string): Promise<Report> => {
    const response = await api.get<ApiResponse<Report>>(`/reports/${id}`);

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  /**
   * Update report status and admin notes
   */
  updateReport: async (
    id: string,
    data: UpdateReportRequest,
  ): Promise<Report> => {
    const response = await api.put<ApiResponse<Report>>(`/reports/${id}`, data);

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // ============================================
  // VIAJES (SUPERVISIÓN)
  // ============================================

  /**
   * Get all trips with pagination
   */
  getTrips: async (
    filters: TripFilters = {},
  ): Promise<PaginatedResponse<Trip>> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get<
      ApiResponse<Trip[] | PaginatedResponse<Trip>>
    >(`/trips?${params.toString()}`);

    // Extraer response.data.data
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si ya es PaginatedResponse (con meta), retornarla
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      "meta" in responseData
    ) {
      return responseData as PaginatedResponse<Trip>;
    }

    // Si es array directo, wrappear en PaginatedResponse
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        meta: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          total: responseData.length,
          totalPages: 1,
        },
      };
    }

    // Fallback: retornar vacío
    return {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  // ============================================
  // PAGOS (SUPERVISIÓN)
  // ============================================

  /**
   * Get all payments with pagination
   */
  getPayments: async (
    filters: PaymentFilters = {},
  ): Promise<PaginatedResponse<Payment>> => {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await api.get<
      ApiResponse<Payment[] | PaginatedResponse<Payment>>
    >(`/payments?${params.toString()}`);

    // Extraer response.data.data
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si ya es PaginatedResponse (con meta), retornarla
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      "meta" in responseData
    ) {
      return responseData as PaginatedResponse<Payment>;
    }

    // Si es array directo, wrappear en PaginatedResponse
    if (Array.isArray(responseData)) {
      return {
        data: responseData,
        meta: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          total: responseData.length,
          totalPages: 1,
        },
      };
    }

    // Fallback: retornar vacío
    return {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  },

  // ============================================
  // CONFIGURACIÓN DEL SISTEMA
  // ============================================

  /**
   * Get all system configurations
   */
  getSystemConfigs: async (): Promise<SystemConfig[]> => {
    const response =
      await api.get<ApiResponse<SystemConfig[]>>("/system-config/all");

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Si es array directo, retornarlo
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Fallback: retornar vacío
    return [];
  },

  /**
   * Update system configuration by ID
   */
  updateSystemConfig: async (
    id: string,
    data: UpdateSystemConfigRequest,
  ): Promise<SystemConfig> => {
    const response = await api.patch<ApiResponse<SystemConfig>>(
      `/system-config/${id}`,
      data,
    );

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // ============================================
  // CHARTER VERIFICATION
  // ============================================

  /**
   * Get all pending charters awaiting verification
   */
  getPendingCharters: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>("/users/charters/pending");

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    if (Array.isArray(responseData)) {
      return responseData;
    }

    return [];
  },

  /**
   * Verify or reject a charter
   */
  verifyCharter: async (
    charterId: string,
    status: "verified" | "rejected",
    rejectionReason?: string,
  ): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${charterId}/verify`,
      {
        status,
        rejectionReason,
      },
    );

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
