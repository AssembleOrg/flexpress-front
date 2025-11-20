import type { Metadata } from "next";
import { BottomNavbar } from "@/components/layout/BottomNavbar";

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
    <div className="client-layout">
      {children}
      <BottomNavbar />
    </div>
  );
}
