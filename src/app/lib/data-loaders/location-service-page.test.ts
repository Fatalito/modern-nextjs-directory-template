import { describe, expect, it, vi } from "vitest";
import * as dataAccess from "@/app/lib/data-access";
import * as businessEntities from "@/entities/business";
import {
  createBusiness,
  createLocation,
  createService,
} from "../../../shared/api/seed-factories";
import { getLocationServicePageData } from "./location-service-page";

vi.mock("@/app/lib/data-access", () => ({
  getLocationBySlug: vi.fn(),
  getServiceBySlug: vi.fn(),
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

describe("Location Service Page Data Loader", () => {
  const mockCountry = createLocation({ slug: "uk", name: "United Kingdom" });
  const mockCity = createLocation({ slug: "london", name: "London" });
  const mockService = createService({ slug: "plumbing", name: "Plumbing" });

  it("should return undefined if any core entity is missing", async () => {
    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(mockCountry)
      .mockResolvedValueOnce(undefined);
    vi.mocked(dataAccess.getServiceBySlug).mockResolvedValue(mockService);

    const result = await getLocationServicePageData(
      "uk",
      "invalid-city",
      "plumbing",
    );
    expect(result).toBeUndefined();
  });

  it("should aggregate data and filter by both location and service", async () => {
    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(mockCountry)
      .mockResolvedValueOnce(mockCity);
    vi.mocked(dataAccess.getServiceBySlug).mockResolvedValue(mockService);

    const mockBusinesses = [createBusiness({ name: "London Plumbers" })];
    vi.mocked(dataAccess.getAllBusinesses).mockResolvedValue(mockBusinesses);
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([mockCity]);
    vi.mocked(dataAccess.getAllServices).mockResolvedValue([mockService]);

    vi.mocked(businessEntities.selectBusinessesByCriteria).mockReturnValue(
      mockBusinesses,
    );

    const result = await getLocationServicePageData("uk", "london", "plumbing");

    expect(result?.entities).toEqual({
      country: mockCountry,
      city: mockCity,
      service: mockService,
    });

    expect(businessEntities.selectBusinessesByCriteria).toHaveBeenCalledWith(
      mockBusinesses,
      {
        locationId: mockCity.id,
        serviceId: mockService.id,
      },
    );
  });
});
