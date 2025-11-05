import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

export function DashboardSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />

      {/* Stats Cards Skeleton */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ flex: 1 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={32} />
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Main Content Skeleton */}
      <Card>
        <CardContent>
          {/* Filter/Header Skeleton */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Skeleton variant="rectangular" width={150} height={40} />
            <Skeleton variant="rectangular" width={150} height={40} />
          </Stack>

          {/* List Items Skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0" }}>
              <Stack spacing={1}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="rectangular" width={80} height={32} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Stack>
              </Stack>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}
