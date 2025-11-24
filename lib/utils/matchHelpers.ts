import type { TravelMatch } from "@/lib/types/api";

/**
 * Verifica si un match ha expirado basado en la fecha de expiración
 * @param match - Match a verificar
 * @returns true si el match ha expirado, false en caso contrario
 */
export function isMatchExpired(match: TravelMatch): boolean {
  if (!match?.expiresAt) {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(match.expiresAt);
  return expiresAt <= now;
}

/**
 * Obtiene el tiempo restante en minutos para la expiración de un match
 * @param match - Match a verificar
 * @returns Minutos restantes, o -1 si ya ha expirado
 */
export function getMinutesUntilExpiration(match: TravelMatch): number {
  if (!match?.expiresAt) {
    return -1;
  }

  const now = new Date();
  const expiresAt = new Date(match.expiresAt);
  const diffMs = expiresAt.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  return diffMinutes > 0 ? diffMinutes : -1;
}

/**
 * Formatea la hora de expiración de un match para mostrar al usuario
 * @param match - Match a verificar
 * @returns String con la hora formateada (ej: "14:30"), o null si no hay expiración
 */
export function getFormattedExpirationTime(match: TravelMatch): string | null {
  if (!match?.expiresAt) {
    return null;
  }

  const expiresAt = new Date(match.expiresAt);
  return expiresAt.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Verifica si un match representa un viaje activo para el usuario
 *
 * Un viaje es considerado ACTIVO si:
 * - Status = "pending" (no expirado) - Usuario esperando respuesta de charter
 * - Status = "accepted" con conversationId - Charter aceptó, en negociación
 * - Status = "completed" pero trip.status !== "completed" - Viaje en progreso
 *
 * Un viaje NO es activo si:
 * - Status = "completed" Y trip.status = "completed" (todo terminado)
 * - Status = "rejected", "cancelled", "expired"
 * - Status = "pending" pero ha expirado
 *
 * @param match - Match a verificar
 * @returns true si el match representa un viaje activo, false en caso contrario
 */
export function isActiveTrip(match: TravelMatch | null | undefined): boolean {
  if (!match?.id) return false;

  // Exclude non-active statuses
  if (
    match.status === "rejected" ||
    match.status === "cancelled" ||
    match.status === "expired"
  ) {
    return false;
  }

  // Exclude completed trips (both match AND trip are completed)
  if (match.status === "completed" && match.trip?.status === "completed") {
    return false;
  }

  // Check if pending but expired
  if (match.status === "pending" && match.expiresAt) {
    if (new Date(match.expiresAt) < new Date()) {
      return false;
    }
  }

  // Include pending matches (not expired)
  if (match.status === "pending") {
    return true;
  }

  // Include accepted matches that have a conversation (charter accepted)
  if (match.status === "accepted" && match.conversationId) {
    return true;
  }

  // Include completed matches with active trips (trip in progress)
  if (match.status === "completed" && match.tripId && match.trip?.status !== "completed") {
    return true;
  }

  return false;
}
