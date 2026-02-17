import { beforeEach, describe, expect, it } from "vitest";
import { db, locations } from "@/shared/api";
import { createLocationRaw } from "@/shared/testing";
import { locationRepository } from "./index";

describe("Location Repository", () => {
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
  const otherCountry = createLocationRaw({
    slug: "fr",
    name: "France",
    type: "country",
  });
  const otherCity = createLocationRaw({
    slug: "paris",
    name: "Paris",
    type: "city",
    parentId: otherCountry.id,
  });

  beforeEach(() => {
    db.insert(locations).values([country, city, otherCountry, otherCity]).run();
  });

  it("should return all locations", async () => {
    const all = await locationRepository.getAll();
    expect(all).toHaveLength(4);
  });

  it("should return a location by id", async () => {
    const result = await locationRepository.getById(city.id);
    expect(result).toEqual(city);
  });

  it("should return a location by slug", async () => {
    const result = await locationRepository.getBySlug("london");
    expect(result).toEqual(city);
  });

  it("should return undefined for a non-existent id", async () => {
    const result = await locationRepository.getById("non-existent");
    expect(result).toBeUndefined();
  });

  it("should return undefined for a non-existent slug", async () => {
    const result = await locationRepository.getBySlug("non-existent");
    expect(result).toBeUndefined();
  });

  describe("getAllCountries", () => {
    it("should return only countries", async () => {
      const countries = await locationRepository.getAllCountries();
      expect(countries).toHaveLength(2);
      expect(countries.map((c) => c.slug).sort()).toEqual(["fr", "uk"]);
    });
  });

  describe("getCitiesByCountry", () => {
    it("should return cities for a given country", async () => {
      const cities = await locationRepository.getCitiesByCountry(country.id);
      expect(cities).toHaveLength(1);
      expect(cities[0].slug).toBe("london");
    });

    it("should return empty for a country with no cities", async () => {
      const emptyCities =
        await locationRepository.getCitiesByCountry("non-existent");
      expect(emptyCities).toHaveLength(0);
    });
  });

  describe("getCountryAndCityBySlugs", () => {
    it("should return country and city for valid slugs", async () => {
      const result = await locationRepository.getCountryAndCityBySlugs(
        "london",
        "uk",
      );
      expect(result).toBeDefined();
      expect(result?.city.slug).toBe("london");
      expect(result?.country.slug).toBe("uk");
    });

    it("should return undefined when city does not belong to country", async () => {
      const result = await locationRepository.getCountryAndCityBySlugs(
        "london",
        "fr",
      );
      expect(result).toBeUndefined();
    });

    it("should return undefined for a non-existent city slug", async () => {
      const result = await locationRepository.getCountryAndCityBySlugs(
        "berlin",
        "uk",
      );
      expect(result).toBeUndefined();
    });
  });

  describe("getCityCountryDirectoryPaths", () => {
    it("should return city-country slug pairs", async () => {
      const paths = await locationRepository.getCityCountryDirectoryPaths();
      expect(paths).toContainEqual({ country: "uk", city: "london" });
      expect(paths).toContainEqual({ country: "fr", city: "paris" });
    });

    it("should respect limit", async () => {
      const paths = await locationRepository.getCityCountryDirectoryPaths(1);
      expect(paths).toHaveLength(1);
    });
  });
});
