/**
 * Espejo del rol en una cookie legible por el middleware de Next.
 *
 * El token vive en localStorage (zustand persist) y el middleware corre en el
 * server, así que no puede leerlo. Esta cookie NO lleva el token ni ningún
 * secreto: solo el rol, para poder redirigir antes de mandar el bundle de una
 * sección que no corresponde.
 *
 * IMPORTANTE: es editable por el usuario, así que no es un control de
 * seguridad. Quien la falsee llega a la ruta pero cada llamada a la API le
 * responde 401/403: la autorización real vive en el backend (RolesGuard +
 * JwtAuthGuard). Sirve para no servirle a un charter el bundle de admin (o al
 * revés) antes de que hidraten los guards.
 *
 * Su ausencia no significa nada: el proxy solo actúa cuando la cookie está y
 * contradice al área. Ver el comentario en proxy.ts.
 */
export const ROLE_COOKIE = "fx_role";

// La sesión larga la sostiene el refresh token, no el access (que dura 15
// minutos), así que la cookie sigue al refresh: REFRESH_TOKEN_TTL_DAYS=30.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function setRoleCookie(role: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearRoleCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
