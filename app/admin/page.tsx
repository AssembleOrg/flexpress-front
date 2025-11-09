"use client";

import { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Badge,
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAdminReports } from "@/lib/hooks/queries/useAdminQueries";
import { UsersTable } from "@/components/admin/UsersTable";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { TripsTable } from "@/components/admin/TripsTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuthStore();

  // Fetch pending reports for badge
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports({
    status: "pending",
  });

  const pendingReportsCount = reportsData?.meta?.total ?? 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin-tabs"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#dca621",
            },
          }}
        >
          <Tab label="Usuarios" id="admin-tab-0" aria-controls="admin-tabpanel-0" />

          <Tab
            label={
              reportsLoading ? (
                "Reportes"
              ) : (
                <Badge
                  badgeContent={pendingReportsCount}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#380116",
                      color: "white",
                    },
                  }}
                  overlap="circular"
                >
                  Reportes
                </Badge>
              )
            }
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />

          <Tab label="Viajes" id="admin-tab-2" aria-controls="admin-tabpanel-2" />

          {/* Pagos tab only for admin */}
          {user?.role === "admin" && (
            <Tab
              label="Pagos"
              id="admin-tab-3"
              aria-controls="admin-tabpanel-3"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <UsersTable />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ReportsTable />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <TripsTable />
      </TabPanel>

      {user?.role === "admin" && (
        <TabPanel value={activeTab} index={3}>
          <PaymentsTable />
        </TabPanel>
      )}
    </Container>
  );
}
