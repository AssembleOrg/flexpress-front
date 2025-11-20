import type { Metadata } from "next";
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
    <div className="driver-layout">
      {children}
      <BottomNavbar />
    </div>
  );
}
