import { beforeEach, describe, expect, it } from "vitest";
import { seedBaseBusiness } from "@/shared/testing/helpers";
import { businessRepository } from "./index";

describe("Business Repository", () => {
  let bizA: Awaited<ReturnType<typeof seedBaseBusiness>>;
  let bizB: Awaited<ReturnType<typeof seedBaseBusiness>>;

  beforeEach(async () => {
    bizA = await seedBaseBusiness({
      business: { name: "Tech Studio", slug: "tech-studio", category: "tech" },
      service: { name: "WebDesign", slug: "web-design" },
    });
    bizB = await seedBaseBusiness({
      business: { name: "London Plumbers", slug: "london-plumbers" },
      service: { name: "Plumbing", slug: "plumbing" },
      locationId: bizA.locationId,
      userId: bizA.userId,
    });
  });

  it("should return all businesses with relations", async () => {
    const all = await businessRepository.getAll();
    expect(all).toHaveLength(2);
    const techStudio = all.find((b) => b.slug === "tech-studio");
    expect(techStudio?.location).toBeDefined();
    expect(techStudio?.serviceIds).toContain(bizA.service.id);
  });

  it("should fetch a business by id with relations", async () => {
    const result = await businessRepository.getById(bizA.business.id);
    expect(result).toBeDefined();
    expect(result?.name).toBe("Tech Studio");
    expect(result?.location).toBeDefined();
    expect(result?.serviceIds).toContain(bizA.service.id);
  });

  it("should handle a business by id not found", async () => {
    const result = await businessRepository.getById("non-existent-id");
    expect(result).toBeUndefined();
  });

  it("should fetch a business by slug with relations", async () => {
    const result = await businessRepository.getBySlug(bizA.business.slug);
    expect(result).toBeDefined();
    expect(result?.serviceIds).toContain(bizA.service.id);
  });

  it("should handle a business by slug not found", async () => {
    const result = await businessRepository.getBySlug("non-existent-slug");
    expect(result).toBeUndefined();
  });

  it("should return undefined for a non-existent slug", async () => {
    const result = await businessRepository.getBySlug("ghost-shop");
    expect(result).toBeUndefined();
  });

  describe("filters", () => {
    it("should return all businesses when no params", async () => {
      const results = await businessRepository.filters({});
      expect(results).toHaveLength(2);
    });

    it("should filter by category", async () => {
      const results = await businessRepository.filters({
        category: bizA.business.category,
      });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Tech Studio");
    });

    it("should filter by locationId", async () => {
      const results = await businessRepository.filters({
        locationId: bizA.locationId,
      });
      expect(results).toHaveLength(2);
    });

    it("should filter by serviceId", async () => {
      const results = await businessRepository.filters({
        serviceId: bizA.service.id,
      });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Tech Studio");
    });

    it("should filter by combined params", async () => {
      const results = await businessRepository.filters({
        category: bizB.business.category,
        serviceId: bizB.service.id,
      });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("London Plumbers");
    });

    it("should return empty when the service exists but not in the specified location", async () => {
      const results = await businessRepository.filters({
        locationId: "some-other-uuid",
        serviceId: bizA.service.id,
      });
      expect(results).toHaveLength(0);
    });

    it("should return empty for non-matching filters", async () => {
      const results = await businessRepository.filters({
        category: "health",
      });
      expect(results).toHaveLength(0);
    });
  });

  describe("getPopularPaths", () => {
    it("should return city/country/service path combos", async () => {
      const paths = await businessRepository.getPopularPaths();
      expect(paths.length).toBeGreaterThanOrEqual(2);
      expect(paths).toContainEqual({
        country: "uk",
        city: "london",
        service: "web-design",
      });
      expect(paths).toContainEqual({
        country: "uk",
        city: "london",
        service: "plumbing",
      });
    });

    it("should respect limit", async () => {
      const paths = await businessRepository.getPopularPaths(1);
      expect(paths).toHaveLength(1);
    });
  });
});
