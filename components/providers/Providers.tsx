"use client";

import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#2C3E50",
            color: "#FFFFFF",
            fontFamily: "Poppins, sans-serif",
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
    </ThemeProvider>
  );
}
