import type { Metadata, Viewport } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

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
      { url: "/genfavicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
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
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
