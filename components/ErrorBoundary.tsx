"use client";

import { Alert, Box, Button, Container, Typography } from "@mui/material";
import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * Catches React errors and displays a user-friendly error message
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Ha ocurrido un error
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Disculpa, algo salió mal. Por favor, intenta recargar la página.
            </Typography>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  overflow: "auto",
                }}
              >
                <Typography component="pre" variant="caption">
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Alert>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Ir al inicio
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}
