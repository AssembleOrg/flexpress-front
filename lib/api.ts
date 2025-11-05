import axios from "axios";
import { useAuthStore } from "./stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV === "development") {
        console.log("✅ [API] Request Interceptor - Token inyectado");
        console.log("   URL:", config.url);
        console.log("   Token presente:", !!token);
        console.log(
          "   Header Authorization:",
          config.headers.Authorization ? "✅ Set" : "❌ Not set",
        );
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️  [API] Request Interceptor - No hay token en store");
        console.log("   URL:", config.url);
      }
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
    if (process.env.NODE_ENV === "development") {
      console.log("✅ [API] Response Success");
      console.log("   URL:", response.config.url);
      console.log("   Status:", response.status);
      console.log("   Data received:", !!response.data);
    }
    return response;
  },
  (error) => {
    // Si el token expiró o es inválido, cerrar sesión
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [API] 401 Unauthorized - Token inválido o expirado");
        console.log("   URL:", error.config?.url);
        console.log("   Message:", error.response.data?.message);
        console.log("   Clearing auth and redirecting to /login...");
      }

      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "❌ [API] 403 Forbidden - No tienes permisos para esta acción",
        );
        console.log("   URL:", error.config?.url);
      }
    } else if (error.request) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [API] Error de conexión - El servidor no respondió");
        console.log("   URL:", error.config?.url);
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [API] Error desconocido:", error.message);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
