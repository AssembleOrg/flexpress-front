"use client";

import { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAdminReports, usePendingCharters } from "@/lib/hooks/queries/useAdminQueries";
import { usePendingPaymentsCount } from "@/lib/hooks/queries/usePaymentQueries";
import { UsersTable } from "@/components/admin/UsersTable";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { TripsTable } from "@/components/admin/TripsTable";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { SystemConfigTab } from "@/components/admin/SystemConfigTab";
import { PendingChartersTab } from "@/components/admin/PendingChartersTab";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch pending reports for badge
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports({
    status: "pending",
  });

  // Fetch pending charters for badge
  const { data: pendingChartersData, isLoading: chartersLoading } = usePendingCharters();

  // Fetch pending payments for badge
  const { data: pendingPaymentsCount = 0, isLoading: paymentsLoading } = usePendingPaymentsCount();

  const pendingReportsCount = reportsData?.meta?.total ?? 0;
  const pendingChartersCount = pendingChartersData?.length ?? 0;

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
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          aria-label="admin-tabs"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#dca621",
            },
            "& .MuiTabs-scrollButtons": {
              color: "#dca621",
              "&.Mui-disabled": { opacity: 0.3 },
            },
          }}
        >
          <Tab
            label="Usuarios"
            id="admin-tab-0"
            aria-controls="admin-tabpanel-0"
          />

          <Tab
            label={
              chartersLoading ? (
                "Conductores"
              ) : (
                <Badge
                  badgeContent={pendingChartersCount}
                  overlap="rectangular"
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#dca621",
                      color: "#212121",
                      top: -6,
                      right: -8,
                    },
                  }}
                >
                  <Box component="span" sx={{ pr: 1.5 }}>Conductores</Box>
                </Badge>
              )
            }
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />

          <Tab
            label={
              reportsLoading ? (
                "Reportes"
              ) : (
                <Badge
                  badgeContent={pendingReportsCount}
                  overlap="rectangular"
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#380116",
                      color: "white",
                      top: -6,
                      right: -8,
                    },
                  }}
                >
                  <Box component="span" sx={{ pr: 1.5 }}>Reportes</Box>
                </Badge>
              )
            }
            id="admin-tab-2"
            aria-controls="admin-tabpanel-2"
          />

          <Tab
            label="Viajes"
            id="admin-tab-3"
            aria-controls="admin-tabpanel-3"
          />

          {/* Pagos tab only for admin */}
          {user?.role === "admin" && (
            <Tab
              label={
                paymentsLoading ? (
                  "Pagos"
                ) : (
                  <Badge
                    badgeContent={pendingPaymentsCount}
                    overlap="rectangular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#e74c3c",
                        color: "white",
                        top: -6,
                        right: -8,
                      },
                    }}
                  >
                    <Box component="span" sx={{ pr: 1.5 }}>Pagos</Box>
                  </Badge>
                )
              }
              id="admin-tab-4"
              aria-controls="admin-tabpanel-4"
            />
          )}

          {/* Configuración tab only for admin */}
          {user?.role === "admin" && (
            <Tab
              label="Configuración"
              id="admin-tab-5"
              aria-controls="admin-tabpanel-5"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <UsersTable />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <PendingChartersTab />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ReportsTable />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <TripsTable />
      </TabPanel>

      {user?.role === "admin" && (
        <TabPanel value={activeTab} index={4}>
          <PaymentsTable />
        </TabPanel>
      )}

      {user?.role === "admin" && (
        <TabPanel value={activeTab} index={5}>
          <SystemConfigTab />
        </TabPanel>
      )}
    </Container>
  );
}
