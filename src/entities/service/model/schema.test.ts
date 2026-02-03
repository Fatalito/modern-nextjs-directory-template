import { describe, expect, it } from "vitest";
import { ServiceSchema } from "./schema";

const SERVICE_ID = "550e8400-e29b-41d4-a716-446655440000";
const PARENT_ID = "660e8400-e29b-41d4-a716-446655440000";

const createService = (
  overrides: Partial<{
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    createdAt?: string;
  }>,
) => ({
  id: SERVICE_ID,
  parentId: null,
  name: "Plumbing",
  slug: "plumbing",
  ...overrides,
});

describe("ServiceSchema", () => {
  it("validates a complete service with parent", () => {
    const service = createService({
      parentId: PARENT_ID,
      icon: "wrench",
      description: "Professional plumbing services",
      createdAt: new Date().toISOString(),
    });

    const result = ServiceSchema.parse(service);
    expect(result).toMatchObject(service);
  });

  it("validates service without parent", () => {
    const service = createService({
      name: "Home Maintenance",
      slug: "home-maintenance",
    });

    const result = ServiceSchema.parse(service);
    expect(result.parentId).toBeNull();
  });

  it("validates service without optional fields", () => {
    const service = createService({ name: "Electrician", slug: "electrician" });

    const result = ServiceSchema.parse(service);
    expect(result.icon).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.createdAt).toBeDefined();
  });

  it("rejects invalid UUID", () => {
    const service = createService({ id: "invalid-uuid", name: "Service" });

    expect(() => ServiceSchema.parse(service)).toThrow();
  });

  it("rejects invalid slug", () => {
    const service = createService({
      name: "Test Service",
      slug: "Test Service",
    });

    expect(() => ServiceSchema.parse(service)).toThrow();
  });

  it("rejects name that is too short", () => {
    const service = createService({
      name: "A",
      slug: "valid-slug",
    });

    expect(() => ServiceSchema.parse(service)).toThrow();
  });

  it("rejects description that is too long", () => {
    const service = createService({
      name: "Service",
      slug: "service",
      description: "A".repeat(201),
    });

    expect(() => ServiceSchema.parse(service)).toThrow();
  });
});
