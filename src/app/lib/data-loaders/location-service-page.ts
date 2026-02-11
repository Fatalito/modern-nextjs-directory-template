import { cache } from "react";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
  getLocationBySlug,
  getServiceBySlug,
} from "@/app/lib/data-access";
import { isLocationChildOf } from "@/entities/location";
import { loadDirectoryPageData } from "./factory";

/**
 * Fetches the core entities (country, city, service) based on the provided slugs.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the country, city, and service entities.
 *         Returns undefined if the city is not a child of the country or if any of the entities are not found.
 */
export const getLocationServicePageEntities = cache(
  async (countrySlug: string, citySlug: string, serviceSlug: string) => {
    const [country, city, service] = await Promise.all([
      getLocationBySlug(countrySlug),
      getLocationBySlug(citySlug),
      getServiceBySlug(serviceSlug),
    ]);

    if (!isLocationChildOf(city, country) || !service) return;

    return { country, city, service };
  },
);

/**
 * Fetches all necessary data for the location-service page, including the core entities (country, city, service),
 * all locations, all services, and the filtered list of businesses matching the criteria.
 *
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the country, city, service, all locations, all services, and the filtered businesses matching the criteria.
 */
export const getLocationServicePageData = (
  countrySlug: string,
  citySlug: string,
  serviceSlug: string,
) => {
  return loadDirectoryPageData(
    () => getLocationServicePageEntities(countrySlug, citySlug, serviceSlug),
    ({ city, service }) => ({
      locationId: city?.id,
      serviceId: service?.id,
    }),
  );
};

/**
 * Returns paths only for combinations that have at least one business.
 * This prevents pre-rendering thousands of empty "No results found" pages.
 * @param limit - Maximum number of paths to return (default: 500)
 * @returns Array of param objects for static page generation
 */
export const getPopularLocationServicePaths = async (limit = 500) => {
  const splitChar = "/";
  const [businesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);

  const existingCombos = new Set(
    businesses.flatMap((b) =>
      b.serviceIds.map(
        (serviceId) => `${b.location.id}${splitChar}${serviceId}`,
      ),
    ),
  );

  const paths: Array<{ country: string; city: string; service: string }> = [];
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  for (const combo of existingCombos) {
    if (paths.length >= limit) break;

    const [locId, serviceId] = combo.split(splitChar);
    const city = locationMap.get(locId);
    const service = serviceMap.get(serviceId);

    if (city && service && city.parentId) {
      const country = locationMap.get(city.parentId);
      if (country) {
        paths.push({
          country: country.slug,
          city: city.slug,
          service: service.slug,
        });
      }
    }
  }

  return paths;
};
