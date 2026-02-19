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
 * Always returns the precise Drizzle row type — no unsafe casts.
 * Callers that need richer domain types (with relations) must override these methods.
 */
export const createRepository = <TTable extends TableWithId>(
  db: DB,
  table: TTable,
): IBaseRepository<InferSelectModel<TTable>> => ({
  getAll: async () => {
    const results = await db.select().from(table);
    return results as InferSelectModel<TTable>[];
  },

  getById: async (id: string) => {
    const [result] = await db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return result as InferSelectModel<TTable> | undefined;
  },
});

/**
 * Factory for a Drizzle repository with slug support.
 * Always returns the precise Drizzle row type — no unsafe casts.
 * Callers that need richer domain types (with relations) must override these methods.
 */
export const createSlugRepository = <TTable extends TableWithSlug>(
  db: DB,
  table: TTable,
): ISlugRepository<InferSelectModel<TTable>> => {
  const base = createRepository(db, table);

  return {
    ...base,
    getBySlug: async (slug: string) => {
      const [result] = await db
        .select()
        .from(table)
        .where(eq(table.slug, slug))
        .limit(1);
      return result as InferSelectModel<TTable> | undefined;
    },
  };
};
