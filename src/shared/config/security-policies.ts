const CDN_STALE_WHILE_REVALIDATE_SECONDS = 60;

export const CACHE_STRATEGIES = {
  PRIVATE: "private, no-cache, no-store, max-age=0, must-revalidate",
  PUBLIC_SWR: `public, s-maxage=1, stale-while-revalidate=${CDN_STALE_WHILE_REVALIDATE_SECONDS}`,
} as const;

export const STATIC_CSP_DIRECTIVES = {
  "default-src": "'self'",
  "font-src": "'self'",
  "object-src": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "frame-ancestors": "'none'",
  "upgrade-insecure-requests": "",
} as const;
