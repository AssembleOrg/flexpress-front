/**
 * Availability Inquiries API
 * Consultas de disponibilidad a charters ocupados (sin chat libre, gratis).
 */

import { api } from "@/lib/api";
import type {
  ApiResponse,
  AvailabilityInquiry,
  InquiryResponseCode,
} from "@/lib/types/api";

// El backend NestJS aplica un ResponseInterceptor que envuelve los handlers
// en { success, message, data }. Algunos controllers devuelven ya el objeto
// crudo, otros devuelven { success, data: ... } adentro. Esta helper desempaca
// los dos niveles si están presentes — mismo patrón que travelMatching.ts.
function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    !Array.isArray(payload)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const availabilityInquiriesApi = {
  create: async (charterId: string): Promise<AvailabilityInquiry> => {
    const response = await api.post<ApiResponse<AvailabilityInquiry>>(
      "/availability-inquiries",
      { charterId },
    );
    return unwrap<AvailabilityInquiry>(response.data.data);
  },

  listSent: async (): Promise<AvailabilityInquiry[]> => {
    const response = await api.get<ApiResponse<AvailabilityInquiry[]>>(
      "/availability-inquiries/sent",
    );
    const data = unwrap<AvailabilityInquiry[]>(response.data.data);
    return Array.isArray(data) ? data : [];
  },

  listReceived: async (): Promise<AvailabilityInquiry[]> => {
    const response = await api.get<ApiResponse<AvailabilityInquiry[]>>(
      "/availability-inquiries/received",
    );
    const data = unwrap<AvailabilityInquiry[]>(response.data.data);
    return Array.isArray(data) ? data : [];
  },

  respond: async (
    id: string,
    responseCode: InquiryResponseCode,
  ): Promise<AvailabilityInquiry> => {
    const response = await api.patch<ApiResponse<AvailabilityInquiry>>(
      `/availability-inquiries/${id}/respond`,
      { responseCode },
    );
    return unwrap<AvailabilityInquiry>(response.data.data);
  },
};
