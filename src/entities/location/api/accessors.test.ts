import { beforeEach, describe, expect, it } from "vitest";
import { db, locations } from "@/shared/api";
import { createLocationRaw } from "@/shared/testing";
import {
  getAllCountries,
  getAllLocations,
  getCitiesByCountry,
  getCityCountryDirectoryPaths,
  getCountryAndCityBySlugs,
  getLocationById,
  getLocationBySlug,
} from "./accessors";

describe("Location Accessors", () => {
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

  beforeEach(() => {
    db.insert(locations).values([country, city]).run();
  });

  it("should return all locations", async () => {
    const result = await getAllLocations();
    expect(result).toHaveLength(2);
  });

  it("should return a location by id", async () => {
    const result = await getLocationById(city.id);
    expect(result).toBeDefined();
    expect(result?.slug).toBe("london");
  });

  it("should return a location by slug", async () => {
    const result = await getLocationBySlug("uk");
    expect(result).toBeDefined();
    expect(result?.name).toBe("United Kingdom");
  });

  it("should return all countries", async () => {
    const result = await getAllCountries();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("uk");
  });

  it("should return cities by country", async () => {
    const result = await getCitiesByCountry(country.id);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("london");
  });

  it("should return country and city by slugs", async () => {
    const result = await getCountryAndCityBySlugs("london", "uk");
    expect(result).toBeDefined();
    expect(result?.city.slug).toBe("london");
    expect(result?.country.slug).toBe("uk");
  });

  it("should return directory paths", async () => {
    const paths = await getCityCountryDirectoryPaths();
    expect(paths).toContainEqual({ country: "uk", city: "london" });
  });
});
