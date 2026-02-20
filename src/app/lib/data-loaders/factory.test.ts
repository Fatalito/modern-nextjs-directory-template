import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";
import { createBusiness, createLocation } from "@/shared/testing";
import { getBaseDirectoryData } from "./base";
import { loadDirectoryPageData } from "./factory";

vi.mock("./base", () => ({
  getBaseDirectoryData: vi.fn(),
}));

const mockedBaseData = getBaseDirectoryData as MockedFunction<
  typeof getBaseDirectoryData
>;

describe("loadDirectoryPageData", () => {
  const mockBaseData = {
    businesses: [createBusiness({ name: "Test Biz" })],
    filters: { locations: [], services: [], categories: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedBaseData.mockResolvedValue(mockBaseData);
  });

  it("should return undefined if the entityFetcher returns undefined", async () => {
    const entityFetcher = vi.fn().mockResolvedValue(undefined);
    const criteriaBuilder = vi.fn();

    const result = await loadDirectoryPageData(entityFetcher, criteriaBuilder);

    expect(result).toBeUndefined();
    expect(mockedBaseData).not.toHaveBeenCalled();
  });

  it("should return aggregated data when entities are found", async () => {
    const mockEntities = { city: createLocation({ name: "london" }) };
    const entityFetcher = vi.fn().mockResolvedValue(mockEntities);
    const criteriaBuilder = (entities: typeof mockEntities) => ({
      locationId: entities.city.id,
    });

    const result = await loadDirectoryPageData(entityFetcher, criteriaBuilder);

    expect(result).toEqual({
      entities: mockEntities,
      filters: mockBaseData.filters,
      results: mockBaseData.businesses,
    });

    expect(mockedBaseData).toHaveBeenCalledWith({
      locationId: mockEntities.city.id,
    });
  });

  it("should fetch entities and base data", async () => {
    const entityFetcher = vi.fn().mockResolvedValue({ id: "1" });
    await loadDirectoryPageData(entityFetcher, () => ({}));

    expect(entityFetcher).toHaveBeenCalled();
    expect(mockedBaseData).toHaveBeenCalled();
  });
});
