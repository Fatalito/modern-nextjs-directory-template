import { beforeEach, describe, expect, it } from "vitest";
import {
  businesses,
  businessServices,
  db,
  locations,
  services,
  users,
} from "@/shared/api";
import {
  createBusinessRaw,
  createLocationRaw,
  createServiceRaw,
  createUserRaw,
} from "@/shared/testing";
import { businessRepository } from "./index";

describe("Business Repository", () => {
  const user = createUserRaw();
  const country = createLocationRaw({
    slug: "uk",
    name: "United Kingdom",
    type: "country",
  });
  const city = createLocationRaw({
    slug: "london",
    name: "London",
    type: "city",
    parentId: country.id,
  });
  const serviceA = createServiceRaw({ slug: "web-design", name: "Web Design" });
  const serviceB = createServiceRaw({ slug: "plumbing", name: "Plumbing" });

  const bizA = createBusinessRaw({
    name: "Tech Studio",
    slug: "tech-studio",
    managerId: user.id,
    locationId: city.id,
    category: "tech",
  });
  const bizB = createBusinessRaw({
    name: "London Plumbers",
    slug: "london-plumbers",
    managerId: user.id,
    locationId: city.id,
    category: "services",
  });

  beforeEach(() => {
    db.transaction((tx) => {
      tx.insert(users).values(user).run();
      tx.insert(locations).values([country, city]).run();
      tx.insert(services).values([serviceA, serviceB]).run();
      tx.insert(businesses).values([bizA, bizB]).run();
      tx.insert(businessServices)
        .values([
          { businessId: bizA.id, serviceId: serviceA.id },
          { businessId: bizB.id, serviceId: serviceB.id },
        ])
        .run();
    });
  });

  it("should be using in-memory db", () => {
    expect(db.$client.name).toBe(":memory:");
  });

  it("should return all businesses", async () => {
    const all = await businessRepository.getAll();
    expect(all).toHaveLength(2);
  });

  it("should fetch a business by id", async () => {
    const result = await businessRepository.getById(bizA.id);
    expect(result).toBeDefined();
    expect(result?.name).toBe("Tech Studio");
  });

  it("should fetch a business by slug with relations", async () => {
    const result = await businessRepository.getBySlug("tech-studio");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("tech-studio");
    expect(result?.serviceIds).toContain(serviceA.id);
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
      const results = await businessRepository.filters({ category: "tech" });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Tech Studio");
    });

    it("should filter by locationId", async () => {
      const results = await businessRepository.filters({
        locationId: city.id,
      });
      expect(results).toHaveLength(2);
    });

    it("should filter by serviceId", async () => {
      const results = await businessRepository.filters({
        serviceId: serviceA.id,
      });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Tech Studio");
    });

    it("should filter by combined params", async () => {
      const results = await businessRepository.filters({
        category: "services",
        serviceId: serviceB.id,
      });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("London Plumbers");
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
