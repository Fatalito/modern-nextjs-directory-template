import { describe, expect, it } from "vitest";
import { serverSchema } from "./env";

describe("Env Validation Logic", () => {
  it("transforms ENABLE_HSTS strings to booleans", () => {
    expect(serverSchema.parse({ ENABLE_HSTS: "true" }).ENABLE_HSTS).toBe(true);
    expect(serverSchema.parse({ ENABLE_HSTS: " TRUE " }).ENABLE_HSTS).toBe(
      true,
    );
    expect(serverSchema.parse({ ENABLE_HSTS: "false" }).ENABLE_HSTS).toBe(
      false,
    );
    expect(serverSchema.parse({}).ENABLE_HSTS).toBe(false);
  });
});
