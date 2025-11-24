export interface Trip {
  id: string;
  userId: string;
  charterId: string;
  address: string;
  latitude: string;
  longitude: string;
  workersCount: number;
  scheduledDate: string | null;
  status:
    | "pending"
    | "charter_completed"
    | "completed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  charter?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  // TravelMatch relation for origin/destination/pricing data
  travelMatch?: {
    id: string;
    pickupAddress: string;
    destinationAddress: string;
    estimatedCredits: number;
    distanceKm: number | null;
  };
}

export interface TripState {
  currentTrip: Trip | null;
  availableTrips: Trip[];
  myTrips: Trip[];
  tripHistory: Trip[];
  isLoading: boolean;
}
