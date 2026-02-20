import { filterBusinesses } from "@/entities/business/server";
import { getAllLocations } from "@/entities/location/server";
import { getAllServices } from "@/entities/service/server";
import { EMPTY_FILTER } from "@/shared/lib";
import { Category, type FilterCriteria } from "@/shared/model";

/**
 * Fetches global data required for any directory page.
 * This function is designed to centralize the fetching of common data (businesses, locations, and services)
 * @returns An object containing filtered businesses filtered by the provided criteria and the filters (locations, services, and categories).
 */
export const getBaseDirectoryData = async (
  params: FilterCriteria = EMPTY_FILTER,
) => {
  const [businesses, locations, services] = await Promise.all([
    filterBusinesses(params),
    getAllLocations(),
    getAllServices(),
  ]);

  return {
    businesses,
    filters: { locations, services, categories: Category.options },
  };
};
