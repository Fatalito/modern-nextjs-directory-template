import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { createSecureResponse } from "./create-secure-response";

describe("createSecureResponse", () => {
  it("returns a NextResponse with CSP and Cache-Control headers", () => {
    const headers = new Headers();
    const req = new NextRequest("https://example.com", {
      method: "GET",
      headers,
    });

    const res = createSecureResponse(req);

    const injectedNonce = res.headers.get("x-middleware-request-x-nonce");
    const csp = res.headers.get("Content-Security-Policy");
    const cache = res.headers.get("Cache-Control");

    expect(injectedNonce).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(csp).toContain(`'nonce-${injectedNonce}'`);
    expect(cache).toBe("public, s-maxage=1, stale-while-revalidate=59");
  });
});
