import { beforeEach, describe, expect, it } from "vitest";
import { db, schema } from "@/shared/api";
import {
  createBusinessRaw,
  createCountryCityRaw,
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
  let user: ReturnType<typeof createUserRaw>;
  let country: ReturnType<typeof createCountryCityRaw>["country"];
  let city: ReturnType<typeof createCountryCityRaw>["city"];
  let service: ReturnType<typeof createServiceRaw>;
  let business: ReturnType<typeof createBusinessRaw>;

  beforeEach(async () => {
    user = createUserRaw();
    ({ country, city } = createCountryCityRaw());
    service = createServiceRaw({ slug: "web-design" });
    business = createBusinessRaw({
      name: "Test Cafe",
      slug: "test-cafe",
      managerId: user.id,
      locationId: city.id,
      category: "hospitality",
    });
    await db.transaction(async (tx) => {
      await tx.insert(schema.users).values(user);
      await tx.insert(schema.locations).values([country, city]);
      await tx.insert(schema.services).values(service);
      await tx.insert(schema.businesses).values(business);
      await tx.insert(schema.businessServices).values({
        businessId: business.id,
        serviceId: service.id,
      });
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
