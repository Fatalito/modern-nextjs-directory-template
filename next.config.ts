import type { NextConfig } from "next";
import { env } from "./src/shared/config/env";
import { imageHosts } from "./src/shared/config/site-config";

const connectSrc = ["'self'"]; // Add external APIs
const isProd = env.NODE_ENV === "production";

// Map NEXT_OUTPUT_MODE to Next.js output format (see README Deployment Configuration section)
// For development, output is always undefined (Node.js server mode with HMR)
const outputMap = {
  serverless: undefined,
  static: "export",
  standalone: "standalone",
} as const;
const nextOutput = outputMap[env.NEXT_OUTPUT_MODE];
if (!isProd) {
  connectSrc.push("ws://localhost:3000");
}
const styleSrc = isProd
  ? "'self' 'unsafe-inline'" // Required for Tailwind 4 Runtime styles
  : "'self' 'unsafe-inline' 'unsafe-eval'"; // Lax for HMR in dev
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()", // Disables legacy Google's FLoC tracking
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "font-src 'self' data:",
      "img-src 'self' data: https:",
      `connect-src ${connectSrc.join(" ")}`,
      // Logic: Use unsafe-eval ONLY in development
      `script-src 'self' ${isProd ? "" : "'unsafe-inline' 'unsafe-eval'"}`,
      `style-src ${styleSrc}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ]
      .join("; ")
      .replace(/\s{2,}/g, " "), // NOSONAR - clean up multiple spaces
  },
];

const nextConfig: NextConfig = {
  // React 19 compiler for auto-memoisation and state management optimisations
  reactCompiler: true,

  // Output mode based on deployment target
  output: isProd ? nextOutput : undefined,

  // Security and caching headers
  async headers() {
    const headers = [...securityHeaders];

    if (env.ENABLE_HSTS) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [{ source: "/(.*)", headers }];
  },

  // Image optimisation for external sources
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
