import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { imageHosts } from "./shared/config";

const connectSrc = ["'self'"]; // Add external APIs
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  connectSrc.push("ws://localhost:3000");
}

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const cspHeader = `
    default-src 'self';
    font-src 'self';
    img-src 'self' blob: data: ${imageHosts.map((host) => `https://${host}`).join(" ")};
    connect-src ${connectSrc.join(" ")};
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replaceAll(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const isPost = request.method !== "GET";
  const isAuth =
    request.headers.has("Authorization") || request.cookies.has("session");
  if (isPost || isAuth) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate",
    );
  } else {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=1, stale-while-revalidate=59",
    );
  }
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=1, stale-while-revalidate=59",
  );
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}
