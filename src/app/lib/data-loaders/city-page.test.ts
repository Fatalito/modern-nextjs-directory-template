import { beforeEach, describe, expect, it, vi } from "vitest";
import * as businessEntities from "@/entities/business";
import * as locationEntities from "@/entities/location";
import { createBusiness, createLocation } from "@/shared/testing";
import { getCityPageData, getCityPageDirectoryPaths } from "./city-page";

vi.mock("@/entities/business", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/business")>();
  return {
    ...actual,
    filterBusinesses: vi.fn(),
  };
});

vi.mock("@/entities/location", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/location")>();
  return {
    ...actual,
    getAllLocations: vi.fn(),
    getCityAndCountryBySlugs: vi.fn(),
    getCityCountryDirectoryPaths: vi.fn(),
  };
});

const mockCountry = {
  ...createLocation({ slug: "uk", name: "United Kingdom" }),
  isoCode: null as string | null,
};
const mockCity = {
  ...createLocation({
    slug: "london",
    name: "London",
    type: "city",
    parentId: mockCountry.id,
  }),
  isoCode: null as string | null,
};

describe("City Page Data Loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined if the city does not belong to the country", async () => {
    vi.mocked(locationEntities.getCityAndCountryBySlugs).mockResolvedValue(
      undefined,
    );
    const result = await getCityPageData("fr", "london");
    expect(result).toBeUndefined();
  });

  it("should aggregate data correctly for a valid city-country pair", async () => {
    vi.mocked(locationEntities.getCityAndCountryBySlugs).mockResolvedValueOnce({
      country: mockCountry,
      city: mockCity,
    });

    const mockBusinesses = [createBusiness({ name: "London Shop" })];
    vi.mocked(businessEntities.filterBusinesses).mockResolvedValue(
      mockBusinesses,
    );

    const result = await getCityPageData("uk", "london");

    expect(result?.entities).toEqual({ country: mockCountry, city: mockCity });
    expect(result?.results).toEqual(mockBusinesses);
    expect(businessEntities.filterBusinesses).toHaveBeenCalledWith({
      locationId: mockCity.id,
    });
  });
});

describe("getCityPageDirectoryPaths", () => {
  it("should return paths for all country-city combinations", async () => {
    vi.mocked(locationEntities.getCityCountryDirectoryPaths).mockResolvedValue([
      { country: mockCountry.slug, city: mockCity.slug },
    ]);

    const paths = await getCityPageDirectoryPaths();

    expect(paths).toEqual([{ country: "uk", city: "london" }]);
  });
});
