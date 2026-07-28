/**
 * Mapa rol → dashboard, fuente única.
 *
 * Estaba duplicado en cuatro lugares (useLogin, las dos páginas de login y el
 * proxy) y las copias ya habían empezado a divergir. Vive acá para que agregar
 * un rol o mover un dashboard sea un solo cambio.
 *
 * No toca `document` ni APIs de Node: se importa igual desde el proxy (edge) y
 * desde componentes cliente.
 */

export const ADMIN_ROLES = ["admin", "subadmin"] as const;

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

export function dashboardFor(role: string | undefined | null): string {
  if (isAdminRole(role)) return "/admin";
  if (role === "charter") return "/driver/dashboard";
  if (role === "user") return "/client/dashboard";
  return "/login";
}
