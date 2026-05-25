import { useQuery } from "@tanstack/react-query";
import { charterPersonnelApi } from "@/lib/api/charterPersonnel";
import { useAuthStore } from "@/lib/stores/authStore";
import { queryKeys } from "./queryFactory";

export function useMyDrivers() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.charterPersonnel.myDrivers(),
    queryFn: () => charterPersonnelApi.listMyDrivers(),
    enabled: user?.role === "charter",
  });
}

export function useMyHelpers() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.charterPersonnel.myHelpers(),
    queryFn: () => charterPersonnelApi.listMyHelpers(),
    enabled: user?.role === "charter",
  });
}

export function useDriverDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.charterPersonnel.driverDetail(id ?? ""),
    queryFn: () => charterPersonnelApi.getDriver(id as string),
    enabled: !!id,
  });
}

export function useHelperDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.charterPersonnel.helperDetail(id ?? ""),
    queryFn: () => charterPersonnelApi.getHelper(id as string),
    enabled: !!id,
  });
}

export function usePendingDriversAdmin() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.admin.drivers.pending(),
    queryFn: () => charterPersonnelApi.adminListPendingDrivers(),
    enabled: user?.role === "admin" || user?.role === "subadmin",
  });
}

export function usePendingHelpersAdmin() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.admin.helpers.pending(),
    queryFn: () => charterPersonnelApi.adminListPendingHelpers(),
    enabled: user?.role === "admin" || user?.role === "subadmin",
  });
}
