import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getCacheControl } from "./get-cache-control";
import { getCspHeader } from "./get-csp-header";

/**
 * Creates a NextResponse with an integrated security context.
 * It generates a unique nonce, injects it into request headers for App Router consumption and applies CSP (with nonce) and Cache-Control to the response.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse with security headers set
 * - Content-Security-Policy with nonce for inline script protection
 * - Cache-Control based on request characteristics (public vs private)
 */
export const createSecureResponse = (request: NextRequest): NextResponse => {
  const nonce = btoa(randomUUID());

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", getCspHeader(nonce));
  response.headers.set("Cache-Control", getCacheControl(request));

  return response;
};
