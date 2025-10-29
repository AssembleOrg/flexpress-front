// Import User type from API (single source of truth)
import type { User } from "./api";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Re-export User for convenience
export type { User };
