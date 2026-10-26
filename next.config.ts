import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
];

const nextConfig: NextConfig = {
  // en la imagen de Docker: servidor mínimo con solo los archivos necesarios (ver Dockerfile)
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  // en desarrollo, permite abrir el sitio desde la IP de la red local (otra PC o el celular)
  allowedDevOrigins: ["192.168.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
    // fotos de las publicaciones de Facebook (módulo facebook)
    remotePatterns: [{ protocol: "https", hostname: "**.fbcdn.net" }],
  },
  experimental: {
    // fotos de evidencia: se comprimen en el navegador, pero dejamos margen
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
