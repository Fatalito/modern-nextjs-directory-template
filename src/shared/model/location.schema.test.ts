import { describe, expect, it } from "vitest";
import { createLocation } from "@/shared/testing";
import { LocationSchema } from "./location.schema";

describe("LocationSchema", () => {
  const location = createLocation();

  it("validates a complete country location", () => {
    const result = LocationSchema.parse(location);
    expect(result).toMatchObject(location);
  });

  it("validates a complete city location", () => {
    const country = createLocation({
      name: "France",
      slug: "france",
      type: "country",
    });
    const city = createLocation({
      name: "Lyon",
      slug: "lyon",
      type: "city",
      parentId: country.id,
    });

    const result = LocationSchema.parse(city);
    expect(result).toMatchObject(city);
  });

  it("validates location with ISO code", () => {
    const location = createLocation({ isoCode: "FR" });

    const result = LocationSchema.parse(location);
    expect(result.isoCode).toBe("FR");
  });

  it("rejects invalid slug", () => {
    const badData = { ...location, slug: "New York" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid type", () => {
    const badData = { ...location, type: "invalid" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects missing required fields", () => {
    const badData = { ...location, name: null };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid UUID format", () => {
    const badData = { ...location, id: "not-a-uuid" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid ISO code length", () => {
    const badData = { ...location, isoCode: "FRA" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });
});
