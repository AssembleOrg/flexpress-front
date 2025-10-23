"use client";

import { Box, Card, CardContent, Container, Paper } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface DashboardSkeletonProps {
  showToggle?: boolean;
}

export function DashboardSkeleton({
  showToggle = false,
}: DashboardSkeletonProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header with optional toggle */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box flex={1}>
            <Skeleton width={250} height={36} style={{ marginBottom: 8 }} />
            <Skeleton width={350} height={20} />
          </Box>

          {showToggle && (
            <Box>
              <Skeleton width={180} height={40} borderRadius={20} />
            </Box>
          )}
        </Paper>

        {/* Empty State or Content Skeleton */}
        <Card elevation={2}>
          <CardContent
            sx={{
              p: 4,
              textAlign: "center",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Skeleton
              circle
              width={80}
              height={80}
              style={{ marginBottom: 16 }}
            />
            <Skeleton width={300} height={32} style={{ marginBottom: 12 }} />
            <Skeleton width={400} height={20} style={{ marginBottom: 24 }} />
            <Skeleton width={180} height={44} borderRadius={22} />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
