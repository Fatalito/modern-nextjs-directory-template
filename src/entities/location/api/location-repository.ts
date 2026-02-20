import { aliasedTable, and, eq, isNull } from "drizzle-orm";
import { createSlugRepository, type DB, schema } from "@/shared/api";
import { type Location, LocationSchema } from "@/shared/model";

export const createLocationRepository = (db: DB) => {
  const base = createSlugRepository(db, schema.locations, (r) =>
    LocationSchema.parse(r),
  );

  return {
    ...base,

    getAllCountries: async (): Promise<Location[]> => {
      const results = await db.query.locations.findMany({
        where: and(
          isNull(schema.locations.parentId),
          eq(schema.locations.type, "country"),
        ),
      });
      return results.map((r) => LocationSchema.parse(r));
    },

    getCitiesByCountry: async (countryId: string): Promise<Location[]> => {
      const results = await db.query.locations.findMany({
        where: and(
          eq(schema.locations.parentId, countryId),
          eq(schema.locations.type, "city"),
        ),
      });
      return results.map((r) => LocationSchema.parse(r));
    },

    getCityAndCountryBySlugs: async (
      citySlug: string,
      countrySlug: string,
    ): Promise<{ city: Location; country: Location } | undefined> => {
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

      return {
        city: LocationSchema.parse(result.city),
        country: LocationSchema.parse(result.country),
      };
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
