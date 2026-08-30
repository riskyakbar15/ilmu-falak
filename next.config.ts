import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Aplikasi murni klien tanpa sumber daya eksternal; izinkan sensor hanya untuk origin sendiri.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "geolocation=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self), camera=(), microphone=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Serwist menyuntikkan konfigurasi webpack; lewati saat dev agar Turbopack tetap dipakai.
// Service worker dihasilkan pada build produksi (`next build --webpack`).
const config: NextConfig =
  process.env.NODE_ENV === "development"
    ? nextConfig
    : withSerwistInit({
        swSrc: "app/sw.ts",
        swDest: "public/sw.js",
      })(nextConfig);

export default config;
