"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { availabilityInquiriesApi } from "@/lib/api/availabilityInquiries";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import type { InquiryResponseCode } from "@/lib/types/api";

/**
 * Cliente crea una consulta de disponibilidad a un charter ocupado.
 * No toca Zustand (no hay estado cliente que cambie con inquiries).
 */
export function useCreateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (charterId: string) =>
      availabilityInquiriesApi.create(charterId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.availabilityInquiries.sent(),
      });
      toast.success("Consulta enviada. Te avisaremos cuando responda.");
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 409) {
          toast.error("Ya tenés una consulta pendiente con este charter");
          return;
        }
        if (status === 400) {
          const msg =
            (error.response?.data as { message?: string } | undefined)
              ?.message ??
            "Este charter está disponible, podés seleccionarlo directamente";
          toast.error(msg);
          return;
        }
      }
      console.error("❌ useCreateInquiry error:", error);
      toast.error("Error al enviar la consulta");
    },
  });
}

/**
 * Charter responde una consulta con un código predefinido.
 */
export function useRespondInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      responseCode,
    }: {
      id: string;
      responseCode: InquiryResponseCode;
    }) => availabilityInquiriesApi.respond(id, responseCode),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.availabilityInquiries.received(),
      });
      toast.success("Respuesta enviada");
    },

    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 410) {
        toast.error("Esta consulta expiró");
        queryClient.invalidateQueries({
          queryKey: queryKeys.availabilityInquiries.received(),
        });
        return;
      }
      console.error("❌ useRespondInquiry error:", error);
      toast.error("Error al responder la consulta");
    },
  });
}
