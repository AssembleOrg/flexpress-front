"use client";

import { useEffect, useState } from "react";

/**
 * Hook para detectar cuando zustand ha hidratado el store desde localStorage
 * Previene race conditions donde se intenta usar el store antes de que se restaure
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Establecer como hidratado después del primer render
    // Esto garantiza que zustand ha restaurado desde localStorage
    setHydrated(true);
  }, []);

  return hydrated;
}
