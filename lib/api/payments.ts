/**
 * Payments API Service
 * Handles payment request creation and admin approval/rejection
 */

import api from "@/lib/api";
import type { ApiResponse, Payment } from "@/lib/types/api";

export interface CreatePaymentRequest {
  userId: string;
  credits: number;
  amount: number;
  receiptUrl: string; // URL from UploadThing
}

export interface ApprovePaymentRequest {
  paymentId: string;
}

export interface RejectPaymentRequest {
  paymentId: string;
  reason?: string;
}

export const paymentsApi = {
  /**
   * Create a new payment request (CLIENT)
   */
  createPaymentRequest: async (
    data: CreatePaymentRequest,
  ): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>("/payments", data);

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Handle double-wrapped response from backend
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "message" in responseData &&
      "data" in responseData
    ) {
      console.log("🔍 [PAYMENTS] Detected double-wrapped response");
      // biome-ignore lint/style/noNonNullAssertion: structure validated above
      return (responseData as unknown as { data: Payment }).data!;
    }

    return responseData as Payment;
  },

  /**
   * Approve a payment request (ADMIN)
   * Updates payment status to "accepted" and increments user credits
   */
  approvePayment: async (paymentId: string): Promise<Payment> => {
    const response = await api.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}/approve`,
    );

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Handle double-wrapped response
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "data" in responseData
    ) {
      return (responseData as unknown as { data: Payment }).data!;
    }

    return responseData as Payment;
  },

  /**
   * Reject a payment request (ADMIN)
   * Updates payment status to "rejected"
   */
  rejectPayment: async (paymentId: string, reason?: string): Promise<Payment> => {
    const response = await api.patch<ApiResponse<Payment>>(
      `/payments/${paymentId}/reject`,
      { reason },
    );

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Handle double-wrapped response
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "data" in responseData
    ) {
      return (responseData as unknown as { data: Payment }).data!;
    }

    return responseData as Payment;
  },

  /**
   * Get pending payments count (ADMIN)
   */
  getPendingPaymentsCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      "/payments/pending/count",
    );

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Handle double-wrapped response
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "data" in responseData
    ) {
      return (responseData as unknown as { data: { count: number } }).data!.count;
    }

    return responseData.count;
  },

  /**
   * Get my payments (CLIENT)
   * Returns all payments for the authenticated user
   */
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>("/payments/my");

    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const responseData = response.data.data!;

    // Handle double-wrapped response
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData &&
      "data" in responseData
    ) {
      return (responseData as unknown as { data: Payment[] }).data!;
    }

    return responseData as Payment[];
  },
};
