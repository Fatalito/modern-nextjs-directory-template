import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  businessRepository,
  locationRepository,
  serviceRepository,
  userRepository,
} from "@/shared/api";
import {
  createBusiness,
  createLocation,
  createService,
  createUser,
} from "../../shared/api/seed-factories";
import {
  getAllBusinesses,
  getAllCountries,
  getAllLocations,
  getAllServices,
  getAllUsers,
  getBusinessById,
  getBusinessBySlug,
  getCitiesByCountry,
  getDirectoryPaths,
  getLocationById,
  getLocationBySlug,
  getServiceById,
  getServiceBySlug,
  getUserById,
  searchBusinesses,
} from "./data-access";

vi.mock("@/shared/api", () => ({
  businessRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
  },
  locationRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
  },
  serviceRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getBySlug: vi.fn(),
  },
  userRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("react", () => ({
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
}));

describe("Data Access Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const france = createLocation({
    name: "France",
    slug: "france",
    type: "country",
  });
  const uk = createLocation({
    name: "United Kingdom",
    slug: "uk",
    type: "country",
  });
  const paris = createLocation({
    name: "Paris",
    slug: "paris",
    type: "city",
    parentId: france.id,
  });
  const lyon = createLocation({
    name: "Lyon",
    slug: "lyon",
    type: "city",
    parentId: france.id,
  });
  const london = createLocation({
    name: "London",
    slug: "london",
    type: "city",
    parentId: uk.id,
  });
  const s1 = createService({ name: "Web Design", slug: "web-design" });
  const s2 = createService({ name: "Plumbing", slug: "plumbing" });
  const b1 = createBusiness({
    name: "Tech Corp",
    slug: "tech-corp",
    category: "tech" as const,
    location: paris,
    contacts: [
      {
        channel: "phone",
        value: "123456789",
        locale: "en",
        label: "Main Line",
      },
    ],
    languages: [],
    serviceIds: [],
  });
  const b2 = createBusiness({
    name: "Food Shop",
    slug: "food-shop",
    category: "hospitality" as const,
    location: lyon,
    contacts: [
      {
        channel: "phone",
        value: "123456789",
        locale: "en",
        label: "Main Line",
      },
    ],
    languages: [],
    serviceIds: [],
  });

  describe("Business Accessors", () => {
    it("should fetch all businesses", async () => {
      const mockData = [b1];
      vi.mocked(businessRepository.getAll).mockResolvedValue(mockData);

      const result = await getAllBusinesses();

      expect(result).toEqual(mockData);
      expect(businessRepository.getAll).toHaveBeenCalledOnce();
    });

    it("should find business by ID", async () => {
      vi.mocked(businessRepository.getById).mockResolvedValue(b1);
      const result = await getBusinessById(b1.id);
      expect(result).toEqual(b1);
    });

    it("should find business by slug", async () => {
      vi.mocked(businessRepository.getBySlug).mockResolvedValue(b1);

      const result = await getBusinessBySlug(b1.slug);

      expect(result).toEqual(b1);
      expect(businessRepository.getBySlug).toHaveBeenCalledWith(b1.slug);
    });

    it("should filter businesses by category (case-insensitive)", async () => {
      const mockBusinesses = [b1, b2];
      vi.mocked(businessRepository.getAll).mockResolvedValue(mockBusinesses);

      const result = await searchBusinesses({ category: "TECH" });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Tech Corp");
    });

    it("should filter businesses by location ID", async () => {
      const mockBusinesses = [b1, b2];
      vi.mocked(businessRepository.getAll).mockResolvedValue(mockBusinesses);

      const result = await searchBusinesses({ locationId: paris.id });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(b1.id);
    });

    it("should return all businesses if search params are empty", async () => {
      vi.mocked(businessRepository.getAll).mockResolvedValue([b1, b2]);
      const result = await searchBusinesses({});
      expect(result).toHaveLength(2);
    });

    it("should utilize caching (call repo once for multiple function calls)", async () => {
      vi.mocked(businessRepository.getAll).mockResolvedValue([]);

      await getAllBusinesses();
      await getAllBusinesses();

      expect(businessRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("Location Accessors", () => {
    const mockLocations = [france, paris, lyon, london, uk];

    it("should fetch all locations", async () => {
      vi.mocked(locationRepository.getAll).mockResolvedValue(mockLocations);
      const result = await getAllLocations();
      expect(result).toEqual(mockLocations);
    });

    it("should find location by ID", async () => {
      vi.mocked(locationRepository.getById).mockResolvedValue(france);
      const result = await getLocationById(france.id);
      expect(result).toEqual(france);
    });

    it("should find location by slug", async () => {
      vi.mocked(locationRepository.getBySlug).mockResolvedValue(france);
      const result = await getLocationBySlug(france.slug);
      expect(result).toEqual(france);
    });

    it("should select only countries via getAllCountries", async () => {
      vi.mocked(locationRepository.getAll).mockResolvedValue(mockLocations);
      const result = await getAllCountries();

      expect(result).toHaveLength(2);
      expect(result.every((l) => l.type === "country")).toBe(true);
      expect(locationRepository.getAll).toHaveBeenCalledOnce();
    });

    it("should select cities by country ID via getCitiesByCountry", async () => {
      vi.mocked(locationRepository.getAll).mockResolvedValue(mockLocations);
      const result = await getCitiesByCountry(france.id);

      expect(result).toHaveLength(2);
      expect(result.every((l) => l.parentId === france.id)).toBe(true);
    });
  });

  describe("Service Accessors", () => {
    it("should fetch all services", async () => {
      const mockServices = [s1];
      vi.mocked(serviceRepository.getAll).mockResolvedValue(mockServices);

      const result = await getAllServices();

      expect(result).toEqual(mockServices);
      expect(serviceRepository.getAll).toHaveBeenCalledOnce();
    });

    it("should find service by ID", async () => {
      vi.mocked(serviceRepository.getById).mockResolvedValue(s1);
      const result = await getServiceById(s1.id);
      expect(result).toEqual(s1);
    });

    it("should find service by slug", async () => {
      vi.mocked(serviceRepository.getBySlug).mockResolvedValue(s1);
      const result = await getServiceBySlug(s1.slug);
      expect(result).toEqual(s1);
    });
  });

  describe("User Accessors", () => {
    const mockUser = createUser({ name: "Fatalito" });

    it("should fetch all users", async () => {
      vi.mocked(userRepository.getAll).mockResolvedValue([mockUser]);
      const result = await getAllUsers();
      expect(result).toEqual([mockUser]);
      expect(userRepository.getAll).toHaveBeenCalledOnce();
    });

    it("should find user by ID", async () => {
      vi.mocked(userRepository.getById).mockResolvedValue(mockUser);
      const result = await getUserById(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(userRepository.getById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("Route Generation (getDirectoryPaths)", () => {
    it("should generate cartesian product of country -> city -> service", async () => {
      vi.mocked(locationRepository.getAll).mockResolvedValue([france, paris]);

      vi.mocked(serviceRepository.getAll).mockResolvedValue([s1, s2]);

      const paths = await getDirectoryPaths();

      expect(paths).toEqual([
        { country: "france", city: "paris", service: "web-design" },
        { country: "france", city: "paris", service: "plumbing" },
      ]);
    });

    it("should handle cities with no country gracefully and ignore them", async () => {
      vi.mocked(locationRepository.getAll).mockResolvedValue([
        france,
        // Orphan city
        { ...lyon, parentId: null },
      ]);

      vi.mocked(serviceRepository.getAll).mockResolvedValue([s1]);

      const paths = await getDirectoryPaths();

      expect(paths).toHaveLength(0);
    });
  });
});
