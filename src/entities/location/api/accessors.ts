import { cache } from "react";
import { locationRepository } from "./index";

/**
 * Fetches all locations.
 * @returns An array of all locations.
 */
export const getAllLocations = cache(() => locationRepository.getAll());

/**
 * Fetches a single location by its unique identifier.
 * @param id - The location UUID.
 * @returns The matching location, or undefined if not found.
 */
export const getLocationById = cache((id: string) =>
  locationRepository.getById(id),
);

/**
 * Fetches a single location by slug.
 * @param slug - The URL-friendly location slug.
 * @returns The matching location, or undefined if not found.
 */
export const getLocationBySlug = cache((slug: string) =>
  locationRepository.getBySlug(slug),
);

/**
 * Retrieves all locations of type "country".
 * @returns An array of country locations.
 */
export const getAllCountries = cache(() =>
  locationRepository.getAllCountries(),
);

/**
 * Finds cities belonging to a given country.
 * @param countryId - The unique identifier of the country.
 * @returns An array of city locations for the specified country.
 */
export const getCitiesByCountry = cache((countryId: string) =>
  locationRepository.getCitiesByCountry(countryId),
);

/**
 * Retrieves both country and city entities based on their respective slugs.
 * @param citySlug - The slug of the city.
 * @param countrySlug - The slug of the country.
 * @returns An object containing { city, country }, or undefined if not found.
 */
export const getCityAndCountryBySlugs = cache(
  (citySlug: string, countrySlug: string) =>
    locationRepository.getCityAndCountryBySlugs(citySlug, countrySlug),
);

/**
 * Returns distinct city/country slug pairs for directory pages.
 * Used at build time for ISR static path generation — not cached.
 * @param limit - Maximum number of paths to return.
 * @returns An array of { country, city } slug combinations.
 */
export const getCityCountryDirectoryPaths = (limit?: number) =>
  locationRepository.getCityCountryDirectoryPaths(limit);
