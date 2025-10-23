import { useCallback, useState } from "react";

interface UseLoadingStateReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (fn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook para manejar estados de loading de forma consistente
 *
 * @example
 * ```tsx
 * const { data, isLoading, execute } = useLoadingState<Trip[]>();
 *
 * useEffect(() => {
 *   execute(() => tripsApi.getMy());
 * }, []);
 *
 * if (isLoading) return <TripCardSkeleton count={3} />;
 * if (!data) return <EmptyState />;
 * return <TripList trips={data} />;
 * ```
 */
export function useLoadingState<T = unknown>(): UseLoadingStateReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
