import { cache } from "react";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
  getLocationBySlug,
  getServiceBySlug,
} from "@/app/lib/data-access";
import { selectBusinessesByCriteria } from "@/entities/business";

/**
 * Fetches the core entities (country, city, service) based on the provided slugs.
 * @param countrySlug - The slug of the country.
 * @param citySlug - The slug of the city.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the country, city, and service entities.
 */
export const getLocationServicePageEntities = cache(
  async (countrySlug: string, citySlug: string, serviceSlug: string) => {
    const [country, city, service] = await Promise.all([
      getLocationBySlug(countrySlug),
      getLocationBySlug(citySlug),
      getServiceBySlug(serviceSlug),
    ]);

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
export const getLocationServicePageData = async (
  countrySlug: string,
  citySlug: string,
  serviceSlug: string,
) => {
  const { country, city, service } = await getLocationServicePageEntities(
    countrySlug,
    citySlug,
    serviceSlug,
  );

  if (!country || !city || !service) {
    return null;
  }
  const [allBusinesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);

  const results = selectBusinessesByCriteria(allBusinesses, {
    locationId: city.id,
    serviceId: service.id,
  });

  return {
    entities: { country, city, service },
    filters: { locations, services },
    results,
  };
};
