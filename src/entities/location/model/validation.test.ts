import { describe, expect, it } from "vitest";
import { createLocation } from "@/shared/testing";
import { isLocationChildOf } from "./validation";

describe("Location Validation", () => {
  const country = createLocation({ name: "Country A" });
  const city = createLocation({
    name: "City A",
    type: "city",
    parentId: country.id,
  });

  it("should validate a correct country-city relationship", () => {
    const result = isLocationChildOf(city, country);
    expect(result).toBe(true);
  });

  it("should invalidate if city is not a child of the country", () => {
    const otherCountry = createLocation({ name: "Country B" });
    const result = isLocationChildOf(city, otherCountry);
    expect(result).toBe(false);
  });

  it("should invalidate if either location is undefined", () => {
    expect(isLocationChildOf(undefined, country)).toBe(false);
    expect(isLocationChildOf(city, undefined)).toBe(false);
  });

  it("should invalidate if either location is null", () => {
    expect(isLocationChildOf(null, country)).toBe(false);
    expect(isLocationChildOf(city, null)).toBe(false);
  });
});
