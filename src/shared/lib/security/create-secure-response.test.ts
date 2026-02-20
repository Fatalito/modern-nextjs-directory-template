import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { createSecureResponse } from "./create-secure-response";

describe("createSecureResponse", () => {
  it("returns a NextResponse with CSP and Cache-Control headers", () => {
    const req = new NextRequest("https://example.com", { method: "GET" });

    const res = createSecureResponse(req);

    const csp = res.headers.get("Content-Security-Policy");
    const cache = res.headers.get("Cache-Control");

    expect(csp).toContain("'unsafe-inline'");
    expect(csp).not.toContain("nonce-");
    expect(cache).toBe("public, s-maxage=1, stale-while-revalidate=60");
  });
});
