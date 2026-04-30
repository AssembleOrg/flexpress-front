"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { usePushPermission } from "@/lib/hooks/usePushPermission";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useAuthStore } from "@/lib/stores/authStore";
import { StoreHydration } from "./StoreHydration";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Mantiene la conexión WebSocket activa globalmente mientras el usuario esté logueado.
 * Conecta al namespace /conversations (el único gateway del backend).
 * Al vivir aquí, el socket está disponible en todas las páginas — no solo en el chat.
 */
function WebSocketInitializer() {
  useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [queryClient]);

  return null;
}

function PushInitializer() {
  const { isAuthenticated } = useAuthStore();
  usePushPermission(isAuthenticated);
  return null;
}

export function Providers({ children }: ProvidersProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!googleApiKey) {
    console.warn(
      "⚠️ Warning: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured. Google Maps features may not work correctly.",
    );
  }

  return (
    <APIProvider apiKey={googleApiKey}>
      <QueryClientProvider client={queryClient}>
        <WebSocketInitializer />
        <PushInitializer />
        <ThemeProvider>
          <StoreHydration>
            <ErrorBoundary>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#380116",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-lato), sans-serif",
                    fontWeight: 500,
                  },
                  success: {
                    style: {
                      background: "#2ECC71",
                    },
                  },
                  error: {
                    style: {
                      background: "#E74C3C",
                    },
                  },
                }}
              />
            </ErrorBoundary>
          </StoreHydration>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </APIProvider>
  );
}
