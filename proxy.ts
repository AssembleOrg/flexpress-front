import { type NextRequest, NextResponse } from "next/server";
import { ROLE_COOKIE } from "@/lib/authCookie";
import { ADMIN_ROLES, dashboardFor } from "@/lib/routes";

/**
 * Redirección temprana por área: evita servirle a un charter el bundle de
 * admin (o al revés) antes de que hidraten los guards de cliente.
 *
 * Se apoya en la cookie `fx_role`, que el authStore espeja desde el estado
 * persistido. NO es un control de seguridad: la cookie es editable y no lleva
 * el token. Falsearla deja entrar a la ruta, pero todas las llamadas a la API
 * responden 401/403 porque la autorización vive en el backend.
 *
 * Solo actúa cuando la cookie ESTÁ y contradice al área. La ausencia de cookie
 * no se interpreta: ver el comentario en el cuerpo.
 */

const AREAS = [
  { prefix: "/admin", allowed: ADMIN_ROLES },
  { prefix: "/client", allowed: ["user"] },
  { prefix: "/driver", allowed: ["charter"] },
] as const;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La pantalla de login de admin tiene que quedar accesible siempre.
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

  // Sin cookie NO se expulsa. El proxy no puede distinguir "no hay sesión" de
  // "la cookie se escribió recién y todavía no viajó en este request", y
  // tratar ambos casos como anónimo armaba un bucle: el login guardaba la
  // sesión, navegaba al dashboard, el proxy todavía no veía la cookie y
  // mandaba de vuelta al login, que al ver sesión activa reintentaba el
  // dashboard. El usuario quedaba mirando el login ya logueado.
  //
  // Quien de verdad no tiene sesión igual no pasa: AuthGuard lo frena del lado
  // del cliente y la API le responde 401.
  if (!role) {
    return NextResponse.next();
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
