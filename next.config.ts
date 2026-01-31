import type { NextConfig } from "next";
import "./src/shared/config/env.js";
import { env } from "./src/shared/config/env.js";

const isProd = env.NODE_ENV === "production";
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()", // 'interest-cohort' blocks Google's FLoC tracking
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "font-src 'self' data:",
      "img-src 'self' data: https:",
      "connect-src 'self' ws://localhost:3000 https://swapi.dev", // Only add external APIs here
      // Logic: Use unsafe-eval ONLY in development
      `script-src 'self' ${isProd ? "" : "'unsafe-inline' 'unsafe-eval'"}`,
      `style-src 'self' 'unsafe-inline'`, // Tailwind 4 needs unsafe-inline for its runtime styles
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]
      .join("; ")
      .replace(/\s{2,}/g, " "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    const headers = securityHeaders;

    if (env.ENABLE_HSTS) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [{ source: "/(.*)", headers }];
  },
  reactCompiler: true,
};

export default nextConfig;
