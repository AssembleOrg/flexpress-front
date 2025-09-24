import api from "../api";
import { Trip } from "../types/trip";

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

export const tripsApi = {
  // Crear nueva solicitud de flete
  create: async (data: CreateTripRequest): Promise<Trip> => {
    const response = await api.post("/trips", data);
    return response.data;
  },

  // Obtener fletes disponibles (para conductores)
  getAvailable: async (): Promise<Trip[]> => {
    const response = await api.get("/trips/available");
    return response.data;
  },

  // Obtener mis viajes
  getMy: async (): Promise<Trip[]> => {
    const response = await api.get("/trips/my");
    return response.data;
  },

  // Obtener historial de viajes
  getHistory: async (): Promise<Trip[]> => {
    const response = await api.get("/trips/history");
    return response.data;
  },

  // Obtener detalles de un viaje
  getById: async (tripId: string): Promise<Trip> => {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  },

  // Aceptar viaje (conductor)
  accept: async (tripId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/accept`);
    return response.data;
  },

  // Confirmar acuerdo
  confirm: async (tripId: string, finalPrice?: number): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/confirm`, { finalPrice });
    return response.data;
  },

  // Cancelar viaje
  cancel: async (tripId: string, reason?: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/cancel`, { reason });
    return response.data;
  },

  // Completar viaje
  complete: async (tripId: string): Promise<Trip> => {
    const response = await api.post(`/trips/${tripId}/complete`);
    return response.data;
  },

  // Calificar viaje
  rate: async (
    tripId: string,
    rating: number,
    comment?: string,
  ): Promise<void> => {
    await api.post(`/trips/${tripId}/rate`, { rating, comment });
  },
};
