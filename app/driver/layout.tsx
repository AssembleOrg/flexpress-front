import type { Metadata } from "next";

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
      {/* Add driver-specific navigation/header here if needed */}
      {children}
    </div>
  );
}