import { imageHosts, STATIC_CSP_DIRECTIVES } from "@/shared/config";

/**
 * Generates a Content Security Policy header value with dynamic nonce and image/connect sources.
 * In development, allows 'unsafe-inline' and 'unsafe-eval' for easier debugging, these are omitted in production for enhanced security.
 * @param nonce - A unique nonce value to allow specific inline scripts while blocking others, enhancing security against XSS attacks.
 * @returns A Content Security Policy header string
 */
export const getCspHeader = (
  nonce: string,
  env = process.env.NODE_ENV,
): string => {
  const isDev = env === "development";
  const secureImageSources = imageHosts
    .map((host) => `https://${host}`)
    .join(" ");
  const connectSources = ["'self'", isDev ? "ws://localhost:3000" : ""]
    .filter(Boolean)
    .join(" ");

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
