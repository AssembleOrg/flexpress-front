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
 * JwtAuthGuard). Esto es puramente para evitar la pantalla en blanco y no
 * servirle el JS de admin a un visitante anónimo.
 */
export const ROLE_COOKIE = "fx_role";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 3; // igual que JWT_EXPIRES_IN=3d

export function setRoleCookie(role: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearRoleCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
