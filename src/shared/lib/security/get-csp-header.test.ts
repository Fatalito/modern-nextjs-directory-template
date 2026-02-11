import { describe, expect, it } from "vitest";
import { getCspHeader } from "./get-csp-header";

describe("getCspHeader", () => {
  it("should add nonce and omits unsafe-eval in production", () => {
    const header = getCspHeader("n", "production");
    expect(header).toContain("nonce-n");
    expect(header).not.toContain("'unsafe-eval'");
    expect(header).not.toContain("ws://localhost");
  });

  it("should add nonce and includes dev headers and websockets in development", () => {
    const header = getCspHeader("n", "development");
    expect(header).toContain("nonce-n");
    expect(header).toContain("'unsafe-eval'");
    expect(header).toContain("ws://localhost:*");
  });
});
