export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: "client" | "driver" | "admin";
  status: "active" | "pending" | "suspended";
  verificationStatus?: "pending" | "verified" | "rejected";
  rating?: number;
  totalTrips?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
