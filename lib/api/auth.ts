import api from "../api";
import type { ApiResponse, AuthResponse, User } from "../types/api";

// Backend response type (access_token, no token)
interface BackendAuthResponse {
  access_token: string;
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
}

export const authApi = {
  // Iniciar sesión
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<BackendAuthResponse>>(
      "/auth/login",
      data,
    );

    // DEBUG LOGS - Ver estructura exacta del response
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("🔍 [authApi.login] Full response structure:");
      console.log("   response.data:", response.data);
      console.log("   response.data.data:", response.data.data);
      console.log(
        "   response.data.data?.user:",
        response.data.data?.user?.name,
      );
      console.log(
        "   response.data.data?.access_token:",
        response.data.data?.access_token ? "✅ PRESENT" : "❌ MISSING",
      );
    }

    // Backend retorna { access_token, user } → Mapear a { token, user }
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const { access_token, user } = response.data.data!;
    const authResponse: AuthResponse = {
      token: access_token,
      user,
    };

    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("✅ [authApi.login] Mapped response:");
      console.log("   token present:", !!authResponse.token);
      console.log("   token length:", authResponse.token.length);
    }

    return authResponse;
  },

  // Registrarse
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<BackendAuthResponse>>(
      "/auth/register",
      data,
    );

    // DEBUG LOGS - Ver estructura exacta del response
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("🔍 [authApi.register] Full response structure:");
      console.log("   response.data:", response.data);
      console.log("   response.data.data:", response.data.data);
      console.log(
        "   response.data.data?.user:",
        response.data.data?.user?.name,
      );
      console.log(
        "   response.data.data?.access_token:",
        response.data.data?.access_token ? "✅ PRESENT" : "❌ MISSING",
      );
    }

    // Backend retorna { access_token, user } → Mapear a { token, user }
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    const { access_token, user } = response.data.data!;
    const authResponse: AuthResponse = {
      token: access_token,
      user,
    };

    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("✅ [authApi.register] Mapped response:");
      console.log("   token present:", !!authResponse.token);
      console.log("   token length:", authResponse.token.length);
    }

    return authResponse;
  },

  // Obtener perfil actual
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/profile");
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Actualizar perfil
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>("/auth/profile", data);
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Actualizar usuario por ID
  updateUser: async (
    userId: string,
    data: UpdateUserRequest,
  ): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, data);
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // Verificar token
  verifyToken: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/verify");
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },
};
