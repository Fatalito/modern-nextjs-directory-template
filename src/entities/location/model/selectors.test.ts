import { describe, expect, it } from "vitest";
import { createLocation } from "@/shared/testing";
import {
  selectAllCountries,
  selectCitiesByCountry,
  selectFullLocationPath,
} from "./selectors";

describe("Location Selectors", () => {
  const france = createLocation({
    name: "France",
    slug: "france",
    type: "country",
  });
  const uk = createLocation({
    name: "United Kingdom",
    slug: "uk",
    type: "country",
  });
  const paris = createLocation({
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: france.id,
  });
  const lyon = createLocation({
    name: "Lyon",
    slug: "lyon",
    type: "city",
    parentId: france.id,
  });
  const london = createLocation({
    name: "London",
    slug: "london",
    type: "city",
    parentId: uk.id,
  });
  const mockLocations = [france, paris, lyon, london, uk];

  describe("selectAllCountries", () => {
    it("returns only countries (type=country, no parentId)", () => {
      const countries = selectAllCountries(mockLocations);

      expect(countries).toHaveLength(2);
      expect(countries.map((c) => c.id)).toEqual(
        expect.arrayContaining([france.id, uk.id]),
      );
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
      const cities = selectCitiesByCountry(mockLocations, france.id);

      expect(cities).toHaveLength(2);
      expect(cities.map((c) => c.id)).toEqual(
        expect.arrayContaining([paris.id, lyon.id]),
      );
      expect(cities.every((c) => c.parentId === france.id)).toBe(true);
    });

    it("returns empty array when country has no cities", () => {
      const cities = selectCitiesByCountry(mockLocations, "nonexistent");

      expect(cities).toHaveLength(0);
    });

    it("returns cities for different country", () => {
      const cities = selectCitiesByCountry(mockLocations, uk.id);

      expect(cities).toHaveLength(1);
      expect(cities[0].id).toBe(london.id);
    });
  });

  describe("selectFullLocationPath", () => {
    it("returns country/city path for nested location", () => {
      const path = selectFullLocationPath(mockLocations, lyon.id);

      expect(path).toBe("france/lyon");
    });

    it("returns city slug for top-level location", () => {
      const path = selectFullLocationPath(mockLocations, france.id);

      expect(path).toBe("france");
    });

    it("returns city slug when country parent not found", () => {
      const city = createLocation({
        name: "Orphan City",
        slug: "orphan-city",
        type: "city",
        parentId: france.id,
      });
      const orphanCity = { ...city, parentId: null };
      const invalidCities = [orphanCity];

      const path = selectFullLocationPath(invalidCities, orphanCity.id);

      expect(path).toBe("orphan-city");
    });

    it("returns city slug when parent country is missing from locations array", () => {
      const orphanCity = createLocation({
        name: "Orphan City",
        slug: "orphan-city",
        type: "city",
        parentId: france.id,
      });
      const locationsWithoutParent = [orphanCity];

      const path = selectFullLocationPath(
        locationsWithoutParent,
        orphanCity.id,
      );

      expect(path).toBe("orphan-city");
    });

    it("returns empty string when location not found", () => {
      const path = selectFullLocationPath(mockLocations, "nonexistent");

      expect(path).toBe("");
    });
  });
});
