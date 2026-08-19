"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
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
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.all,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [queryClient]);

  return null;
}

/**
 * Escucha mensajes del Service Worker (cuando el usuario clickea una notificación push)
 * y navega usando el router de Next.js, evitando recargar la página.
 */
function SWMessageListener() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    const handler = (event: MessageEvent) => {
      if (
        event.data?.type === "NAVIGATE" &&
        typeof event.data.url === "string"
      ) {
        router.push(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handler);
  }, [router]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  // Ya no se carga el SDK de Google en el browser: el autocomplete de Places
  // pasa por /api/places/* con la key server. Cero keys de Google en el bundle.
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketInitializer />
      <SWMessageListener />
      <ThemeProvider>
        <StoreHydration>
          <ErrorBoundary>
            {children}
            <InstallPrompt />
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
  );
}
