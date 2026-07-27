import api from "../api";
import type { Trip } from "../types/trip";

export interface CreateTripRequest {
  origin: string;
  destination: string;
  description: string;
  suggestedPrice: number;
}

export interface UpdateTripRequest {
  finalPrice?: number;
  status?: Trip["status"];
}

// Helper to extract data from double-wrapped backend response
function extractData<T>(responseData: any): T {
  // Backend wraps responses in { success, message, data }
  if (
    responseData &&
    typeof responseData === "object" &&
    "success" in responseData &&
    "data" in responseData
  ) {
    return responseData.data as T;
  }
  // Fallback: return as-is
  return responseData as T;
}

export const tripsApi = {
  // Nota: el alta de viajes y las transiciones accept/confirm/cancel/complete
  // vivían acá contra rutas que el backend nunca expuso. El alta real va por
  // travel-matching (al aceptar el match) y la calificación por /feedback.

  // Obtener mis viajes (use /trips/all since /trips/my doesn't exist)
  getMy: async (): Promise<Trip[]> => {
    const response = await api.get("/trips/all");
    return extractData<Trip[]>(response.data);
  },

  // Obtener historial de viajes (completed trips only)
  getHistory: async (): Promise<Trip[]> => {
    // Use /trips/all and filter for completed status
    const response = await api.get("/trips/all");
    const trips = extractData<Trip[]>(response.data);
    // Filter only completed trips for current user
    return trips.filter((trip) => trip.status === "completed");
  },

  // Obtener detalles de un viaje
  getById: async (tripId: string): Promise<Trip> => {
    const response = await api.get(`/trips/${tripId}`);
    return extractData<Trip>(response.data);
  },





  // Charter finaliza su trabajo
  charterComplete: async (tripId: string): Promise<Trip> => {
    const response = await api.put(`/trips/${tripId}/charter-complete`);
    return extractData<Trip>(response.data);
  },

  // Cliente confirma recepción del trabajo
  clientConfirm: async (tripId: string): Promise<Trip> => {
    const response = await api.put(`/trips/${tripId}/client-confirm`);
    return extractData<Trip>(response.data);
  },

};
