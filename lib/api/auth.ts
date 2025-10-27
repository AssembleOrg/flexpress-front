import api from "../api";
import type { ApiResponse, AuthResponse, User } from "../types/api";

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
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data,
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
  },

  // Registrarse
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    // biome-ignore lint/style/noNonNullAssertion: axios response guarantees data
    return response.data.data!;
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
