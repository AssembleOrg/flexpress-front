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
