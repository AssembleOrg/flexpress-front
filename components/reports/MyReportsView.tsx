"use client";

import { ReportOutlined as ReportIcon } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TabPanel } from "@/components/ui/TabPanel";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "@/lib/constants/mobileDesign";
import {
  useMyReports,
  useReportsAgainstMe,
} from "@/lib/hooks/queries/useReportQueries";
import type { Report } from "@/lib/types/api";

function ReportsList({
  reports,
  isLoading,
  perspective,
  emptyTitle,
}: {
  reports: Report[];
  isLoading: boolean;
  perspective: "mine" | "against";
  emptyTitle: string;
}) {
  if (isLoading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<ReportIcon sx={{ fontSize: 64, color: "grey.300" }} />}
        title={emptyTitle}
      />
    );
  }

  return (
    <Stack gap={2}>
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} perspective={perspective} />
      ))}
    </Stack>
  );
}

/**
 * Shared user-facing reports view with two tabs (made / against).
 * Mounted under /client/reports and /driver/reports (each guarded by its layout).
 * Reads ?tab=mine|against for deep-linking from the resolution notification.
 */
export function MyReportsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "against" ? 1 : 0;

  const { data: myReports = [], isLoading: loadingMine } = useMyReports();
  const { data: againstMe = [], isLoading: loadingAgainst } =
    useReportsAgainstMe();

  const handleTabChange = (index: number) => {
    const tab = index === 1 ? "against" : "mine";
    router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          px: 2,
          pb: { xs: `${MOBILE_BOTTOM_NAV_HEIGHT + 24}px`, md: 4 },
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} mb={3}>
          <ReportIcon sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Mis reportes
          </Typography>
        </Stack>

        <TabPanel
          initialTab={initialTab}
          onChange={handleTabChange}
          tabs={[
            {
              label: `Hechos por mí${myReports.length ? ` (${myReports.length})` : ""}`,
              content: (
                <ReportsList
                  reports={myReports}
                  isLoading={loadingMine}
                  perspective="mine"
                  emptyTitle="No hiciste ningún reporte"
                />
              ),
            },
            {
              label: `Contra mí${againstMe.length ? ` (${againstMe.length})` : ""}`,
              content: (
                <ReportsList
                  reports={againstMe}
                  isLoading={loadingAgainst}
                  perspective="against"
                  emptyTitle="No tienes reportes en tu contra"
                />
              ),
            },
          ]}
        />
      </Container>
    </Box>
  );
}
