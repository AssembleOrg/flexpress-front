"use client";

import { Box, Card, CardContent, useTheme } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface TripCardSkeletonProps {
  count?: number;
}

export function TripCardSkeleton({ count = 1 }: TripCardSkeletonProps) {
  const _theme = useTheme();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          elevation={2}
          sx={{
            mb: 2,
          }}
        >
          <CardContent>
            {/* Header with status and price */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Skeleton width={140} height={32} borderRadius={16} />
              <Skeleton width={100} height={28} />
            </Box>

            {/* Locations */}
            <Box mb={2}>
              <Box display="flex" alignItems="flex-start" mb={1}>
                <Skeleton
                  circle
                  width={24}
                  height={24}
                  style={{ marginRight: 8, marginTop: 4 }}
                />
                <Box flex={1}>
                  <Skeleton
                    width={60}
                    height={12}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="80%" height={20} />
                </Box>
              </Box>
              <Box display="flex" alignItems="flex-start">
                <Skeleton
                  circle
                  width={24}
                  height={24}
                  style={{ marginRight: 8, marginTop: 4 }}
                />
                <Box flex={1}>
                  <Skeleton
                    width={60}
                    height={12}
                    style={{ marginBottom: 4 }}
                  />
                  <Skeleton width="75%" height={20} />
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Box mb={2}>
              <Skeleton height={16} count={2} style={{ marginBottom: 4 }} />
            </Box>

            {/* Actions */}
            <Box display="flex" gap={1} mt={2}>
              <Skeleton height={40} style={{ flex: 1 }} borderRadius={8} />
              <Skeleton height={40} width={80} borderRadius={8} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
