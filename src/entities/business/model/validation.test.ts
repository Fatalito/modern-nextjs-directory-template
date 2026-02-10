import { describe, expect, it } from "vitest";
import { createBusiness, createLocation } from "@/shared/api/seed-factories";
import { isBusinessLocationValid } from "./validation";

describe("isBusinessLocationValid", () => {
  const city = createLocation({ type: "city" });
  const country = createLocation({ type: "country" });

  it.each([
    {
      should: "reject undefined",
      expected: false,
      bLocId: city.id,
      loc: undefined,
    },
    {
      should: "reject country types",
      expected: false,
      bLocId: country.id,
      loc: country,
    },
    {
      should: "reject ID mismatches",
      expected: false,
      bLocId: country.id,
      loc: city,
    },
    {
      should: "accept matching city",
      expected: true,
      bLocId: city.id,
      loc: city,
    },
  ])("$should", ({ expected, bLocId, loc }) => {
    const business = createBusiness({
      location: {
        id: bLocId,
        name: "Test",
        slug: "test",
      },
    });

    expect(isBusinessLocationValid(business, loc)).toBe(expected);
  });
});
