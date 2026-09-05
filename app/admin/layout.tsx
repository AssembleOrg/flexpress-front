"use client";

import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { dashboardFor, isAdminRole } from "@/lib/routes";
import { useAuthStore } from "@/lib/stores/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current page is the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check on login page, and wait for the store to rehydrate from
    // localStorage before deciding — el store arranca vacío (skipHydration).
    if (isLoginPage || !hydrated) {
      return;
    }

    // Sin sesión → login de admin. Con sesión de otro rol → su dashboard.
    // `replace`: la pantalla que rebota no debe quedar en el historial.
    if (!isAuthenticated || !user) {
      router.replace("/admin/login");
    } else if (!isAdminRole(user.role)) {
      router.replace(dashboardFor(user.role));
    }
  }, [isAuthenticated, user, router, isLoginPage, hydrated]);

  // Show loading while hydrating or checking auth (skip on login page)
  if (
    !isLoginPage &&
    (!hydrated || !isAuthenticated || !isAdminRole(user?.role))
  ) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Only show navbar if not on login page */}
      {!isLoginPage && <AdminNavbar />}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}
