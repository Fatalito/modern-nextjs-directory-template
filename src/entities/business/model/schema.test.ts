import { describe, expect, it } from "vitest";
import { createMockBusiness } from "@/shared/lib";
import { BusinessSchema } from "./schema";

describe("BusinessSchema Validation", () => {
  it.each([
    ["email", { email: "not-an-email" }, "invalid_format"],
    ["name", { name: "A" }, "too_small"],
    ["slug", { slug: "Bad_Slug!" }, "invalid_format"],
  ])("should reject invalid %s", (field, overrides, expectedCode) => {
    const mock = createMockBusiness(overrides);
    const result = BusinessSchema.safeParse(mock);

    expect(result.success).toBe(false);

    if (!result.success) {
      const error = result.error.issues.find((i) => i.path.includes(field));
      expect(error).toBeDefined();
      expect(error?.code).toBe(expectedCode);
    }
  });

  it("should apply default timestamps when omitted", () => {
    const minimal = {
      id: crypto.randomUUID(),
      managerId: crypto.randomUUID(),
      name: "Test Biz",
      slug: "test-biz",
      directoryName: "test-biz-dir",
      email: "test@example.com",
      contacts: [{ channel: "phone", locale: "en", value: "1234567890" }],
      images: ["https://example.com/test.jpg"],
      category: "tech",
      location: {
        id: crypto.randomUUID(),
        name: "Test City",
        slug: "test-city",
      },
      serviceIds: [],
      languages: ["en"],
    };

    const result = BusinessSchema.parse(minimal);

    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.publishedAt).toBeNull();
  });
});
