import { describe, expect, it } from "vitest";
import { getCspHeader } from "./get-csp-header";

describe("getCspHeader", () => {
  it("includes the provided nonce in script-src and contains core directives", () => {
    const nonce = "test-nonce";
    const header = getCspHeader(nonce);
    expect(typeof header).toBe("string");
    expect(header).toContain(`nonce-${nonce}`);
    expect(header).toContain("img-src");
    expect(header).toContain("script-src");
    expect(header).toContain("style-src");
  });
});
