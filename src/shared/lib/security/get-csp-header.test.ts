import { describe, expect, it } from "vitest";
import { getCspHeader } from "./get-csp-header";

describe("getCspHeader", () => {
  it("includes unsafe-inline and omits unsafe-eval in production", () => {
    const header = getCspHeader("production");
    expect(header).toContain("'unsafe-inline'");
    expect(header).not.toContain("'unsafe-eval'");
    expect(header).not.toContain("nonce-");
    expect(header).not.toContain("ws://localhost");
  });

  it("includes unsafe-eval and websockets in development", () => {
    const header = getCspHeader("development");
    expect(header).toContain("'unsafe-inline'");
    expect(header).toContain("'unsafe-eval'");
    expect(header).toContain("ws://localhost:*");
  });
});
