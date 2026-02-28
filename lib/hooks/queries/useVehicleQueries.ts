import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "@/lib/api/vehicles";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Get vehicles owned by the authenticated charter
 */
export function useMyVehicles() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["vehicles", "me"],
    queryFn: () => vehiclesApi.getMyVehicles(),
    enabled: user?.role === "charter",
  });
}
