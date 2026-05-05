import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // gzip explícito (Next ya lo hace por default en prod, pero declarado
  // queda visible en el config).
  compress: true,

  async rewrites() {
    // `API_URL` (server-only) tiene prioridad para soportar private
    // domain de Railway (`*.railway.internal`). Si no, cae a
    // `NEXT_PUBLIC_API_URL` (visible en el bundle del cliente). El
    // fallback localhost solo aplica en dev.
    const backendBase =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
