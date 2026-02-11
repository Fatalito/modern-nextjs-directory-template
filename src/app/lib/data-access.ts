import { cache } from "react";
import { selectAllCountries, selectCitiesByCountry } from "@/entities/location";
import {
  businessRepository,
  locationRepository,
  serviceRepository,
  userRepository,
} from "@/shared/api";

export const getAllBusinesses = cache(() => businessRepository.getAll());
export const getBusinessById = cache((id: string) =>
  businessRepository.getById(id),
);
export const getBusinessBySlug = cache((slug: string) =>
  businessRepository.getBySlug(slug),
);
/**
 * Searches businesses by optional category and/or location. If no parameters are provided, it returns all businesses.
 * @param params  - An object containing optional search parameters: category and locationId.
 * @returns A promise that resolves to an array of businesses matching the search criteria.
 */
export const searchBusinesses = cache(
  (params: { category?: string; locationId?: string }) => {
    return getAllBusinesses().then((businesses) => {
      if (!params.category && !params.locationId) return businesses;
      return businesses.filter((b) => {
        const matchCategory = params.category
          ? b.category.toLowerCase() === params.category.toLowerCase()
          : true;
        const matchLocation = params.locationId
          ? b.location.id.toLowerCase() === params.locationId.toLowerCase()
          : true;
        return matchCategory && matchLocation;
      });
    });
  },
);

export const getAllLocations = cache(() => locationRepository.getAll());
export const getLocationById = cache((id: string) =>
  locationRepository.getById(id),
);
export const getLocationBySlug = cache((slug: string) =>
  locationRepository.getBySlug(slug),
);

/**
 * Retrieves all locations of type "country".
 * @returns A promise that resolves to an array of countries.
 */
export const getAllCountries = cache(async () =>
  selectAllCountries(await getAllLocations()),
);

/**
 * Finds cities of a given country ID.
 * @param countryId - The unique identifier of the country.
 * @returns A promise that resolves to an array of cities belonging to the specified country.
 */
export const getCitiesByCountry = cache(async (countryId: string) =>
  selectCitiesByCountry(await getAllLocations(), countryId),
);

export const getAllServices = cache(() => serviceRepository.getAll());
export const getServiceById = cache((id: string) =>
  serviceRepository.getById(id),
);
export const getServiceBySlug = cache((slug: string) =>
  serviceRepository.getBySlug(slug),
);

export const getAllUsers = cache(() => userRepository.getAll());
export const getUserById = cache((id: string) => userRepository.getById(id));
