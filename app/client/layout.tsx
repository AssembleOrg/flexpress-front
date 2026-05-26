import type { Metadata } from "next";
import { AuthNavbar } from "@/components/layout/AuthNavbar";
import { BottomNavbar } from "@/components/layout/BottomNavbar";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { RoleGuard } from "@/components/guards/RoleGuard";

export const metadata: Metadata = {
  title: "Cliente - Flexpress",
  description: "Panel de cliente para solicitar y gestionar fletes",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoleGuard requiredRole="user">
        <div className="client-layout">
          <AuthNavbar />
          {children}
          <BottomNavbar />
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
