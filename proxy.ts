import { type NextRequest, NextResponse } from "next/server";
import { ROLE_COOKIE } from "@/lib/authCookie";

/**
 * Redirección temprana por área. Antes esto lo hacían solo los guards de
 * cliente (AuthGuard/RoleGuard): funcionan, pero recién después de hidratar,
 * así que el visitante veía una pantalla en blanco y se descargaba igual el
 * bundle de la sección.
 *
 * Se apoya en la cookie `fx_role`, que el authStore espeja desde el estado
 * persistido. NO es un control de seguridad: la cookie es editable y no lleva
 * el token. Falsearla deja entrar a la ruta, pero todas las llamadas a la API
 * responden 401/403 porque la autorización vive en el backend.
 */

const ADMIN_ROLES = ["admin", "subadmin"];

const AREAS = [
  { prefix: "/admin", allowed: ADMIN_ROLES, signIn: "/admin/login" },
  { prefix: "/client", allowed: ["user"], signIn: "/login" },
  { prefix: "/driver", allowed: ["charter"], signIn: "/login" },
] as const;

function dashboardFor(role: string | undefined): string {
  if (role && ADMIN_ROLES.includes(role)) return "/admin";
  if (role === "charter") return "/driver/dashboard";
  if (role === "user") return "/client/dashboard";
  return "/login";
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La pantalla de login de admin tiene que quedar accesible sin cookie.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const area = AREAS.find(
    (a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`),
  );

  if (!area) {
    return NextResponse.next();
  }

  const role = request.cookies.get(ROLE_COOKIE)?.value;

  // Sin cookie: o no hay sesión, o es una sesión vieja anterior a este cambio.
  // En ambos casos mandamos al login, que redirige solo al dashboard que
  // corresponde si el store todavía tiene la sesión (ver app/(auth)/login).
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = area.signIn;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (!area.allowed.includes(role as never)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardFor(role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/driver/:path*"],
};
