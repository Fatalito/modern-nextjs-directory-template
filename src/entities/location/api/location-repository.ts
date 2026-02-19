import { aliasedTable, and, eq, isNull } from "drizzle-orm";
import type { DB } from "@/shared/api";
import { createSlugRepository, schema } from "@/shared/api";

export const createLocationRepository = (db: DB) => {
  const base = createSlugRepository(db, schema.locations);

  return {
    ...base,
    getAllCountries: async () =>
      await db.query.locations.findMany({
        where: and(
          isNull(schema.locations.parentId),
          eq(schema.locations.type, "country"),
        ),
      }),
    getCitiesByCountry: async (countryId: string) =>
      await db.query.locations.findMany({
        where: and(
          eq(schema.locations.parentId, countryId),
          eq(schema.locations.type, "city"),
        ),
      }),
    getCityAndCountryBySlugs: async (citySlug: string, countrySlug: string) => {
      const parentLocations = aliasedTable(schema.locations, "parent");

      const [result] = await db
        .select({
          city: schema.locations,
          country: parentLocations,
        })
        .from(schema.locations)
        .innerJoin(
          parentLocations,
          eq(schema.locations.parentId, parentLocations.id),
        )
        .where(
          and(
            eq(schema.locations.slug, citySlug),
            eq(schema.locations.type, "city"),
            eq(parentLocations.slug, countrySlug),
            eq(parentLocations.type, "country"),
          ),
        )
        .limit(1);

      if (!result) return undefined;

      return result;
    },
    getCityCountryDirectoryPaths: async (limit = 1000) => {
      const parentLocations = aliasedTable(schema.locations, "parent");

      return db
        .select({
          city: schema.locations.slug,
          country: parentLocations.slug,
        })
        .from(schema.locations)
        .innerJoin(
          parentLocations,
          eq(schema.locations.parentId, parentLocations.id),
        )
        .where(
          and(
            eq(schema.locations.type, "city"),
            eq(parentLocations.type, "country"),
          ),
        )
        .limit(limit);
    },
  };
};
