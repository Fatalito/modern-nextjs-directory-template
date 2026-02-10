import { cache } from "react";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
  getLocationBySlug,
} from "@/app/lib/data-access";
import { selectBusinessesByCriteria } from "@/entities/business";

/**
 * Fetches and validates the core entities for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the country and city entities.
 */
export const getCityPageEntities = cache(
  async (countrySlug: string, citySlug: string) => {
    const [country, city] = await Promise.all([
      getLocationBySlug(countrySlug),
      getLocationBySlug(citySlug),
    ]);
    return { country, city };
  },
);

/**
 * Fetches and aggregates all necessary data for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the entities, filters, and results for the City page.
 */
export const getCityPageData = async (
  countrySlug: string,
  citySlug: string,
) => {
  const { country, city } = await getCityPageEntities(countrySlug, citySlug);

  if (!country || !city) {
    return null;
  }

  const [allBusinesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);

  return {
    entities: { country, city },
    filters: { locations, services },
    results: selectBusinessesByCriteria(allBusinesses, {
      locationId: city.id,
    }),
  };
};
