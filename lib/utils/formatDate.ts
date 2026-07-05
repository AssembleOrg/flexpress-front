// Formateo de fechas estandarizado para todo el panel admin (y donde haga falta).
//
// Todas las fechas del sistema se guardan en UTC. Para evitar la ambigüedad de
// "parece de la mañana pero era de la tarde", fijamos SIEMPRE la zona horaria de
// Argentina y el reloj de 24 horas explícito. No dejamos que dependa del
// timezone del navegador del admin.

const AR_TIME_ZONE = "America/Argentina/Buenos_Aires";

/**
 * Fecha + hora en zona horaria de Argentina, formato 24h. Ej: "23/06/2026, 15:00".
 * Devuelve "—" si el valor es nulo/indefinido/inválido.
 */
export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("es-AR", {
    timeZone: AR_TIME_ZONE,
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Solo fecha (sin hora) en zona horaria de Argentina. Ej: "23/06/2026".
 * Devuelve "—" si el valor es nulo/indefinido/inválido.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (value == null) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-AR", {
    timeZone: AR_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
