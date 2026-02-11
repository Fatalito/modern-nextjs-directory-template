import {
  getAllBusinesses,
  getAllLocations,
  getAllServices,
} from "@/app/lib/data-access";

/**
 * Fetches global data required for any directory page.
 * This function is designed to centralize the fetching of common data (all businesses, locations, and services)
 * @returns An object containing all businesses and the filters (locations and services).
 */
export const getBaseDirectoryData = async () => {
  const [allBusinesses, locations, services] = await Promise.all([
    getAllBusinesses(),
    getAllLocations(),
    getAllServices(),
  ]);

  return {
    allBusinesses,
    filters: { locations, services },
  };
};
