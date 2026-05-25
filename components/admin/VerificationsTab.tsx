"use client";

import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
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
        width: 18,
        height: 18,
        borderRadius: "50%",
        bgcolor: "#dca621",
        color: "#212121",
        fontSize: "0.65rem",
        fontWeight: 700,
        ml: 0.75,
      }}
    >
      {count}
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

  return (
    <Box>
      <Tabs
        value={sub}
        onChange={(_, v) => setSub(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label={<>Charters / Vehículos<Badge count={pendingChartersCount + pendingVehiclesCount} /></>} />
        <Tab label={<>Conductores extras<Badge count={pendingDriversCount} /></>} />
        <Tab label={<>Ayudantes<Badge count={pendingHelpersCount} /></>} />
      </Tabs>

      {sub === 0 && <PendingChartersTab />}
      {sub === 1 && <PendingDriversTab />}
      {sub === 2 && <PendingHelpersTab />}
    </Box>
  );
}
