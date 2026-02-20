import { describe, expect, it } from "vitest";
import { createBusiness } from "@/shared/testing";
import { BusinessSchema } from "./business.schema";

describe("BusinessSchema Validation", () => {
  it.each([
    ["email", { email: "not-an-email" }, "invalid_format", "email"],
    ["name", { name: "A" }, "too_small", undefined],
    ["slug", { slug: "Bad_Slug!" }, "invalid_format", "regex"],
  ])("should reject invalid %s", (field, overrides, expectedCode, expectedFormat) => {
    const validData = createBusiness();
    const badData = { ...validData, ...overrides };
    const result = BusinessSchema.safeParse(badData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes(field));
      expect(issue?.code).toBe(expectedCode);
      if (expectedCode === "invalid_format") {
        expect((issue as { format?: string })?.format).toBe(expectedFormat);
      }
    }
  });

  it("should accept a valid business object", () => {
    const mock = createBusiness();
    const result = BusinessSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });
});
