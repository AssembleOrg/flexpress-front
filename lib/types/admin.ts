import { User, Report, Trip, Payment, ApiResponse } from "./api";

// ============================================
// FILTER INTERFACES
// ============================================

export interface UserFilters {
  role?: "admin" | "subadmin" | "user" | "charter";
  name?: string;
  page?: number;
  limit?: number;
}

export interface ReportFilters {
  status?: "pending" | "investigating" | "resolved" | "dismissed";
  page?: number;
  limit?: number;
}

export interface TripFilters {
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface UpdateReportRequest {
  status: "pending" | "investigating" | "resolved" | "dismissed";
  adminNotes?: string;
}

export interface UpdateSystemConfigRequest {
  value: string;
}

// ============================================
// PAGINATED RESPONSE
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
