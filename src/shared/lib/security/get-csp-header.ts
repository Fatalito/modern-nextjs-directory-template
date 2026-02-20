import { imageHosts, STATIC_CSP_DIRECTIVES } from "@/shared/config";

/**
 * Generates a Content Security Policy header value with image and connect sources.
 * Uses 'unsafe-inline' for scripts to allow Next.js hydration scripts without nonce-based dynamic rendering.
 * In development, also allows 'unsafe-eval' for easier debugging.
 * @returns A Content Security Policy header string
 */
export const getCspHeader = (env = process.env.NODE_ENV): string => {
  const isDev = env === "development";
  const secureImageSources = imageHosts
    .map((host) => `https://${host}`)
    .join(" ");
  const connectSources = ["'self'", isDev ? "ws://localhost:*" : ""]
    .filter(Boolean)
    .join(" ");

  const directives: Record<string, string> = {
    ...STATIC_CSP_DIRECTIVES,
    "img-src": `'self' blob: data: ${secureImageSources}`,
    "connect-src": connectSources,
    "script-src": `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src": "'self' 'unsafe-inline'",
  };

  return Object.entries(directives)
    .map(([key, value]) => (value ? `${key} ${value}` : key))
    .join("; ");
};
