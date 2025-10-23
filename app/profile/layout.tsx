import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil - Flexpress",
  description: "Gestiona tu perfil e información personal",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
