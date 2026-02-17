import { cache } from "react";
import { getAllServices, getServiceBySlug } from "@/entities/service";
import { loadDirectoryPageData } from "./factory";

/**
 * Fetches and validates the core entities for the Service page route.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the service entity.
 *          Returns undefined if the entity is not found.
 */
export const getServicePageEntities = cache(async (serviceSlug: string) => {
  const service = await getServiceBySlug(serviceSlug);
  if (!service) return;
  return { service };
});

/**
 * Fetches and aggregates all necessary data for the Service page route.
 * @param serviceSlug - The slug of the service.
 * @returns An object containing the entities, filters, and results for the Service page.
 *          Returns undefined if the core entity is not found.
 */
export const getServicePageData = (serviceSlug: string) => {
  return loadDirectoryPageData(
    () => getServicePageEntities(serviceSlug),
    ({ service }) => ({ serviceId: service?.id }),
  );
};

export const getServicePageDirectoryPaths = async () => {
  const services = await getAllServices();
  return services.map((service) => ({ service: service.slug }));
};
