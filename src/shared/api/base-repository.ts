export interface IBaseRepository<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
}

export interface ISlugRepository<T> extends IBaseRepository<T> {
  getBySlug: (slug: string) => Promise<T | undefined>;
}

/**
 * Standard repository for entities with ID only.
 */
export const createRepository = <T extends { id: string }>(
  data: T[],
): IBaseRepository<T> => ({
  /**
   * Returns a shallow copy of the data to protect the array reference.
   * @returns A promise that resolves to an array of items.
   */
  getAll: async () => [...data],

  /**
   * Finds an item by its unique identifier.
   * @param id - The unique identifier of the item.
   * @returns A promise that resolves to the item if found, or undefined if not found.
   */
  getById: async (id: string) => data.find((item) => item.id === id),
});

/**
 * Extended repository for entities with ID and Slug.
 */
export const createSlugRepository = <T extends { id: string; slug: string }>(
  data: T[],
): ISlugRepository<T> => ({
  ...createRepository(data),

  /**
   * Finds an item by its unique slug.
   * @param slug - The unique slug of the item.
   * @returns A promise that resolves to the item if found, or undefined if not found.
   */
  getBySlug: async (slug: string) => data.find((item) => item.slug === slug),
});
