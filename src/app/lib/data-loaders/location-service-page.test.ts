import { beforeEach, describe, expect, it, vi } from "vitest";
import * as businessEntities from "@/entities/business";
import * as locationEntities from "@/entities/location";
import * as serviceEntities from "@/entities/service";
import { Category } from "@/shared/api/db/constants";
import {
  createBusiness,
  createLocation,
  createService,
} from "@/shared/testing";
import {
  getLocationServicePageData,
  getPopularLocationServicePaths,
} from "./location-service-page";

vi.mock("@/entities/business", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/business")>();
  return {
    ...actual,
    filterBusinesses: vi.fn(),
    getPopularPaths: vi.fn(),
  };
});
vi.mock("@/entities/location", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/location")>();
  return {
    ...actual,
    getAllLocations: vi.fn(),
    getCityAndCountryBySlugs: vi.fn(),
  };
});
vi.mock("@/entities/service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/service")>();
  return {
    ...actual,
    getAllServices: vi.fn(),
    getServiceBySlug: vi.fn(),
  };
});
vi.mock("react", async () => {
  const { createReactCacheMock } = await import(
    "@/shared/testing/react-cache-mock"
  );
  return createReactCacheMock();
});

const mockCountry = {
  ...createLocation({ slug: "uk", name: "United Kingdom" }),
  isoCode: null,
};

const mockCity = {
  ...createLocation({
    slug: "london",
    name: "London",
    parentId: mockCountry.id,
    type: "city",
  }),
  isoCode: null,
};

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

  it("should return undefined if location is not found", async () => {
    vi.mocked(locationEntities.getCityAndCountryBySlugs).mockResolvedValue(
      undefined,
    );
    vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(mockService);

    const result = await getLocationServicePageData(
      "uk",
      "invalid-city",
      "plumbing",
    );
    expect(result).toBeUndefined();
  });

  it("should return undefined if a service is missing", async () => {
    vi.mocked(locationEntities.getCityAndCountryBySlugs).mockResolvedValue({
      country: mockCountry,
      city: mockCity,
    });
    vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(undefined);

    const result = await getLocationServicePageData("uk", "london", "plumbing");
    expect(result).toBeUndefined();
  });

  it("should aggregate data and filter by both location and service", async () => {
    vi.mocked(locationEntities.getCityAndCountryBySlugs).mockResolvedValue({
      country: mockCountry,
      city: mockCity,
    });
    vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(mockService);
    vi.mocked(businessEntities.filterBusinesses).mockResolvedValue(
      mockBusinesses,
    );
    vi.mocked(locationEntities.getAllLocations).mockResolvedValue([mockCity]);
    vi.mocked(serviceEntities.getAllServices).mockResolvedValue([mockService]);

    const result = await getLocationServicePageData("uk", "london", "plumbing");

    expect(result).toEqual({
      entities: {
        country: mockCountry,
        city: mockCity,
        service: mockService,
      },
      filters: {
        locations: [mockCity],
        services: [mockService],
        categories: Category.options,
      },
      results: mockBusinesses,
    });

    expect(businessEntities.filterBusinesses).toHaveBeenCalledWith({
      locationId: mockCity.id,
      serviceId: mockService.id,
    });
  });
});

describe("getPopularLocationServicePaths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate to getPopularPaths with the given limit", async () => {
    const mockPaths = [{ country: "uk", city: "london", service: "plumbing" }];
    vi.mocked(businessEntities.getPopularPaths).mockResolvedValue(mockPaths);

    const paths = await getPopularLocationServicePaths(10);

    expect(paths).toEqual(mockPaths);
    expect(businessEntities.getPopularPaths).toHaveBeenCalledWith(10);
  });
});
