import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";
import { selectBusinessesByCriteria } from "@/entities/business";
import { createBusiness, createLocation } from "@/shared/api/seed-factories";
import { getBaseDirectoryData } from "./base";
import { createDirectoryLoader } from "./factory";

vi.mock("@/entities/business", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/business")>();
  return {
    ...actual,
    selectBusinessesByCriteria: vi.fn(),
  };
});

vi.mock("./base", () => ({
  getBaseDirectoryData: vi.fn(),
}));

const mockedSelect = selectBusinessesByCriteria as MockedFunction<
  typeof selectBusinessesByCriteria
>;
const mockedBaseData = getBaseDirectoryData as MockedFunction<
  typeof getBaseDirectoryData
>;

describe("createDirectoryLoader", () => {
  const mockBaseData = {
    allBusinesses: [createBusiness({ name: "Test Biz" })],
    filters: { locations: [], services: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedBaseData.mockResolvedValue(mockBaseData);
  });

  it("should return undefined if the entityFetcher returns undefined", async () => {
    const entityFetcher = vi.fn().mockResolvedValue(undefined);
    const criteriaBuilder = vi.fn();

    const result = await createDirectoryLoader(entityFetcher, criteriaBuilder);

    expect(result).toBeUndefined();
    expect(mockedBaseData).toHaveBeenCalled();
  });

  it("should return aggregated data when entities are found", async () => {
    const mockEntities = { city: createLocation({ name: "london" }) };
    const entityFetcher = vi.fn().mockResolvedValue(mockEntities);
    const criteriaBuilder = (entities: typeof mockEntities) => ({
      locationId: entities.city.id,
    });

    const mockResults = [createBusiness({ name: "biz-1" })];
    mockedSelect.mockReturnValue(mockResults);
    const result = await createDirectoryLoader(entityFetcher, criteriaBuilder);

    expect(result).toEqual({
      entities: mockEntities,
      filters: mockBaseData.filters,
      results: mockResults,
    });

    expect(mockedSelect).toHaveBeenCalledWith(mockBaseData.allBusinesses, {
      locationId: mockEntities.city.id,
    });
  });

  it("should fetch entities and base data in parallel", async () => {
    const entityFetcher = vi.fn().mockResolvedValue({ id: "1" });
    await createDirectoryLoader(entityFetcher, () => ({}));

    expect(entityFetcher).toHaveBeenCalled();
    expect(mockedBaseData).toHaveBeenCalled();
  });
});
