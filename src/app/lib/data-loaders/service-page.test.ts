import { beforeEach, describe, expect, it, vi } from "vitest";
import * as businessEntities from "@/entities/business";
import * as locationEntities from "@/entities/location";
import * as serviceEntities from "@/entities/service";
import { Category } from "@/shared/api";
import {
  createBusiness,
  createLocation,
  createService,
} from "@/shared/testing";
import {
  getServicePageData,
  getServicePageDirectoryPaths,
  getServicePageEntities,
} from "./service-page";

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

describe("Service Page Loaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockService = createService({ name: "Web Design", slug: "web-design" });
  const mockLocation = createLocation({ name: "Lyon", slug: "lyon" });
  const mockBusiness = createBusiness({
    name: "Tech Studio",
    serviceIds: [mockService.id],
  });

  describe("getServicePageEntities", () => {
    it("should return the service entity for a valid slug", async () => {
      vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(
        mockService,
      );

      const result = await getServicePageEntities("web-design");

      expect(result).toEqual({ service: mockService });
      expect(serviceEntities.getServiceBySlug).toHaveBeenCalledWith(
        "web-design",
      );
    });
  });

  describe("getServicePageData", () => {
    it("should return undefined if the service is not found", async () => {
      vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(undefined);

      const result = await getServicePageData("invalid-slug");

      expect(result).toBeUndefined();
    });

    it("should aggregate all entities and filtered results", async () => {
      vi.mocked(serviceEntities.getServiceBySlug).mockResolvedValue(
        mockService,
      );
      vi.mocked(locationEntities.getAllLocations).mockResolvedValue([
        mockLocation,
      ]);
      vi.mocked(serviceEntities.getAllServices).mockResolvedValue([
        mockService,
      ]);
      vi.mocked(businessEntities.filterBusinesses).mockResolvedValue([
        mockBusiness,
      ]);

      const data = await getServicePageData("web-design");

      expect(data).toEqual({
        entities: { service: mockService },
        filters: {
          locations: [mockLocation],
          services: [mockService],
          categories: Category.options,
        },
        results: [mockBusiness],
      });

      expect(businessEntities.filterBusinesses).toHaveBeenCalledWith({
        serviceId: mockService.id,
      });
    });
  });

  describe("getServicePageDirectoryPaths", () => {
    it("should map services to path segments", async () => {
      vi.mocked(serviceEntities.getAllServices).mockResolvedValue([
        mockService,
      ]);

      const paths = await getServicePageDirectoryPaths();

      expect(paths).toEqual([{ service: "web-design" }]);
    });
  });
});
