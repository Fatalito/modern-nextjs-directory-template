import { describe, expect, it } from "vitest";
import { createBusiness } from "@/shared/api/seed-factories";
import { BusinessSchema } from "./schema";

describe("BusinessSchema Validation", () => {
  it.each([
    ["email", { email: "not-an-email" }, "invalid_format"],
    ["name", { name: "A" }, "too_small"],
    ["slug", { slug: "Bad_Slug!" }, "invalid_format"],
  ])("should reject invalid %s", (field, overrides, expectedCode) => {
    const validData = createBusiness({});
    const badData = { ...validData, ...overrides };
    const result = BusinessSchema.safeParse(badData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes(field));
      expect(issue?.code).toBe(expectedCode);
    }
  });

  it("should accept a valid business object", () => {
    const mock = createBusiness({});
    const result = BusinessSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });
});
