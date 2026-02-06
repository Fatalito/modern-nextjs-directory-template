import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { CACHE_STRATEGIES } from "@/shared/config";
import { createSecureResponse } from "./create-secure-response";

describe("createSecureResponse", () => {
  it("returns a NextResponse with CSP and Cache-Control headers", () => {
    const headers = new Headers();
    const req = new NextRequest("https://example.com", {
      method: "GET",
      headers,
    } as NextRequest);

    const res = createSecureResponse(req);

    const injectedNonce = res.headers.get("x-middleware-request-x-nonce");
    const csp = res.headers.get("Content-Security-Policy");
    const cache = res.headers.get("Cache-Control");

    expect(injectedNonce).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(csp).toContain(`'nonce-${injectedNonce}'`);
    expect(cache).toBe(CACHE_STRATEGIES.PUBLIC_SWR);
  });
});
