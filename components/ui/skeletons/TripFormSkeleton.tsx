import { Box, Skeleton, Stack } from "@mui/material";

export function TripFormSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Form Title */}
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 4 }} />

      {/* Form Fields */}
      <Stack spacing={3}>
        {/* Origin Field */}
        <Box>
          <Skeleton variant="text" width="15%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} />
        </Box>

        {/* Destination Field */}
        <Box>
          <Skeleton variant="text" width="15%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} />
        </Box>

        {/* Date & Time Fields */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} />
          </Box>
        </Stack>

        {/* Passengers/Info Field */}
        <Box>
          <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={120} />
        </Box>

        {/* Submit Button */}
        <Box sx={{ pt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={48} />
        </Box>
      </Stack>
    </Box>
  );
}
