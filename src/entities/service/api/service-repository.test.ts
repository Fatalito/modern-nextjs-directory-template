import { beforeEach, describe, expect, it } from "vitest";
import { db, schema } from "@/shared/api";
import { createServiceRaw } from "@/shared/testing";
import { serviceRepository } from "./index";

describe("Service Repository", () => {
  let service: ReturnType<typeof createServiceRaw>;

  beforeEach(async () => {
    service = createServiceRaw();
    await db.insert(schema.services).values([service]);
  });

  it("should return all services", async () => {
    const allServices = await serviceRepository.getAll();
    expect(allServices).toEqual([service]);
  });

  it("should return a service by id", async () => {
    const serviceById = await serviceRepository.getById(service.id);
    expect(serviceById).toEqual(service);
  });

  it("should return a service by slug", async () => {
    const serviceBySlug = await serviceRepository.getBySlug(service.slug);
    expect(serviceBySlug).toEqual(service);
  });

  it("should return undefined for a non-existent id", async () => {
    const undefinedService = await serviceRepository.getById(
      "non-existent-service",
    );
    expect(undefinedService).toBeUndefined();
  });

  it("should return undefined for a non-existent slug", async () => {
    const undefinedService = await serviceRepository.getBySlug(
      "non-existent-service",
    );
    expect(undefinedService).toBeUndefined();
  });
});
