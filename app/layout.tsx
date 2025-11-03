import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#380116",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Flexpress - Tu flete, fácil y seguro",
  description:
    "Plataforma que conecta personas que necesitan transportar objetos con conductores profesionales verificados en Buenos Aires",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/genfavicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/genfavicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/genfavicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/genfavicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/genfavicon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/genfavicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flexpress",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
