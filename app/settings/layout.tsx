import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración - Flexpress",
  description: "Administra tu cuenta y preferencias",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
