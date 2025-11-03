"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

  return (
    <APIProvider apiKey={googleApiKey}>
      <ThemeProvider>
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
      </ThemeProvider>
    </APIProvider>
  );
}
