import { describe, expect, it } from "vitest";
import { createMockLocation } from "@/shared/lib/mock-data/factories";
import {
  selectAllCountries,
  selectCitiesByCountry,
  selectFullLocationPath,
} from "./selectors";

describe("Location Selectors", () => {
  const mockLocations = [
    createMockLocation({
      id: "france",
      name: "France",
      slug: "france",
      type: "country",
      parentId: null,
    }),
    createMockLocation({
      id: "paris",
      name: "Paris",
      slug: "paris",
      type: "city",
      parentId: "france",
    }),
    createMockLocation({
      id: "lyon",
      name: "Lyon",
      slug: "lyon",
      type: "city",
      parentId: "france",
    }),
    createMockLocation({
      id: "uk",
      name: "United Kingdom",
      slug: "uk",
      type: "country",
      parentId: null,
    }),
    createMockLocation({
      id: "london",
      name: "London",
      slug: "london",
      type: "city",
      parentId: "uk",
    }),
  ];

  describe("selectAllCountries", () => {
    it("returns only countries (type=country, no parentId)", () => {
      const countries = selectAllCountries(mockLocations);

      expect(countries).toHaveLength(2);
      expect(countries.map((c) => c.id)).toEqual(["france", "uk"]);
      expect(countries.every((c) => c.type === "country")).toBe(true);
      expect(countries.every((c) => !c.parentId)).toBe(true);
    });

    it("returns empty array when no countries exist", () => {
      const cities = mockLocations.filter((l) => l.type === "city");
      const countries = selectAllCountries(cities);

      expect(countries).toHaveLength(0);
    });
  });

  describe("selectCitiesByCountry", () => {
    it("returns cities for specific country", () => {
      const cities = selectCitiesByCountry(mockLocations, "france");

      expect(cities).toHaveLength(2);
      expect(cities.map((c) => c.id)).toEqual(["paris", "lyon"]);
      expect(cities.every((c) => c.parentId === "france")).toBe(true);
    });

    it("returns empty array when country has no cities", () => {
      const cities = selectCitiesByCountry(mockLocations, "nonexistent");

      expect(cities).toHaveLength(0);
    });

    it("returns cities for different country", () => {
      const cities = selectCitiesByCountry(mockLocations, "uk");

      expect(cities).toHaveLength(1);
      expect(cities[0].id).toBe("london");
    });
  });

  describe("selectFullLocationPath", () => {
    it("returns country/city path for nested location", () => {
      const path = selectFullLocationPath(mockLocations, "paris");

      expect(path).toBe("france/paris");
    });

    it("returns city slug for top-level location", () => {
      const path = selectFullLocationPath(mockLocations, "france");

      expect(path).toBe("france");
    });

    it("returns city slug when country parent not found", () => {
      const invalidCities = [
        createMockLocation({
          id: "orphan",
          name: "Orphan City",
          slug: "orphan-city",
          type: "city",
          parentId: "nonexistent-country",
        }),
      ];

      const path = selectFullLocationPath(invalidCities, "orphan");

      expect(path).toBe("orphan-city");
    });

    it("returns empty string when location not found", () => {
      const path = selectFullLocationPath(mockLocations, "nonexistent");

      expect(path).toBe("");
    });
  });
});
