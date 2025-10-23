import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación - Flexpress",
  description: "Inicia sesión o regístrate en Flexpress",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* Auth pages don't need additional navigation */}
      {children}
    </div>
  );
}
