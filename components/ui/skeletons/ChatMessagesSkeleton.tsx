"use client";

import { Box, Card, CardContent, Paper } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ChatMessagesSkeleton() {
  return (
    <Card
      elevation={2}
      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      <CardContent
        sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
          {/* Message from other user */}
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: "70%",
                borderRadius: 2,
              }}
            >
              <Skeleton width={100} height={12} style={{ marginBottom: 4 }} />
              <Skeleton width={250} height={14} />
              <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
            </Paper>
          </Box>

          {/* Message from current user */}
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: "70%",
                borderRadius: 2,
              }}
            >
              <Skeleton width={100} height={12} style={{ marginBottom: 4 }} />
              <Skeleton width={200} height={14} />
              <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
            </Paper>
          </Box>

          {/* Another message from other user */}
          <Box display="flex" justifyContent="flex-start" mb={2}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: "70%",
                borderRadius: 2,
              }}
            >
              <Skeleton width={100} height={12} style={{ marginBottom: 4 }} />
              <Skeleton width={300} height={14} count={2} />
              <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
            </Paper>
          </Box>
        </Box>

        {/* Message Input Skeleton */}
        <Box display="flex" gap={1}>
          <Skeleton height={40} style={{ flex: 1 }} borderRadius={8} />
          <Skeleton circle width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
}
