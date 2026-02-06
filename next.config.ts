import type { NextConfig } from "next";
import { env } from "./src/shared/config/env";
import { imageHosts } from "./src/shared/config/site-config";

const isProd = env.NODE_ENV === "production";

// Map NEXT_OUTPUT_MODE to Next.js output format (see README Deployment Configuration section)
// For development, output is always undefined (Node.js server mode with HMR)
const outputMap = {
  serverless: undefined,
  static: "export",
  standalone: "standalone",
} as const;
const nextOutput = outputMap[env.NEXT_OUTPUT_MODE];
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
const shouldDisableImageOptimization = nextOutput === "export" || !isProd;

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

  images: {
    unoptimized: shouldDisableImageOptimization,
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
