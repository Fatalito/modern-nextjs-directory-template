import { type NextRequest, NextResponse } from "next/server";
import { getCacheControl } from "./get-cache-control";
import { getCspHeader } from "./get-csp-header";

/**
 * Creates a NextResponse with security and cache headers.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse with security headers set
 * - Content-Security-Policy blocking external scripts and untrusted sources
 * - Cache-Control based on request characteristics (public vs private)
 */
export const createSecureResponse = (request: NextRequest): NextResponse => {
  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", getCspHeader());
  response.headers.set("Cache-Control", getCacheControl(request));

  return response;
};
