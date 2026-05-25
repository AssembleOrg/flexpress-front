import type { InquiryResponseCode } from "@/lib/types/api";

// SYNC: mantener idéntico al backend (flexpress-backend/.../availability-inquiries.constants.ts).
// Si cambia un label acá, actualizar el archivo del backend en el mismo commit.
export const INQUIRY_RESPONSE_LABELS: Record<InquiryResponseCode, string> = {
  available_soon: "Estoy disponible en ~2 horas",
  available_today_later: "Disponible más tarde hoy, te aviso",
  available_tomorrow: "Disponible mañana",
  not_today: "Hoy no puedo, otro día sí",
  not_available: "No estoy disponible para este viaje",
};

export const INQUIRY_RESPONSE_CODES: InquiryResponseCode[] = [
  "available_soon",
  "available_today_later",
  "available_tomorrow",
  "not_today",
  "not_available",
];
