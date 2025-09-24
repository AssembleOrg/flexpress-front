export interface Trip {
  id: string;
  clientId: string;
  driverId?: string;
  origin: string;
  destination: string;
  description: string;
  suggestedPrice: number;
  finalPrice?: number;
  status:
    | "searching"
    | "negotiating"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating?: number;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating?: number;
  };
}

export interface TripState {
  currentTrip: Trip | null;
  availableTrips: Trip[];
  myTrips: Trip[];
  tripHistory: Trip[];
  isLoading: boolean;
}
