"use client";

import { Box, Card, CardContent } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
          key={`skeleton-${index}`}
          sx={{
            mb: 2,
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Skeleton circle width={48} height={48} />
              <Box flex={1}>
                <Skeleton height={20} width="60%" />
                <Skeleton height={16} width="40%" style={{ marginTop: 4 }} />
              </Box>
            </Box>
            <Skeleton height={16} count={2} style={{ marginBottom: 8 }} />
            <Box display="flex" gap={1} mt={2}>
              <Skeleton height={36} width={100} />
              <Skeleton height={36} width={100} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
