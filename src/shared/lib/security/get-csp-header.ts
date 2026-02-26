import { imageHosts, STATIC_CSP_DIRECTIVES } from "@/shared/config";

// Vercel injects VERCEL_ENV automatically: 'preview' | 'production' | 'development'
const VERCEL_LIVE_HOST = "https://vercel.live";

/**
 * Generates a Content Security Policy header value with image and connect sources.
 * Uses 'unsafe-inline' for scripts to allow Next.js hydration scripts without nonce-based dynamic rendering.
 * In development, also allows 'unsafe-eval' for easier debugging.
 * In Vercel preview deployments, allows vercel.live for the toolbar/feedback widget.
 * @returns A Content Security Policy header string
 */
export const getCspHeader = (
  env = process.env.NODE_ENV,
  vercelEnv = process.env.VERCEL_ENV,
): string => {
  const isDev = env === "development";
  const isVercelPreview = vercelEnv === "preview";

  const secureImageSources = imageHosts
    .map((host) => `https://${host}`)
    .join(" ");

  const connectSources = [
    "'self'",
    isDev ? "ws://localhost:*" : "",
    isVercelPreview ? VERCEL_LIVE_HOST : "",
  ]
    .filter(Boolean)
    .join(" ");

  const directives: Record<string, string> = {
    ...STATIC_CSP_DIRECTIVES,
    "img-src": `'self' blob: data: ${secureImageSources}`,
    "connect-src": connectSources,
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      isDev ? "'unsafe-eval'" : "",
      isVercelPreview ? VERCEL_LIVE_HOST : "",
    ]
      .filter(Boolean)
      .join(" "),
    "style-src": "'self' 'unsafe-inline'",
    ...(isVercelPreview && { "frame-src": VERCEL_LIVE_HOST }),
  };

  return Object.entries(directives)
    .map(([key, value]) => (value ? `${key} ${value}` : key))
    .join("; ");
};
