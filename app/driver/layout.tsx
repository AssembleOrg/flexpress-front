import type { Metadata } from "next";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";
import { VerifiedCharterRouteGuard } from "@/components/guards/VerifiedCharterRouteGuard";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";

export const metadata: Metadata = {
  title: "Conductor - Flexpress",
  description: "Panel de conductor para gestionar viajes y disponibilidad",
};

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard requiredRole="charter">
        <div className="driver-layout">
          <AuthNavbar />
          <VerifiedCharterRouteGuard>{children}</VerifiedCharterRouteGuard>
          <BottomNavbar />
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
