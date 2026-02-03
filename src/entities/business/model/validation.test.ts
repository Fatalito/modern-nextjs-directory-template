import { describe, expect, it } from "vitest";
import { createMockBusiness, createMockLocation } from "@/shared/lib";
import { isBusinessLocationValid } from "./validation";

describe("isBusinessLocationValid", () => {
  it.each([
    [false, "location is undefined", "loc-1", undefined],
    [
      false,
      "location is a country",
      "loc-1",
      { id: "loc-1", type: "country" as const },
    ],
    [
      false,
      "locationId mismatch",
      "id-a",
      { id: "id-b", type: "city" as const },
    ],
    [true, "valid city match", "loc-1", { id: "loc-1", type: "city" as const }],
  ])("returns %s when %s", (expected, _, locationId, location) => {
    const business = createMockBusiness({
      location: {
        id: locationId,
        name: "New York",
        slug: "new-york",
      },
    });
    const loc = location ? createMockLocation(location) : undefined;
    expect(isBusinessLocationValid(business, loc)).toBe(expected);
  });
});
