"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryDisabled: boolean;
  countdown: number;
}

/**
 * ErrorBoundary Component
 * Catches React errors and displays a user-friendly error message
 * Features: Retry with 20s cooldown, smart navigation based on user role
 */
export class ErrorBoundary extends React.Component<Props, State> {
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryDisabled: false,
      countdown: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryDisabled: false,
      countdown: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  componentWillUnmount() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  handleRetry = () => {
    // Disable retry button and start countdown
    this.setState({ retryDisabled: true, countdown: 20 });

    // Start countdown timer
    this.intervalRef = setInterval(() => {
      this.setState((prevState) => {
        const newCountdown = prevState.countdown - 1;
        if (newCountdown <= 0) {
          // Countdown finished, enable retry button
          if (this.intervalRef) {
            clearInterval(this.intervalRef);
            this.intervalRef = null;
          }
          return { countdown: 0, retryDisabled: false };
        }
        return { countdown: newCountdown };
      });
    }, 1000);

    // Reset error state to retry
    this.setState({ hasError: false, error: null });
  };

  getDashboardUrl = (): string => {
    // Smart navigation based on current route
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/driver")) {
        return "/driver/dashboard";
      }
      if (pathname.startsWith("/client")) {
        return "/client/dashboard";
      }
    }
    return "/";
  };

  render() {
    if (this.state.hasError) {
      const dashboardUrl = this.getDashboardUrl();
      const { countdown, retryDisabled } = this.state;

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Ha ocurrido un error
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Disculpa, algo salió mal. Puedes intentar nuevamente o ir a tu
              panel de control.
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
                  maxHeight: "200px",
                }}
              >
                <Typography component="pre" variant="caption">
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Alert>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleRetry}
              disabled={retryDisabled}
              sx={{ flex: 1 }}
            >
              {retryDisabled ? `⟳ Reintentar (${countdown}s)` : "⟳ Reintentar"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                window.location.href = dashboardUrl;
              }}
              sx={{ flex: 1 }}
            >
              Volver a Panel
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}
