"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { socketService } from "@/lib/socket";
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
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Initialize socket service with queryClient on mount
 * This ensures WebSocket events can invalidate React Query cache
 */
function SocketInitializer() {
  useEffect(() => {
    socketService.init(queryClient);
  }, []);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

  return (
    <APIProvider apiKey={googleApiKey}>
      <QueryClientProvider client={queryClient}>
        <SocketInitializer />
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
