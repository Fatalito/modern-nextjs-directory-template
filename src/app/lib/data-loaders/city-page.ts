import {
  getCityAndCountryBySlugs,
  getCityCountryDirectoryPaths,
} from "@/entities/location/server";
import { loadDirectoryPageData } from "./factory";

/**
 * Fetches and validates the core entities for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the country and city entities.
 *         Returns undefined if the city is not a child of the country or if any of the entities are not found.
 */
export const getCityPageEntities = (countrySlug: string, citySlug: string) =>
  getCityAndCountryBySlugs(citySlug, countrySlug);

/**
 * Fetches and aggregates all necessary data for the City page route.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @returns An object containing the entities, filters, and results for the City page.
 */
export const getCityPageData = (countrySlug: string, citySlug: string) =>
  loadDirectoryPageData(
    () => getCityPageEntities(countrySlug, citySlug),
    ({ city }) => ({ locationId: city?.id }),
  );

export const getCityPageDirectoryPaths = (limit?: number) =>
  getCityCountryDirectoryPaths(limit);
