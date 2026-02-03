import { describe, expect, it } from "vitest";
import { LocationSchema } from "./schema";

const COUNTRY_ID = "550e8400-e29b-41d4-a716-446655440000";
const CITY_ID = "660e8400-e29b-41d4-a716-446655440000";

const createLocation = (
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    type: "country" | "city";
    parentId: string | null;
    isoCode?: string;
  }>,
) => ({
  id: COUNTRY_ID,
  name: "France",
  slug: "france",
  type: "country" as const,
  parentId: null,
  ...overrides,
});

describe("LocationSchema", () => {
  it("validates a complete country location", () => {
    const location = createLocation({});

    const result = LocationSchema.parse(location);
    expect(result).toMatchObject(location);
  });

  it("validates a complete city location", () => {
    const location = createLocation({
      id: CITY_ID,
      name: "Paris",
      slug: "paris",
      type: "city",
      parentId: COUNTRY_ID,
    });

    const result = LocationSchema.parse(location);
    expect(result).toMatchObject(location);
  });

  it("validates location with ISO code", () => {
    const location = createLocation({ isoCode: "FR" });

    const result = LocationSchema.parse(location);
    expect(result.isoCode).toBe("FR");
  });

  it("rejects invalid slug", () => {
    const location = createLocation({
      name: "New York",
      slug: "New York",
      type: "city",
      parentId: COUNTRY_ID,
    });

    expect(() => LocationSchema.parse(location)).toThrow();
  });

  it("rejects invalid type", () => {
    const location = createLocation({
      name: "Test",
      slug: "test",
      type: "invalid" as unknown as "country",
    });

    expect(() => LocationSchema.parse(location)).toThrow();
  });

  it("rejects missing required fields", () => {
    const location = { id: COUNTRY_ID, slug: "test" };

    expect(() => LocationSchema.parse(location)).toThrow();
  });

  it("rejects invalid UUID format", () => {
    const location = createLocation({ id: "not-a-uuid", name: "Test" });

    expect(() => LocationSchema.parse(location)).toThrow();
  });

  it("rejects invalid ISO code length", () => {
    const location = createLocation({ isoCode: "FRA" });

    expect(() => LocationSchema.parse(location)).toThrow();
  });
});
