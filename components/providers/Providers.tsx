"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";

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
    </ThemeProvider>
  );
}
