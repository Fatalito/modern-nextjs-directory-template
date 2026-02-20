import { getPopularPaths } from "@/entities/business/server";
import { getCityAndCountryBySlugs } from "@/entities/location/server";
import { getServiceBySlug } from "@/entities/service/server";
import { loadDirectoryPageData } from "./factory";

/**
 * Fetches the core entities (country, city, service) based on the provided slugs.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the country, city, and service entities.
 *         Returns undefined if the city is not a child of the country or if any of the entities are not found.
 */
export const getLocationServicePageEntities = async (
  countrySlug: string,
  citySlug: string,
  serviceSlug: string,
) => {
  const [countryAndCity, service] = await Promise.all([
    getCityAndCountryBySlugs(citySlug, countrySlug),
    getServiceBySlug(serviceSlug),
  ]);

  if (!countryAndCity || !service) return;

  return { ...countryAndCity, service };
};

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
) =>
  loadDirectoryPageData(
    () => getLocationServicePageEntities(countrySlug, citySlug, serviceSlug),
    ({ city, service }) => ({
      locationId: city?.id,
      serviceId: service?.id,
    }),
  );

export const getPopularLocationServicePaths = (limit = 500) =>
  getPopularPaths(limit);
