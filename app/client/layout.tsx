import type { Metadata } from "next";

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
      {/* Add client-specific navigation/header here if needed */}
      {children}
    </div>
  );
}
