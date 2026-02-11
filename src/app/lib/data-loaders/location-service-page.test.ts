import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dataAccess from "@/app/lib/data-access";
import * as businessEntities from "@/entities/business";
import {
  createBusiness,
  createLocation,
  createService,
} from "@/shared/api/seed-factories";
import {
  getLocationServicePageData,
  getPopularLocationServicePaths,
} from "./location-service-page";

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

vi.mock("react", () => {
  return {
    cache: <Args extends unknown[], Return>(
      fn: (...args: Args) => Return,
    ): ((...args: Args) => Return) => {
      const tracker = vi.fn((...args: Args) => fn(...args));
      let result: Return;
      return (...args: Args): Return => {
        if (tracker.mock.calls.length === 0) {
          result = tracker(...args);
        }
        return result;
      };
    },
  };
});

const mockCountry = createLocation({ slug: "uk", name: "United Kingdom" });
const mockCity = createLocation({
  slug: "london",
  name: "London",
  parentId: mockCountry.id,
  type: "city",
});
const mockService = createService({ slug: "plumbing", name: "Plumbing" });

const mockBusinesses = [
  createBusiness({
    name: "London Plumbers",
    serviceIds: [mockService.id],
    location: mockCity,
  }),
];

describe("Location Service Page Data Loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined if any location is missing", async () => {
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

  it("should return undefined if a service is missing", async () => {
    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(mockCountry)
      .mockResolvedValueOnce(mockCity);
    vi.mocked(dataAccess.getServiceBySlug).mockResolvedValue(undefined);

    const result = await getLocationServicePageData("uk", "london", "plumbing");
    expect(result).toBeUndefined();
  });

  it("should aggregate data and filter by both location and service", async () => {
    vi.mocked(dataAccess.getLocationBySlug)
      .mockResolvedValueOnce(mockCountry)
      .mockResolvedValueOnce(mockCity);
    vi.mocked(dataAccess.getServiceBySlug).mockResolvedValue(mockService);

    vi.mocked(dataAccess.getAllBusinesses).mockResolvedValue(mockBusinesses);
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([mockCity]);
    vi.mocked(dataAccess.getAllServices).mockResolvedValue([mockService]);

    vi.mocked(businessEntities.selectBusinessesByCriteria).mockReturnValue(
      mockBusinesses,
    );

    const result = await getLocationServicePageData("uk", "london", "plumbing");

    expect(result).toEqual({
      entities: {
        country: mockCountry,
        city: mockCity,
        service: mockService,
      },
      filters: { locations: [mockCity], services: [mockService] },
      results: mockBusinesses,
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

describe("getPopularLocationServicePaths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataAccess.getAllBusinesses).mockResolvedValue(mockBusinesses);
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([
      mockCity,
      mockCountry,
    ]);
    vi.mocked(dataAccess.getAllServices).mockResolvedValue([mockService]);
  });

  it("should generate paths based on existing business data", async () => {
    const paths = await getPopularLocationServicePaths(10);
    expect(paths).toContainEqual({
      country: "uk",
      city: "london",
      service: "plumbing",
    });
  });

  it("should hit the limit and break the loop", async () => {
    const paths = await getPopularLocationServicePaths(0);
    expect(paths).toHaveLength(0);
  });

  it("should not generate path for orphan cities", async () => {
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([
      { ...mockCity, parentId: null },
      mockCountry,
    ]);
    const paths = await getPopularLocationServicePaths(1);
    expect(paths).toHaveLength(0);
  });

  it("should not generate path for orphan cities with wrong id", async () => {
    vi.mocked(dataAccess.getAllLocations).mockResolvedValue([
      { ...mockCity, parentId: "wrong-id" },
      mockCountry,
    ]);
    const paths = await getPopularLocationServicePaths(1);
    expect(paths).toHaveLength(0);
  });
});
