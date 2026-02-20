import { type AnyColumn, eq, type InferSelectModel } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import type { DB } from "./db";

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
 * Pass a `parse` function to map raw Drizzle rows to a domain type at the boundary.
 * Without `parse`, returns the raw Drizzle row type unchanged.
 */
export const createRepository = <
  TTable extends TableWithId,
  TDomain = InferSelectModel<TTable>,
>(
  db: DB,
  table: TTable,
  parse: (raw: InferSelectModel<TTable>) => TDomain = (r) =>
    r as unknown as TDomain,
): IBaseRepository<TDomain> => ({
  getAll: async () => {
    const results = await db.select().from(table);
    return results.map(parse);
  },

  getById: async (id: string) => {
    const [result] = await db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return result ? parse(result) : undefined;
  },
});

/**
 * Factory for a Drizzle repository with slug support.
 * Pass a `parse` function to map raw Drizzle rows to a domain type at the boundary.
 * Without `parse`, returns the raw Drizzle row type unchanged.
 */
export const createSlugRepository = <
  TTable extends TableWithSlug,
  TDomain = InferSelectModel<TTable>,
>(
  db: DB,
  table: TTable,
  parse: (raw: InferSelectModel<TTable>) => TDomain = (r) =>
    r as unknown as TDomain,
): ISlugRepository<TDomain> => {
  const base = createRepository(db, table, parse);

  return {
    ...base,
    getBySlug: async (slug: string) => {
      const [result] = await db
        .select()
        .from(table)
        .where(eq(table.slug, slug))
        .limit(1);
      return result ? parse(result) : undefined;
    },
  };
};
