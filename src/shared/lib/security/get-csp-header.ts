import { STATIC_CSP_DIRECTIVES } from "@/shared/config";
import { imageHosts } from "@/shared/config/site-config";

const isDev = process.env.NODE_ENV === "development";
const secureImageSources = imageHosts
  .map((host) => `https://${host}`)
  .join(" ");
const connectSources = ["'self'", isDev ? "ws://localhost:3000" : ""]
  .filter(Boolean)
  .join(" ");

/**
 * Generates a Content Security Policy header value with dynamic nonce and image/connect sources.
 * In development, allows 'unsafe-inline' and 'unsafe-eval' for easier debugging, these are omitted in production for enhanced security.
 * @param nonce - A unique nonce value to allow specific inline scripts while blocking others, enhancing security against XSS attacks.
 * @returns A Content Security Policy header string
 */
export const getCspHeader = (nonce: string): string => {
  const directives: Record<string, string> = {
    ...STATIC_CSP_DIRECTIVES,
    "img-src": `'self' blob: data: ${secureImageSources}`,
    "connect-src": connectSources,
    "script-src": `'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : ""}`,
    "style-src": "'self' 'unsafe-inline'",
  };

  return Object.entries(directives)
    .map(([key, value]) => (value ? `${key} ${value}` : key))
    .join("; ");
};
