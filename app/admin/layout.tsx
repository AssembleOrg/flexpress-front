"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "@/lib/stores/authStore";
import { AdminNavbar } from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current page is the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      return;
    }

    // Check if user is authenticated and has admin or subadmin role
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "subadmin")
    ) {
      // Redirect to admin login
      router.push("/admin/login");
    }
  }, [isAuthenticated, user?.role, router, isLoginPage]);

  // Show loading while checking auth (skip on login page)
  if (
    !isLoginPage &&
    (!isAuthenticated || (user?.role !== "admin" && user?.role !== "subadmin"))
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
