"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { isStorageKey } from "@/lib/upload";

/**
 * Obtiene una URL de lectura firmada temporal para un objeto PRIVADO de Spaces.
 *
 * - Si `value` es una KEY (`{env}/private/...`), pide la firma al backend (solo admin/dueño).
 * - Si `value` es una URL directa (`http...`, incluye legacy utfs.io o públicos del CDN),
 *   devuelve el valor tal cual sin llamar al backend → compat sin breaking changes.
 *
 * TTL de lectura en backend = 1h; refrescamos antes con staleTime/refetchOnWindowFocus.
 */
export function usePresignedRead(value?: string | null) {
  const needsSign = isStorageKey(value);

  const query = useQuery({
    queryKey: ["presign-read", value],
    enabled: needsSign,
    staleTime: 45 * 60 * 1000, // 45min (< ttl 1h)
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await api.get("/storage/presign-read", {
        params: { key: value },
      });
      const data = res.data?.data ?? res.data;
      return data.url as string;
    },
  });

  // Público / legacy: usar directo. Privado: la URL firmada (undefined mientras carga).
  const url = needsSign ? query.data : (value ?? undefined);

  return {
    url,
    isLoading: needsSign ? query.isLoading : false,
    isError: needsSign ? query.isError : false,
  };
}
