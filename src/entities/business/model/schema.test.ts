import { describe, expect, it } from "vitest";
import { createMockBusiness } from "@/shared/lib/mock-data/factories";
import { BusinessSchema } from "./schema";

describe("BusinessSchema Validation", () => {
  it("should reject invalid email format", () => {
    const mock = createMockBusiness({ email: "not-an-email" });
    const result = BusinessSchema.safeParse(mock);

    expect(result.success).toBe(false);
  });

  it("should reject name shorter than 2 characters", () => {
    const mock = createMockBusiness({ name: "A" });
    const result = BusinessSchema.safeParse(mock);

    expect(result.success).toBe(false);
  });

  it("should reject slug with uppercase or special chars", () => {
    const mock = createMockBusiness({ slug: "Bad_Slug!" });
    const result = BusinessSchema.safeParse(mock);

    expect(result.success).toBe(false);
  });

  it("should apply default timestamps when omitted", () => {
    const minimal = {
      id: crypto.randomUUID(),
      managerId: crypto.randomUUID(),
      name: "Test Biz",
      slug: "test-biz",
      directoryName: "test-biz-dir",
      email: "test@example.com",
      contacts: [{ channel: "phone", locale: "en", value: "+1234567890" }],
      category: "tech",
      locationId: crypto.randomUUID(),
      serviceIds: [],
      languages: ["en"],
    };

    const result = BusinessSchema.parse(minimal);

    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.publishedAt).toBeNull();
  });
});
