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
import {
  filterBusinesses,
  getBusinessById,
  getBusinessBySlug,
  getPopularPaths,
} from "./accessors";

describe("Business Accessors", () => {
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
  const service = createServiceRaw({ slug: "web-design" });
  const business = createBusinessRaw({
    name: "Test Cafe",
    slug: "test-cafe",
    managerId: user.id,
    locationId: city.id,
    category: "hospitality",
  });

  beforeEach(() => {
    db.transaction((tx) => {
      tx.insert(users).values(user).run();
      tx.insert(locations).values([country, city]).run();
      tx.insert(services).values(service).run();
      tx.insert(businesses).values(business).run();
      tx.insert(businessServices)
        .values({ businessId: business.id, serviceId: service.id })
        .run();
    });
  });

  it("should return a business by id", async () => {
    const result = await getBusinessById(business.id);
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Cafe");
  });

  it("should return a business by slug", async () => {
    const result = await getBusinessBySlug("test-cafe");
    expect(result).toBeDefined();
    expect(result?.slug).toBe("test-cafe");
  });

  it("should return undefined for non-existent slug", async () => {
    const result = await getBusinessBySlug("ghost");
    expect(result).toBeUndefined();
  });

  describe("filterBusinesses", () => {
    it("should return all businesses with no filters", async () => {
      const results = await filterBusinesses({});
      expect(results).toHaveLength(1);
    });

    it("should filter by category", async () => {
      const results = await filterBusinesses({ category: "hospitality" });
      expect(results).toHaveLength(1);
    });

    it("should return empty for non-matching category", async () => {
      const results = await filterBusinesses({ category: "tech" });
      expect(results).toHaveLength(0);
    });

    it("should filter by serviceId", async () => {
      const results = await filterBusinesses({ serviceId: service.id });
      expect(results).toHaveLength(1);
    });
  });

  describe("getPopularPaths", () => {
    it("should return path combinations", async () => {
      const paths = await getPopularPaths();
      expect(paths).toHaveLength(1);
      expect(paths[0]).toEqual({
        country: "uk",
        city: "london",
        service: "web-design",
      });
    });
  });
});
