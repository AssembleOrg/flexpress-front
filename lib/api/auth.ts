import api from "../api";
import type { ApiResponse, AuthResponse, User } from "../types/api";

// Backend response type (access_token, no token)
interface BackendAuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  number: string;
  address: string;
  role: "user" | "charter";
  originAddress?: string | null;
  originLatitude?: string | null;
  originLongitude?: string | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  number?: string;
  address?: string;
  avatar?: string | null;
  originAddress?: string | null;
  originLatitude?: string | null;
  originLongitude?: string | null;
  pricePerKm?: number;
  pricePerWaitBlock?: number;
  chargesReturnTrip?: boolean;
}

export const authApi = {
  // Iniciar sesión
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<BackendAuthResponse>>(
      "/auth/login",
      data,
    );

    // 🔧 UNWRAP: Manejar doble wrapper del backend (igual que conversations.ts)
    let authData: BackendAuthResponse;

    if (response.data.data && typeof response.data.data === "object") {
      // Caso 1: Doble wrapper { success, data: { success, data: {...} } }
      if (
        "data" in response.data.data &&
        typeof (response.data.data as any).data === "object"
      ) {
        authData = (response.data.data as { data: BackendAuthResponse }).data;
      }
      // Caso 2: Wrapper simple { success, data: {...} }
      else {
        authData = response.data.data as BackendAuthResponse;
      }
    } else {
      throw new Error("Invalid response structure from login endpoint");
    }

    const { access_token, refresh_token, user } = authData;
    const authResponse: AuthResponse = {
      token: access_token,
      refreshToken: refresh_token ?? null,
      user,
    };

    return authResponse;
  },

  // Registrarse
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<BackendAuthResponse>>(
      "/auth/register",
      data,
    );

    // 🔧 UNWRAP: Manejar doble wrapper del backend (igual que conversations.ts)
    let authData: BackendAuthResponse;

    if (response.data.data && typeof response.data.data === "object") {
      // Caso 1: Doble wrapper { success, data: { success, data: {...} } }
      if (
        "data" in response.data.data &&
        typeof (response.data.data as any).data === "object"
      ) {
        authData = (response.data.data as { data: BackendAuthResponse }).data;
      }
      // Caso 2: Wrapper simple { success, data: {...} }
      else {
        authData = response.data.data as BackendAuthResponse;
      }
    } else {
      throw new Error("Invalid response structure from register endpoint");
    }

    const { access_token, refresh_token, user } = authData;
    const authResponse: AuthResponse = {
      token: access_token,
      refreshToken: refresh_token ?? null,
      user,
    };

    return authResponse;
  },

  // Perfil del usuario autenticado. El backend lo revalida contra la base en
  // cada request, así que un 401/403 acá significa sesión revocada (cuenta dada
  // de baja o bloqueada), no solo token vencido.
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Para editar el perfil propio se usa `updateUser` (PATCH /users/:id), que ya
  // valida ownership en el backend. No hay un PUT /auth/profile.

  // Actualizar usuario por ID
  updateUser: async (
    userId: string,
    data: UpdateUserRequest,
  ): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(
      `/users/${userId}`,
      data,
    );
    const rawData = response.data.data!;
    // Handle potential double-wrapper from backend
    if (rawData && typeof rawData === "object" && "data" in rawData) {
      return (rawData as { data: User }).data;
    }
    return rawData;
  },

  // Reenvío self-service: un charter rechazado reabre su caso (vuelve a pending)
  resubmitVerification: async (): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      "/users/me/resubmit-verification",
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Revoca el refresh de este dispositivo en el servidor. El access vigente
  // muere solo al vencer (15m). Es best-effort: si falla, igual se limpia el
  // estado local.
  logout: async (refreshToken: string | null): Promise<void> => {
    if (!refreshToken) return;
    await api.post("/auth/logout", { refresh_token: refreshToken });
  },

  // Verificar que la sesión siga viva. Mismo endpoint que getProfile: si el
  // token venció, o la cuenta fue dada de baja o bloqueada, tira 401/403.
  verifyToken: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
