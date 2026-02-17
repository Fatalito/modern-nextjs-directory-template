import { describe, expect, it } from "vitest";
import { createService } from "@/shared/testing";
import { ServiceSchema } from "./schema";

describe("ServiceSchema", () => {
  it("validates a complete service", () => {
    const service = createService({
      icon: "wrench",
      description: "Professional plumbing services",
      createdAt: new Date().toISOString(),
    });

    const result = ServiceSchema.parse(service);
    expect(result).toMatchObject(service);
  });

  it("validates service without optional fields", () => {
    const service = createService({
      name: "Electrician",
      slug: "electrician",
      description: undefined,
      icon: undefined,
    });

    const result = ServiceSchema.parse(service);
    expect(result.icon).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.createdAt).toBeDefined();
  });

  it("rejects invalid UUID", () => {
    const service = createService({ name: "Service", slug: "service" });
    const badData = { ...service, id: "invalid-uuid" };

    expect(() => ServiceSchema.parse(badData)).toThrow();
  });

  it("rejects invalid slug", () => {
    const service = createService({
      name: "Test Service",
    });
    const badData = { ...service, slug: "Test Service" };

    expect(() => ServiceSchema.parse(badData)).toThrow();
  });

  it("rejects name that is too short", () => {
    const service = createService({
      slug: "valid-slug",
    });
    const badData = { ...service, name: "A" };
    expect(() => ServiceSchema.parse(badData)).toThrow();
  });

  it("rejects description that is too long", () => {
    const service = createService({
      name: "Service",
      slug: "service",
    });

    const badData = { ...service, description: "A".repeat(201) };
    expect(() => ServiceSchema.parse(badData)).toThrow();
  });
});
