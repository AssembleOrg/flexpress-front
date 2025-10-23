"use client";

import { Box, Card, CardContent, Container, Divider } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function TripDetailSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box mb={4}>
          <Skeleton
            width={200}
            height={40}
            style={{ marginBottom: 24 }}
            borderRadius={8}
          />
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Skeleton circle width={40} height={40} />
            <Skeleton width={250} height={36} />
          </Box>
          <Skeleton width={140} height={32} borderRadius={16} />
        </Box>

        {/* User Info Card */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton width={100} height={24} style={{ marginBottom: 24 }} />
            <Box display="flex" alignItems="center" gap={2}>
              <Skeleton circle width={64} height={64} />
              <Box flex={1}>
                <Skeleton width={180} height={24} style={{ marginBottom: 8 }} />
                <Skeleton width={140} height={16} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Trip Details Card */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton width={150} height={24} style={{ marginBottom: 24 }} />

            {/* Locations */}
            <Box mb={3}>
              <Box display="flex" alignItems="start" gap={2} mb={2}>
                <Skeleton
                  circle
                  width={24}
                  height={24}
                  style={{ marginTop: 4 }}
                />
                <Box flex={1}>
                  <Skeleton
                    width={60}
                    height={12}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="70%" height={20} />
                </Box>
              </Box>
              <Box display="flex" alignItems="start" gap={2}>
                <Skeleton
                  circle
                  width={24}
                  height={24}
                  style={{ marginTop: 4 }}
                />
                <Box flex={1}>
                  <Skeleton
                    width={60}
                    height={12}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="65%" height={20} />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Box mb={3}>
              <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
              <Skeleton height={16} count={2} />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Price */}
            <Box>
              <Skeleton width={140} height={12} style={{ marginBottom: 8 }} />
              <Skeleton width={120} height={36} style={{ marginBottom: 8 }} />
              <Skeleton width={250} height={14} />
            </Box>
          </CardContent>
        </Card>

        {/* Alert */}
        <Box mb={4}>
          <Skeleton height={60} borderRadius={8} />
        </Box>

        {/* Action Button */}
        <Box textAlign="center">
          <Skeleton
            width={200}
            height={48}
            borderRadius={24}
            style={{ margin: "0 auto" }}
          />
          <Skeleton width={300} height={14} style={{ marginTop: 8 }} />
        </Box>
      </Container>
    </Box>
  );
}
