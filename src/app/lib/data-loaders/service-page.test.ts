import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
  getServiceBySlug,
} from "@/app/lib/data-access";
import { selectBusinessesByCriteria } from "@/entities/business";
import {
  createBusiness,
  createLocation,
  createService,
} from "@/shared/api/seed-factories";
import {
  getServicePageData,
  getServicePageDirectoryPaths,
  getServicePageEntities,
} from "./service-page";

vi.mock("@/app/lib/data-access", () => ({
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
      vi.mocked(getServiceBySlug).mockResolvedValue(mockService);

      const result = await getServicePageEntities("web-design");

      expect(result).toEqual({ service: mockService });
      expect(getServiceBySlug).toHaveBeenCalledWith("web-design");
    });
  });

  describe("getServicePageData", () => {
    it("should return undefined if the service is not found", async () => {
      vi.mocked(getServiceBySlug).mockResolvedValue(undefined);

      const result = await getServicePageData("invalid-slug");

      expect(result).toBeUndefined();
    });

    it("should aggregate all entities and filtered results", async () => {
      vi.mocked(getServiceBySlug).mockResolvedValue(mockService);
      vi.mocked(getAllBusinesses).mockResolvedValue([mockBusiness]);
      vi.mocked(getAllLocations).mockResolvedValue([mockLocation]);
      vi.mocked(getAllServices).mockResolvedValue([mockService]);
      vi.mocked(selectBusinessesByCriteria).mockReturnValue([mockBusiness]);

      const data = await getServicePageData("web-design");

      expect(data).toEqual({
        entities: { service: mockService },
        filters: { locations: [mockLocation], services: [mockService] },
        results: [mockBusiness],
      });

      expect(selectBusinessesByCriteria).toHaveBeenCalledWith([mockBusiness], {
        serviceId: mockService.id,
      });
    });
  });

  describe("getServicePageDirectoryPaths", () => {
    it("should map services to path segments", async () => {
      vi.mocked(getAllServices).mockResolvedValue([mockService]);

      const paths = await getServicePageDirectoryPaths();

      expect(paths).toEqual([{ service: "web-design" }]);
    });
  });
});
