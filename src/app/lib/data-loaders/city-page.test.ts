import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dataAccess from "@/app/lib/data-access";
import * as businessEntities from "@/entities/business";
import { createBusiness, createLocation } from "@/shared/api/seed-factories";
import { getCityPageData } from "./city-page";

vi.mock("@/app/lib/data-access", () => ({
  getLocationBySlug: vi.fn(),
  getAllBusinesses: vi.fn(),
  getAllLocations: vi.fn(),
  getAllServices: vi.fn(),
}));

vi.mock("@/entities/business", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/business")>();
  return {
    ...actual,
    selectBusinessesByCriteria: vi.fn(),
  };
});

describe("City Page Data Loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCountry = createLocation({
    slug: "uk",
    name: "United Kingdom",
    type: "country",
  });
  const mockCity = createLocation({
    slug: "london",
    name: "London",
    type: "city",
    parentId: mockCountry.id,
  });

  it("should return undefined if the city does not belong to the country", async () => {
    const wrongCountry = createLocation({ slug: "fr", name: "France" });

    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(wrongCountry)
      .mockResolvedValueOnce(mockCity);

    const result = await getCityPageData("fr", "london");
    expect(result).toBeUndefined();
  });

  it("should aggregate data correctly for a valid city-country pair", async () => {
    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(mockCountry)
      .mockResolvedValueOnce(mockCity);

    const mockBusinesses = [createBusiness({ name: "London Shop" })];
    vi.mocked(dataAccess.getAllBusinesses).mockResolvedValue(mockBusinesses);
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([
      mockCountry,
      mockCity,
    ]);
    vi.mocked(dataAccess.getAllServices).mockResolvedValue([]);
    vi.mocked(businessEntities.selectBusinessesByCriteria).mockReturnValue(
      mockBusinesses,
    );

    const result = await getCityPageData("uk", "london");

    expect(result?.entities).toEqual({ country: mockCountry, city: mockCity });
    expect(businessEntities.selectBusinessesByCriteria).toHaveBeenCalledWith(
      mockBusinesses,
      { locationId: mockCity.id },
    );
  });
});
