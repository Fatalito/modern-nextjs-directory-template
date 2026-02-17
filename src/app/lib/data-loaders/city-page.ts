import { cache } from "react";
import {
  getCityCountryDirectoryPaths,
  getCountryAndCityBySlugs,
} from "@/entities/location";
import { loadDirectoryPageData } from "./factory";

/**
 * Fetches and validates the core entities for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the country and city entities.
 *         Returns undefined if the city is not a child of the country or if any of the entities are not found.
 */
export const getCityPageEntities = cache(
  async (countrySlug: string, citySlug: string) => {
    const countryAndCity = await getCountryAndCityBySlugs(
      citySlug,
      countrySlug,
    );
    if (!countryAndCity) return;
    return { ...countryAndCity };
  },
);

/**
 * Fetches and aggregates all necessary data for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the entities, filters, and results for the City page.
 */
export const getCityPageData = (countrySlug: string, citySlug: string) => {
  return loadDirectoryPageData(
    () => getCityPageEntities(countrySlug, citySlug),
    ({ city }) => ({ locationId: city?.id }),
  );
};

export const getCityPageDirectoryPaths = async () => {
  return await getCityCountryDirectoryPaths();
};
