import { cache } from "react";
import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
  getServiceBySlug,
} from "@/app/lib/data-access";
import { selectBusinessesByCriteria } from "@/entities/business";

/**
 * Fetches and validates the core entities for the Service page route.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the service entity.
 *          Returns null if the entity is not found.
 */
export const getServicePageEntities = cache(async (serviceSlug: string) => {
  const service = await getServiceBySlug(serviceSlug);
  return { service };
});

/**
 * Fetches and aggregates all necessary data for the Service page route.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the entities, filters, and results for the Service page.
 *          Returns undefined if the core entity is not found.
 */
export const getServicePageData = async (serviceSlug: string) => {
  const { service } = await getServicePageEntities(serviceSlug);

  if (!service) {
    return;
  }

  const [allBusinesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);

  const results = selectBusinessesByCriteria(allBusinesses, {
    serviceId: service.id,
  });

  return {
    entities: { service },
    filters: { locations, services },
    results,
  };
};

/**
 * Generates the static paths for all services.
 */
export const getServicePageDirectoryPaths = async () => {
  const services = await getAllServices();
  return services.map((service) => ({
    service: service.slug,
  }));
};
