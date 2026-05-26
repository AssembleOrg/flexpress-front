"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { PendingChartersTab } from "./PendingChartersTab";
import { PendingDriversTab } from "./PendingDriversTab";
import { PendingHelpersTab } from "./PendingHelpersTab";

interface VerificationsTabProps {
  pendingChartersCount: number;
  pendingVehiclesCount: number;
  pendingDriversCount: number;
  pendingHelpersCount: number;
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        px: 0.5,
        borderRadius: 999,
        bgcolor: "#dca621",
        color: "#212121",
        fontSize: "0.65rem",
        fontWeight: 700,
        ml: 0.75,
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
      }}
    >
      {count}
    </Box>
  );
}

function TabLabel({ text, count }: { text: string; count: number }) {
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}
    >
      {text}
      <Badge count={count} />
    </Box>
  );
}

export function VerificationsTab({
  pendingChartersCount,
  pendingVehiclesCount,
  pendingDriversCount,
  pendingHelpersCount,
}: VerificationsTabProps) {
  const [sub, setSub] = useState(0);

  const tabSx = {
    textTransform: "none" as const,
    whiteSpace: "nowrap" as const,
    minWidth: "auto",
    minHeight: 44,
    fontWeight: 600,
    fontSize: { xs: "0.8rem", md: "0.875rem" },
    px: { xs: 1.25, md: 2 },
    color: "text.secondary",
    "&.Mui-selected": { color: "primary.main" },
  };

  return (
    <Box>
      <Tabs
        value={sub}
        onChange={(_, v) => setSub(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          minHeight: 44,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTabs-indicator": {
            backgroundColor: "secondary.main",
            height: 3,
            borderRadius: 3,
          },
        }}
      >
        <Tab
          sx={tabSx}
          label={
            <TabLabel
              text="Charters / Vehículos"
              count={pendingChartersCount + pendingVehiclesCount}
            />
          }
        />
        <Tab
          sx={tabSx}
          label={<TabLabel text="Conductores extras" count={pendingDriversCount} />}
        />
        <Tab
          sx={tabSx}
          label={<TabLabel text="Ayudantes" count={pendingHelpersCount} />}
        />
      </Tabs>

      {sub === 0 && <PendingChartersTab />}
      {sub === 1 && <PendingDriversTab />}
      {sub === 2 && <PendingHelpersTab />}
    </Box>
  );
}
