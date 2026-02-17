import { aliasedTable, and, eq, isNull } from "drizzle-orm";
import type { DB } from "@/shared/api/db";
import { createSlugRepository } from "@/shared/api/db/base-repository";
import { locations } from "@/shared/api/db/schema";
import type { Location, LocationTypeValue } from "../model/types";

export const createLocationRepository = (db: DB) => {
  const base = createSlugRepository<typeof locations, Location>(db, locations);

  return {
    ...base,
    getAllCountries: async () =>
      await db.query.locations.findMany({
        where: and(
          isNull(locations.parentId),
          eq(locations.type, "country" as LocationTypeValue),
        ),
      }),
    getCitiesByCountry: async (countryId: string) =>
      await db.query.locations.findMany({
        where: and(
          eq(locations.parentId, countryId),
          eq(locations.type, "city" as LocationTypeValue),
        ),
      }),
    getCountryAndCityBySlugs: async (citySlug: string, countrySlug: string) => {
      const parentLocations = aliasedTable(locations, "parent");

      const [result] = await db
        .select({
          city: locations,
          country: parentLocations,
        })
        .from(locations)
        .innerJoin(parentLocations, eq(locations.parentId, parentLocations.id))
        .where(
          and(
            eq(locations.slug, citySlug),
            eq(parentLocations.slug, countrySlug),
          ),
        )
        .limit(1);

      if (!result) return undefined;

      return result;
    },
    getCityCountryDirectoryPaths: async (limit = 1000) => {
      const parentLocations = aliasedTable(locations, "parent");

      return db
        .select({
          city: locations.slug,
          country: parentLocations.slug,
        })
        .from(locations)
        .innerJoin(parentLocations, eq(locations.parentId, parentLocations.id))
        .where(
          and(
            eq(locations.type, "city" as LocationTypeValue),
            eq(parentLocations.type, "country" as LocationTypeValue),
          ),
        )
        .limit(limit);
    },
  };
};

export type LocationRepository = ReturnType<typeof createLocationRepository>;
