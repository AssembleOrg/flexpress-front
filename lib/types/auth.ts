// Import User type from API (single source of truth)
import type { User } from "./api";

export interface AuthState {
  user: User | null;
  /** Access token. Vida corta (15m): se renueva con el refresh. */
  token: string | null;
  /** Refresh token. Rota en cada uso y se puede revocar del lado del servidor. */
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Re-export User for convenience
export type { User };
