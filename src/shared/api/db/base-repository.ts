import { type AnyColumn, eq, type InferSelectModel } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { DB } from "./index";

type StringColumn = AnyColumn<{ data: string }>;

type TableWithId = SQLiteTable & { id: StringColumn };
type TableWithSlug = TableWithId & { slug: StringColumn };

export interface IBaseRepository<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
}
export interface ISlugRepository<T> extends IBaseRepository<T> {
  getBySlug: (slug: string) => Promise<T | undefined>;
}

/**
 * Factory for a standard Drizzle repository (ID lookups).
 */
export const createRepository = <
  TTable extends TableWithId,
  T = InferSelectModel<TTable>,
>(
  db: DB,
  table: TTable,
): IBaseRepository<T> => ({
  /**
   * Returns all items in the repository.
   * @returns A promise that resolves to an array of all items in the repository.
   */
  getAll: async () => {
    const results = await db.select().from(table);
    return results as T[];
  },

  /**
   *  Finds an item by its unique identifier.
   * @param id - The unique identifier of the item.
   * @returns A promise that resolves to the item if found, or undefined if not found.
   */
  getById: async (id: string) => {
    const [result] = await db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return (result as T) ?? undefined;
  },
});

/**
 * Factory for a Drizzle repository with Slug support.
 */
export const createSlugRepository = <
  TTable extends TableWithSlug,
  T = InferSelectModel<TTable>,
>(
  db: DB,
  table: TTable,
): ISlugRepository<T> => {
  const base = createRepository<TTable, T>(db, table);

  return {
    ...base,
    /**
     * Finds an item by its slug.
     * @param slug - The slug of the item.
     * @returns A promise that resolves to the item if found, or undefined if not found.
     */
    getBySlug: async (slug: string) => {
      const [result] = await db
        .select()
        .from(table)
        .where(eq(table.slug, slug))
        .limit(1);
      return (result as T) ?? undefined;
    },
  };
};
