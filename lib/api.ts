import axios from "axios";
import { useAuthStore } from "./stores/authStore";

// Browser: usa `/api/v1` relativo → entra al rewrite de Next (proxy a
// backend, posiblemente por private domain). Server-side (SSR/RSC):
// pega directo al backend. `API_URL` (server-only) tiene prioridad para
// soportar private domain de Railway; cae a `NEXT_PUBLIC_API_URL` si no
// está, y al rewrite local en último caso.
const API_URL =
  typeof globalThis.window === "undefined"
    ? process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000/api/v1"
    : "/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Renovación del access token.
 *
 * Un dashboard dispara varias queries a la vez, así que cuando el access vence
 * llegan varios 401 casi simultáneos. Si cada uno pidiera su propio refresh, el
 * primero rotaría el token y los demás llegarían con uno ya usado: el backend
 * lo interpreta como robo y revoca TODAS las sesiones del usuario.
 *
 * Por eso se comparte una única promesa en vuelo: el primero renueva y el resto
 * espera ese mismo resultado.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      // Cliente aparte: si usara `api`, su propio 401 volvería a entrar al
      // interceptor y armaría un bucle.
      const { data } = await axios.post(
        `${API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      const payload = data?.data ?? data;
      const accessToken = payload?.access_token;
      const nextRefresh = payload?.refresh_token;

      if (!accessToken || !nextRefresh) return null;

      useAuthStore.getState().setTokens(accessToken, nextRefresh);
      return accessToken as string;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: Manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const requestUrl = error.config?.url ?? "";
    // El 401 de login/registro es "credenciales incorrectas", no sesión
    // expirada: dejar que el onError de la mutación lo maneje (toast/inline).
    // El de /auth/refresh significa que el refresh ya no sirve.
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // El access dura 15 minutos, así que un 401 acá es lo esperable durante
      // una sesión normal: se renueva y se reintenta el request original, sin
      // que el usuario note nada. Solo si el refresh falla se cierra la sesión.
      const original = error.config;

      if (original && !original._retried) {
        original._retried = true;
        const newToken = await refreshAccessToken();

        if (newToken) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      }

      // Los guards (AuthGuard/RoleGuard/admin layout) reaccionan al cambio
      // de isAuthenticated y redirigen sin recargar la página.
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  },
);

export default api;
