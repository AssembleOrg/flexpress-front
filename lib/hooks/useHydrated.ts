"use client";

import { useEffect, useState } from "react";

/**
 * Hook que asegura que el componente solo se renderiza después de hidratarse.
 * Previene hydration mismatch cuando usamos Zustand con persist.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
