import type { NextRequest } from "next/server";
import { CACHE_STRATEGIES } from "@/shared/config";

/**
 * Determines the Cache-Control strategy.
 * Ensures private data/mutations aren't cached at the Edge,
 * while allowing BFcache for public GET requests.
 * @param request - The incoming NextRequest object
 * @returns A Cache-Control header value based on request characteristics
 * - Private for non-GET, authenticated, or session-based requests
 * - Public with SWR for unauthenticated GET requests
 */

export const getCacheControl = (request: NextRequest): string => {
  const isProtected =
    request.method !== "GET" ||
    request.headers.has("Authorization") ||
    request.cookies.has("session");
  return isProtected ? CACHE_STRATEGIES.PRIVATE : CACHE_STRATEGIES.PUBLIC_SWR;
};
