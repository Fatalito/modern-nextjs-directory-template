import { describe, expect, it } from "vitest";
import {
  createMockBusiness,
  createMockLocation,
} from "@/shared/lib/mock-data/factories";
import { isBusinessLocationValid } from "./validation";

describe("isBusinessLocationValid", () => {
  it.each([
    ["location is undefined", "loc-1", undefined, false],
    [
      "location is a country",
      "loc-1",
      { id: "loc-1", type: "country" as const },
      false,
    ],
    [
      "locationId mismatch",
      "id-a",
      { id: "id-b", type: "city" as const },
      false,
    ],
    ["valid city match", "loc-1", { id: "loc-1", type: "city" as const }, true],
  ])("should return %s when %s", (_, locationId, location, expected) => {
    const business = createMockBusiness({ locationId });
    const loc = location ? createMockLocation(location) : undefined;
    expect(isBusinessLocationValid(business, loc)).toBe(expected);
  });
});
