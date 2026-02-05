import type { Business } from "@/entities/business";
import type { Location } from "@/entities/location";
import type { Service } from "@/entities/service";
import { MOCK_BUSINESSES, MOCK_LOCATIONS, MOCK_SERVICES } from "./seed";

/**
 * Retrieves all businesses from the mock data store.
 * @returns Array of all business entities
 */
export const getBusinesses = (): Business[] => [...MOCK_BUSINESSES];

/**
 * Retrieves all locations (countries and cities) from the mock data store.
 * @returns Array of all location entities
 */
export const getLocations = (): Location[] => [...MOCK_LOCATIONS];

/**
 * Retrieves all services from the mock data store.
 * @returns Array of all service entities
 */
export const getServices = (): Service[] => [...MOCK_SERVICES];

/**
 * Finds a country by its URL slug.
 * @param slug - URL-friendly country identifier (e.g., "france")
 * @returns Country location if found, undefined otherwise
 */
export const getCountryBySlug = (slug: string): Location | undefined =>
  MOCK_LOCATIONS.find(
    (location) => location.type === "country" && location.slug === slug,
  );

/**
 * Finds a city within a specific country by their slugs.
 * @param countryId - UUID of the parent country
 * @param citySlug - URL-friendly city identifier (e.g., "paris")
 * @returns City location if found, undefined otherwise
 */
export const getCityBySlug = (
  countryId: string,
  citySlug: string,
): Location | undefined =>
  MOCK_LOCATIONS.find(
    (location) =>
      location.type === "city" &&
      location.parentId === countryId &&
      location.slug === citySlug,
  );

/**
 * Finds a service by its URL slug.
 * @param slug - URL-friendly service identifier (e.g., "web-design")
 * @returns Service if found, undefined otherwise
 */
export const getServiceBySlug = (slug: string): Service | undefined =>
  MOCK_SERVICES.find((service) => service.slug === slug);
