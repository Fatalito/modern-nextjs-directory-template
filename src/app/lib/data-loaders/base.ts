import type { FilterCriteria } from "@/app/lib/data-loaders/types";
import { CategoryType, filterBusinesses } from "@/entities/business";
import { getAllLocations } from "@/entities/location";
import { getAllServices } from "@/entities/service";

/**
 * Fetches global data required for any directory page.
 * This function is designed to centralize the fetching of common data (businesses, locations, and services)
 * @returns An object containing all businesses and the filters (locations, services, and categories).
 */
export const getBaseDirectoryData = async (params: FilterCriteria = {}) => {
  const [businesses, locations, services] = await Promise.all([
    filterBusinesses(params),
    getAllLocations(),
    getAllServices(),
  ]);

  return {
    businesses,
    filters: { locations, services, categories: Object.values(CategoryType) },
  };
};
