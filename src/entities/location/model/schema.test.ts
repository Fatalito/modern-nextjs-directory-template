import { describe, expect, it } from "vitest";
import { createLocation } from "@/shared/testing";
import { LocationSchema } from "./schema";

describe("LocationSchema", () => {
  it("validates a complete country location", () => {
    const location = createLocation({});

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
    const location = createLocation({});
    const badData = { ...location, slug: "New York" };

    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid type", () => {
    const location = createLocation({
      name: "Test",
      slug: "test",
    });
    const badData = { ...location, type: "invalid" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects missing required fields", () => {
    const location = createLocation({});
    const badData = { ...location, name: null };

    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid UUID format", () => {
    const location = createLocation({});
    const badData = { ...location, id: "not-a-uuid" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });

  it("rejects invalid ISO code length", () => {
    const location = createLocation({});
    const badData = { ...location, isoCode: "FRA" };
    expect(() => LocationSchema.parse(badData)).toThrow();
  });
});
