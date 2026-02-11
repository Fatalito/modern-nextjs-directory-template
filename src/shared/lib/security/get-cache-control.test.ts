import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { getCacheControl } from "./get-cache-control";

describe("getCacheControl", () => {
  const PRIVATE = "private, no-cache, no-store, max-age=0, must-revalidate";
  const PUBLIC_SWR = "public, s-maxage=1, stale-while-revalidate=59";

  it("returns private for non-GET (mutation) requests", () => {
    const req = new NextRequest("https://example.com", {
      method: "POST",
      headers: new Headers(),
    });
    expect(getCacheControl(req)).toBe(PRIVATE);
  });

  it("returns private for authenticated requests", () => {
    const headers = new Headers();
    headers.set("Authorization", "Bearer tok");
    const req = new NextRequest("https://example.com", {
      method: "GET",
      headers,
    });
    expect(getCacheControl(req)).toBe(PRIVATE);
  });

  it("returns public for unauthenticated GET requests", () => {
    const req = new NextRequest("https://example.com", {
      method: "GET",
      headers: new Headers(),
    });
    expect(getCacheControl(req)).toBe(PUBLIC_SWR);
  });

  it("returns private for requests with session cookie", () => {
    const req = new NextRequest("https://example.com", {
      method: "GET",
    });
    req.cookies.set("session", "abc123");
    expect(getCacheControl(req)).toBe(PRIVATE);
  });
});
