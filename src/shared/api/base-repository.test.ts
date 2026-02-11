import { describe, expect, it } from "vitest";
import { createRepository, createSlugRepository } from "./base-repository";

describe("Repository Factories", () => {
  const mockData = [
    { id: "1", name: "Item 1", slug: "item-1" },
    { id: "2", name: "Item 2", slug: "item-2" },
  ];

  describe("createRepository", () => {
    const repo = createRepository(mockData);

    it("should return all items as a new array reference", async () => {
      const results = await repo.getAll();
      expect(results).toEqual(mockData);
      expect(results).not.toBe(mockData);
    });

    it("should find an item by ID", async () => {
      const item = await repo.getById("1");
      expect(item).toEqual(mockData[0]);
    });

    it("should return undefined if ID does not exist", async () => {
      const item = await repo.getById("99");
      expect(item).toBeUndefined();
    });
  });

  describe("createSlugRepository", () => {
    const repo = createSlugRepository(mockData);

    it("should inherit base repository methods (getById)", async () => {
      const item = await repo.getById("2");
      expect(item).toEqual(mockData[1]);
    });

    it("should find an item by slug", async () => {
      const item = await repo.getBySlug("item-1");
      expect(item).toEqual(mockData[0]);
    });

    it("should return undefined if slug does not exist", async () => {
      const item = await repo.getBySlug("non-existent");
      expect(item).toBeUndefined();
    });
  });
});
