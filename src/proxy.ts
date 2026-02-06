import type { NextRequest, NextResponse } from "next/server";
import { createSecureResponse } from "@/shared/lib/security";

/**
 * Main entry point for the middleware proxy.
 * Applies security headers.
 * @param request - The incoming NextRequest object
 * @returns A NextResponse with security headers set
 */
export const proxy = (request: NextRequest): NextResponse => {
  return createSecureResponse(request);
};
