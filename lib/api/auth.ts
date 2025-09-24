import api from "../api";
import { User } from "../types/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "client" | "driver";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  // Iniciar sesión
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  // Registrarse
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Obtener perfil actual
  getProfile: async (): Promise<User> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  // Verificar token
  verifyToken: async (): Promise<User> => {
    const response = await api.get("/auth/verify");
    return response.data;
  },
};
