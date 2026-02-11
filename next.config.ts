import type { NextConfig } from "next";
import { env } from "./src/shared/config/env";
import { imageHosts } from "./src/shared/config/site-config";

const IS_PROD = env.NODE_ENV === "production";

// Map NEXT_OUTPUT_MODE to Next.js output format (see README Deployment Configuration section)
// For development, output is always undefined (Node.js server mode with HMR)
const OUTPUT_MAP = {
  serverless: undefined,
  static: "export",
  standalone: "standalone",
} as const;
const NEXT_OUTPUT = OUTPUT_MAP[env.NEXT_OUTPUT_MODE];
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
const SHOULD_DISABLE_IMAGE_OPTIMIZATION = NEXT_OUTPUT === "export" || !IS_PROD;

const nextConfig: NextConfig = {
  // React 19 compiler for auto-memoisation and state management optimisations
  reactCompiler: true,

  // Output mode based on deployment target
  output: IS_PROD ? NEXT_OUTPUT : undefined,

  // Security and caching headers
  async headers() {
    const headers = [...SECURITY_HEADERS];

    if (env.ENABLE_HSTS) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [{ source: "/(.*)", headers }];
  },

  images: {
    unoptimized: SHOULD_DISABLE_IMAGE_OPTIMIZATION,
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;
