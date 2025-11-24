import type { Metadata } from "next";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";

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
          {children}
          <BottomNavbar />
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
