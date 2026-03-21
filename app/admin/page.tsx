"use client";

import { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAdminReports, usePendingCharters, usePendingVehicles } from "@/lib/hooks/queries/useAdminQueries";
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
      {value === index && <Box sx={{ py: { xs: 1.5, md: 3 } }}>{children}</Box>}
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
  const { data: pendingVehiclesData = [] } = usePendingVehicles();

  // Fetch pending payments for badge
  const { data: pendingPaymentsCount = 0, isLoading: paymentsLoading } = usePendingPaymentsCount();

  const pendingReportsCount = reportsData?.meta?.total ?? 0;
  const pendingChartersCount = (pendingChartersData?.length ?? 0) + pendingVehiclesData.length;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Total users from UsersTable data (not available here; use pendingCharters as proxy)
  // Only counts we have at this level: pendingCharters, pendingReports, pendingPayments
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: { xs: 1, md: 3 } }}>
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
              height: 4,
              borderRadius: "4px 4px 0 0",
            },
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: { xs: "0.8rem", md: "0.875rem" },
              textTransform: "none",
              minHeight: 48,
              px: { xs: 1.5, md: 2 },
            },
            "& .Mui-selected": {
              color: "#dca621 !important",
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                Conductores
                {!chartersLoading && pendingChartersCount > 0 && (
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
                      lineHeight: 1,
                    }}
                  >
                    {pendingChartersCount}
                  </Box>
                )}
              </Box>
            }
            id="admin-tab-1"
            aria-controls="admin-tabpanel-1"
          />

          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                Reportes
                {!reportsLoading && pendingReportsCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: "#380116",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {pendingReportsCount}
                  </Box>
                )}
              </Box>
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  Pagos
                  {!paymentsLoading && pendingPaymentsCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "#e74c3c",
                        color: "white",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {pendingPaymentsCount}
                    </Box>
                  )}
                </Box>
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
