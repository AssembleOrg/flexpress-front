import type { User } from "@/lib/types/auth";
import type { Trip } from "@/lib/types/trip";

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "maria.client@example.com",
    firstName: "María",
    lastName: "González",
    phone: "+54 9 11 2345-6789",
    role: "client",
    status: "active",
    rating: 4.8,
    totalTrips: 12,
  },
  {
    id: "2",
    email: "carlos.driver@example.com",
    firstName: "Carlos",
    lastName: "Rodríguez",
    phone: "+54 9 11 3456-7890",
    role: "driver",
    status: "active",
    verificationStatus: "verified",
    rating: 4.9,
    totalTrips: 45,
  },
  {
    id: "3",
    email: "ana.driver@example.com",
    firstName: "Ana",
    lastName: "Martínez",
    phone: "+54 9 11 4567-8901",
    role: "driver",
    status: "active",
    verificationStatus: "verified",
    rating: 4.7,
    totalTrips: 32,
  },
  {
    id: "4",
    email: "juan.client@example.com",
    firstName: "Juan",
    lastName: "Pérez",
    phone: "+54 9 11 5678-9012",
    role: "client",
    status: "active",
    rating: 4.6,
    totalTrips: 8,
  },
  {
    id: "5",
    email: "admin@flexpress.com",
    firstName: "Admin",
    lastName: "Sistema",
    phone: "+54 9 11 0000-0000",
    role: "admin",
    status: "active",
  },
];

// Mock trips
export const mockTrips: Trip[] = [
  {
    id: "trip_1",
    clientId: "1",
    driverId: "2",
    origin: "Palermo, Buenos Aires",
    destination: "San Telmo, Buenos Aires",
    description: "Mudanza pequeña - 2 cajas de libros y una silla",
    suggestedPrice: 3500,
    finalPrice: 3200,
    status: "negotiating",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T11:00:00Z",
    client: {
      id: "1",
      firstName: "María",
      lastName: "González",
      rating: 4.8,
    },
    driver: {
      id: "2",
      firstName: "Carlos",
      lastName: "Rodríguez",
      rating: 4.9,
    },
  },
  {
    id: "trip_2",
    clientId: "4",
    origin: "Villa Crespo, Buenos Aires",
    destination: "La Boca, Buenos Aires",
    description: "Electrodoméstico - Heladera pequeña",
    suggestedPrice: 5500,
    status: "searching",
    createdAt: "2025-01-15T14:15:00Z",
    updatedAt: "2025-01-15T14:15:00Z",
    client: {
      id: "4",
      firstName: "Juan",
      lastName: "Pérez",
      rating: 4.6,
    },
  },
  {
    id: "trip_3",
    clientId: "1",
    driverId: "3",
    origin: "Belgrano, Buenos Aires",
    destination: "Microcentro, Buenos Aires",
    description: "Documentos importantes para oficina",
    suggestedPrice: 2000,
    finalPrice: 2000,
    status: "completed",
    createdAt: "2025-01-14T09:00:00Z",
    updatedAt: "2025-01-14T11:30:00Z",
    client: {
      id: "1",
      firstName: "María",
      lastName: "González",
      rating: 4.8,
    },
    driver: {
      id: "3",
      firstName: "Ana",
      lastName: "Martínez",
      rating: 4.7,
    },
  },
  {
    id: "trip_4",
    clientId: "4",
    origin: "Recoleta, Buenos Aires",
    destination: "Barracas, Buenos Aires",
    description: "Compras del supermercado - 4 bolsas",
    suggestedPrice: 2800,
    status: "searching",
    createdAt: "2025-01-15T16:45:00Z",
    updatedAt: "2025-01-15T16:45:00Z",
    client: {
      id: "4",
      firstName: "Juan",
      lastName: "Pérez",
      rating: 4.6,
    },
  },
  {
    id: "trip_5",
    clientId: "1",
    driverId: "2",
    origin: "Caballito, Buenos Aires",
    destination: "Flores, Buenos Aires",
    description: "Muebles para departamento - Mesa y 2 sillas",
    suggestedPrice: 4200,
    finalPrice: 4000,
    status: "confirmed",
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-01-15T13:00:00Z",
    client: {
      id: "1",
      firstName: "María",
      lastName: "González",
      rating: 4.8,
    },
    driver: {
      id: "2",
      firstName: "Carlos",
      lastName: "Rodríguez",
      rating: 4.9,
    },
  },
  {
    id: "trip_6",
    clientId: "4",
    origin: "Almagro, Buenos Aires",
    destination: "Once, Buenos Aires",
    description: "Equipamiento de oficina - Monitor y CPU",
    suggestedPrice: 3000,
    status: "searching",
    createdAt: "2025-01-15T15:30:00Z",
    updatedAt: "2025-01-15T15:30:00Z",
    client: {
      id: "4",
      firstName: "Juan",
      lastName: "Pérez",
      rating: 4.6,
    },
  },
];

// Helper functions
export const getMockTripsByStatus = (status: Trip["status"]): Trip[] => {
  return mockTrips.filter((trip) => trip.status === status);
};

export const getMockTripsByClient = (clientId: string): Trip[] => {
  return mockTrips.filter((trip) => trip.clientId === clientId);
};

export const getMockTripsByDriver = (driverId: string): Trip[] => {
  return mockTrips.filter((trip) => trip.driverId === driverId);
};

export const getMockAvailableTrips = (): Trip[] => {
  return mockTrips.filter((trip) => trip.status === "searching");
};

// Current user mock (será reemplazado por el store real)
export const mockCurrentUser: User = mockUsers[0]; // María González como cliente por defecto

export const mockCurrentDriver: User = mockUsers[1]; // Carlos Rodríguez como conductor
